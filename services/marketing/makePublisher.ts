
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface MakePayload {
    postId: string;
    platform: string;
    content: string;
    trackingUrl: string;
    scheduledAt: string;
    metadata: {
        campaign: string | null;
        primaryWebsiteUrl: string;
    };
}

export async function sendPostToMake(post: any, settings: any) {
    // 1. Resolve Configuration
    let webhookUrl = process.env.MAKE_SOCIAL_POST_WEBHOOK_URL;

    // Check DB overrides
    if (settings.automationConfig) {
        try {
            const config = JSON.parse(settings.automationConfig);
            if (config.webhookUrl) webhookUrl = config.webhookUrl;
        } catch (e) {
            console.error("Invalid automation config JSON", e);
        }
    }

    if (!webhookUrl) {
        throw new Error("No Make.com Webhook URL configured (Env or Settings).");
    }

    // 2. Build Payload
    const trackingUrl = `${settings.primaryWebsiteUrl || "https://resonate.app"}/r/${post.id}`;

    // Ensure content has tracking link if it's not already there (optional policy)
    // User didn't strictly ask to append it if missing, but "content of the post with URL included" hints at it.
    // We already have logic in generator to include it. Let's send what's in DB.

    const payload: MakePayload = {
        postId: post.id,
        platform: post.platform,
        content: post.content,
        trackingUrl: trackingUrl,
        scheduledAt: post.scheduledAt ? new Date(post.scheduledAt).toISOString() : new Date().toISOString(),
        metadata: {
            campaign: post.utmCampaign || null,
            primaryWebsiteUrl: settings.primaryWebsiteUrl
        }
    };

    // 3. Send Request
    console.log(`Sending post ${post.id} to Make: ${webhookUrl}`);

    try {
        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Make Webhook failed: ${response.status} ${response.statusText}`);
        }

        // 4. Update Status (Option 2: remoteStatus)
        // We do typically await this because if it fails, we want to know.
        await prisma.marketingPost.update({
            where: { id: post.id },
            data: {
                // status remains 'scheduled' (or could switch to 'processing' if we had it)
                // kept as scheduled so it doesn't get picked up again immediately?
                // The cron job must exclude posts with remoteStatus='sent_to_make' if status is still scheduled!
                remoteStatus: "sent_to_make",
                errorMessage: null
            }
        });

        return true;

    } catch (error: any) {
        console.error("Make Send Error:", error);

        await prisma.marketingPost.update({
            where: { id: post.id },
            data: {
                status: "failed",
                errorMessage: `Make Error: ${error.message}`
            }
        });

        throw error;
    }
}
