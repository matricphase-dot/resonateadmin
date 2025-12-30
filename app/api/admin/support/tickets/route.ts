import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/security/authz';
import { sendEmail } from '@/lib/email';
import { z } from 'zod';

export async function GET(request: Request) {
    const admin = await requireAdmin();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    const where: any = {};
    if (status && status !== 'all') where.status = status;
    if (priority && priority !== 'all') where.priority = priority;

    try {
        const tickets = await prisma.supportTicket.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                email: true,
                subject: true,
                status: true,
                priority: true,
                createdAt: true,
                updatedAt: true,
            }
        });
        return NextResponse.json(tickets);
    } catch (error) {
        console.error("Error fetching tickets:", error);
        return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    // Admin manually creating a ticket or similar
    const admin = await requireAdmin();
    const body = await request.json();
    const ticket = await prisma.supportTicket.create({ data: { ...body, status: 'open' } });
    return NextResponse.json(ticket);
}
