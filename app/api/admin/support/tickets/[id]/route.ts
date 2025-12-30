import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/security/authz';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    await requireAdmin();
    const { id } = await context.params;

    const ticket = await prisma.supportTicket.findUnique({
        where: { id },
        include: {
            events: {
                orderBy: { createdAt: 'asc' }
            }
        }
    });

    if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(ticket);
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const { status, priority } = await request.json();

    const data: any = {};
    if (status) data.status = status;
    if (priority) data.priority = priority;

    const ticket = await prisma.supportTicket.update({
        where: { id },
        data: {
            ...data,
            events: {
                create: {
                    eventType: 'status_changed',
                    actor: `admin:${admin.email}`,
                    message: `Status: ${status}, Priority: ${priority}`
                }
            }
        }
    });

    return NextResponse.json(ticket);
}
