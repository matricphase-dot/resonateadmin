import { requireAdmin } from '@/lib/security/authz';

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  await requireAdmin();
    try {
        // 1. Clicks per Platform (Last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const clicks = await prisma.marketingClick.findMany({
            where: { clickedAt: { gte: thirtyDaysAgo } },
            include: { post: { select: { platform: true } } },
        });

        const clicksByPlatform: Record<string, number> = {};
        clicks.forEach(c => {
            const p = c.post?.platform || "unknown";
            clicksByPlatform[p] = (clicksByPlatform[p] || 0) + 1;
        });

        // 2. Top Performing Posts
        // Group by postId ... Prisma doesn't support easy "groupBy with relations" in one go perfectly for sorting 
        // without some raw query or post-processing.
        // Let's do raw query for efficiency or simple aggregation if small scale.
        // Simple approach: Get top posts by click count

        // Using prisma groupBy
        const topPostsGroup = await prisma.marketingClick.groupBy({
            by: ['postId'],
            _count: { postId: true },
            orderBy: { _count: { postId: 'desc' } },
            take: 10,
        });

        // Hydrate post details
        const topPosts = await Promise.all(topPostsGroup.map(async (item) => {
            const post = await prisma.marketingPost.findUnique({
                where: { id: item.postId },
                select: { content: true, platform: true, createdAt: true }
            });
            return {
                ...post,
                clickCount: item._count.postId,
            };
        }));

        return NextResponse.json({
            clicksByPlatform,
            topPosts
        });

    } catch (error) {
        console.error("Analytics error", error);
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }
}

