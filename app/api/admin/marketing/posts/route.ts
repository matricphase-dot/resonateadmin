import { requireAdmin } from '@/lib/security/authz';

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  await requireAdmin();
    // Simple listing, could add pagination/filters later
    const posts = await prisma.marketingPost.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
    });
    return NextResponse.json(posts);
}

