import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/security/authz';
import { sendEmail } from '@/lib/email';
import { z } from 'zod';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const body = await request.json();

    const schema = z.object({
        message: z.string().min(1),
    });

    const validation = schema.safeParse(body);
    if (!validation.success) return NextResponse.json({ error: validation.error }, { status: 400 });

    const { message } = validation.data;

    const ticket = await prisma.supportTicket.findUnique({ where: { id } });
    if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    try {
        // 1. Send Email (throws on failure)
        await sendEmail({
            to: ticket.email,
            subject: `Re: ${ticket.subject} (Ticket #${ticket.id.slice(0, 8)})`,
            html: `
                <p>${message.replace(/\n/g, '<br>')}</p>
                <br>
                <hr>
                <small>You can reply to this email to continue the conversation.</small>
            `,
        });

        // 2. Update Ticket
        await prisma.supportTicket.update({
            where: { id },
            data: {
                status: 'in_progress',
                events: {
                    create: {
                        eventType: 'admin_replied',
                        actor: `admin:${admin.email}`,
                        message: message
                    }
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
