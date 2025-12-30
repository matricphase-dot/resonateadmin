import { requireAdmin } from '@/lib/security/authz';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  await requireAdmin();
    try {
        const events = await prisma.outreachEvent.findMany({
            include: {
                lead: { select: { email: true } },
                sequence: { select: { name: true } },
                step: { select: { stepNumber: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        return NextResponse.json(events);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

