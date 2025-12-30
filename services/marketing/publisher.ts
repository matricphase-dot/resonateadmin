
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface SocialPostPayload {
    platform: string;
    content: string;
}

export async function publishPost(postId: string) {
    // 1. Fetch the post
    const post = await prisma.marketingPost.findUnique({
        where: { id: postId },
    });

    if (!post) {
        throw new Error("Post not found");
    }

    if (post.status === "published") {
        // Already published, maybe just return or throw?
        return post;
    }

    const webhookUrl = process.env.SOCIAL_POST_WEBHOOK_URL;

    try {
        const isManualPlatform = ["reddit", "youtube_script", "youtube"].includes(post.platform);

        if (webhookUrl && !isManualPlatform) {
            // 2a. Send to Webhook (e.g., n8n, Zapier)
            const payload: SocialPostPayload = {
                platform: post.platform,
                content: post.content,
            };

            const response = await fetch(webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Webhook failed with status ${response.status}`);
            }
        } else {
            // 2b. Mock Publish (Log to console) or Manual Platform
            console.log(`[${isManualPlatform ? 'MANUAL MARKED' : 'MOCK PUBLISH'}] Platform: ${post.platform} | Content: ${post.content}`);
        }

        // 3. Update Status on Success
        const updatedPost = await prisma.marketingPost.update({
            where: { id: postId },
            data: {
                status: "published",
                publishedAt: new Date(),
                errorMessage: null,
            },
        });

        return updatedPost;

    } catch (error: any) {
        console.error("Publishing error:", error);

        // 4. Update Status on Failure
        const failedPost = await prisma.marketingPost.update({
            where: { id: postId },
            data: {
                status: "failed",
                errorMessage: error.message || "Unknown error",
            },
        });

        throw error;
    }
}
