import { requireAdmin } from '@/lib/security/authz';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { User } from '@prisma/client';

export async function POST(req: NextRequest) {
  await requireAdmin();
    try {
        // 1. Fetch all users (in flexible chunks if many, but here all at once is fine for start)
        const users = await prisma.user.findMany();

        let syncedCount = 0;
        let errors = 0;

        for (const user of users) {
            try {
                // 2. Upsert into Lead
                await prisma.lead.upsert({
                    where: { email: user.email },
                    update: {
                        userId: user.id,
                        // If they are already a lead, we might not want to overwrite status if meaningful
                        // But ensuring userId is linked is good.
                    },
                    create: {
                        email: user.email,
                        userId: user.id,
                        source: 'signup',
                        status: 'new',
                        name: null, // We might not have name in User table based on schema inspection
                    }
                });
                syncedCount++;
            } catch (e) {
                console.error(`Failed to sync user ${user.email}`, e);
                errors++;
            }
        }

        return NextResponse.json({
            success: true,
            synced: syncedCount,
            errors
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

