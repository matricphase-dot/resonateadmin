import { requireAdmin } from '@/lib/security/authz';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmailTemplate } from '@/lib/email';
import crypto from 'crypto';

// Secret for unsubscribe tokens
const UNSUBSCRIBE_SECRET = process.env.UNSUBSCRIBE_SECRET || 'insecure_default';
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000';

function generateUnsubscribeLink(leadId: string) {
    const data = `${leadId}:${UNSUBSCRIBE_SECRET}`;
    const token = crypto.createHash('sha256').update(data).digest('hex');
    return `${APP_BASE_URL}/unsubscribe?leadId=${leadId}&token=${token}`;
}

export async function GET(req: NextRequest) {
    await requireAdmin();

    try {
        const now = new Date();

        // 1. Find queued events ready to send
        const events = await prisma.outreachEvent.findMany({
            where: {
                eventType: 'queued',
                plannedSendAt: {
                    lte: now
                }
            },
            include: {
                lead: true,
                step: true
            },
            take: 50 // Batch size
        });

        const results = [];

        for (const event of events) {
            const { lead, step } = event;

            // Check if lead is still active for outreach
            if (lead.status === 'unsubscribed' || lead.status === 'inactive') {
                await prisma.outreachEvent.update({
                    where: { id: event.id },
                    data: {
                        eventType: 'failed',
                        errorMessage: `Lead status is ${lead.status}`,
                        sentAt: new Date() // Mark processed
                    }
                });
                results.push({ id: event.id, status: 'skipped', reason: lead.status });
                continue;
            }

            try {
                const unsubscribeLink = generateUnsubscribeLink(lead.id);

                const variables = {
                    name: lead.name || 'there',
                    email: lead.email,
                    app_url: APP_BASE_URL,
                    product_name: process.env.EMAIL_FROM_NAME || 'Resonate',
                    unsubscribe_link: unsubscribeLink
                };

                // Send Email (throws on failure)
                await sendEmailTemplate({
                    to: lead.email,
                    subjectTemplate: step.subjectTemplate,
                    htmlTemplate: step.bodyTemplateHtml,
                    textTemplate: step.bodyTemplateText || undefined,
                    variables
                });

                await prisma.outreachEvent.update({
                    where: { id: event.id },
                    data: {
                        eventType: 'sent',
                        sentAt: new Date()
                    }
                });
                results.push({ id: event.id, status: 'sent' });

            } catch (error: any) {
                await prisma.outreachEvent.update({
                    where: { id: event.id },
                    data: {
                        eventType: 'failed',
                        errorMessage: error.message,
                        sentAt: new Date()
                    }
                });
                results.push({ id: event.id, status: 'failed', error: error.message });
            }
        }

        return NextResponse.json({ success: true, processed: results.length, results });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
