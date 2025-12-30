
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const UNSUBSCRIBE_SECRET = process.env.UNSUBSCRIBE_SECRET || 'insecure_default';

export async function POST(req: NextRequest) {
    try {
        const { leadId, token } = await req.json();

        if (!leadId || !token) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        // Verify Token
        const data = `${leadId}:${UNSUBSCRIBE_SECRET}`;
        const expectedToken = crypto.createHash('sha256').update(data).digest('hex');

        if (token !== expectedToken) {
            return NextResponse.json({ error: "Invalid token" }, { status: 403 });
        }

        // Update Status
        await prisma.lead.update({
            where: { id: leadId },
            data: { status: 'unsubscribed' }
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
