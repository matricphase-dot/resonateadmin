import { requireCron } from '@/lib/security/authz';

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateMarketingPosts } from "@/services/marketing/generator";
import { publishPost } from "@/services/marketing/publisher";
import { sendPostToMake } from "@/services/marketing/makePublisher";

const prisma = new PrismaClient();

export const maxDuration = 300; // 5 minutes

export async function GET(req: NextRequest) {
  requireCron(req);
    // Check CRON_SECRET if desired
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const logs: string[] = [];

    try {
        const settings = await prisma.marketingSettings.findFirst();
        if (!settings) {
            return NextResponse.json({ error: "No settings found" });
        }

        const postsPerDay = settings.postsPerDay || 3;
        const platforms = JSON.parse(settings.enabledPlatforms);

        // 1. Maintain Draft Buffer
        for (const platform of platforms) {
            const draftCount = await prisma.marketingPost.count({
                where: { platform, status: "draft" },
            });

            logs.push(`${platform}: Found ${draftCount} drafts.`);

            if (draftCount < postsPerDay * 3) { // Keep 3 days buffer
                logs.push(`${platform}: Generating more drafts...`);
                await generateMarketingPosts({
                    count: postsPerDay * 2,
                    platforms: [platform],
                    campaignName: `auto-${new Date().toISOString().split("T")[0]}`
                });
            }
        }

        // 2. Schedule Today's Posts (if not enough scheduled)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        for (const platform of platforms) {
            const scheduledToday = await prisma.marketingPost.count({
                where: {
                    platform,
                    status: "scheduled",
                    scheduledAt: { gte: todayStart, lte: todayEnd },
                },
            });

            if (scheduledToday < postsPerDay) {
                const needed = postsPerDay - scheduledToday;
                logs.push(`${platform}: Scheduling ${needed} posts for today.`);

                const drafts = await prisma.marketingPost.findMany({
                    where: { platform, status: "draft" },
                    take: needed,
                });

                // Distribute times (simple logic: start at 9am, every 3 hours)
                let hour = 9;
                for (const draft of drafts) {
                    const scheduleTime = new Date();
                    scheduleTime.setHours(hour, 0, 0, 0);

                    // If time passed, set for next hour? Or just now? 
                    // For simplicity, if passed, set to now + 5 mins
                    if (scheduleTime < new Date()) {
                        scheduleTime.setTime(Date.now() + 5 * 60 * 1000); // 5 mins from now
                    }

                    await prisma.marketingPost.update({
                        where: { id: draft.id },
                        data: { status: "scheduled", scheduledAt: scheduleTime },
                    });
                    hour += 3;
                }
            }
        }

        // 3. Publish Due Posts
        const now = new Date();
        const duePosts = await prisma.marketingPost.findMany({
            where: {
                status: "scheduled",
                scheduledAt: { lte: now },
            },
        });

        logs.push(`Found ${duePosts.length} due posts.`);

        for (const post of duePosts) {
            try {
                // Use generic publisher which now supports Make logic if configured,
                // BUT the prompt asked to call `sendPostToMake` directly for scheduled posts.
                // However, `publisher.ts` was the old one. We created `makePublisher.ts`.
                // Let's import it.
                // We should check if we should default to Make?
                const isManual = ["reddit", "youtube_script", "youtube"].includes(post.platform);

                if (!isManual) {
                    await sendPostToMake(post, settings);
                    logs.push(`Sent post ${post.id} to Make`);
                } else {
                    // Keep old Manual behavior
                    await publishPost(post.id);
                    logs.push(`Processed manual/mock post ${post.id}`);
                }

            } catch (err: any) {
                logs.push(`Failed to publish post ${post.id}: ${err.message}`);
            }
        }

        return NextResponse.json({ success: true, logs });

    } catch (error: any) {
        console.error("Cron job error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

