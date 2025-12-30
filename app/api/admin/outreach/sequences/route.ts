import { requireAdmin } from '@/lib/security/authz';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  await requireAdmin();
    try {
        const sequences = await prisma.outreachSequence.findMany({
            include: { steps: true },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(sequences);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
  await requireAdmin();
    try {
        const body = await req.json();
        // Basic creation logic - expandable
        const sequence = await prisma.outreachSequence.create({
            data: {
                name: body.name,
                triggerType: body.triggerType,
                active: true,
                steps: {
                    create: body.steps
                }
            }
        });
        return NextResponse.json(sequence);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

