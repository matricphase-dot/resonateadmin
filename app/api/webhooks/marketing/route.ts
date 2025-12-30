import { requireWebhook } from '@/lib/security/authz';

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  await requireWebhook(req);
    try {
        const body = await req.json();
        const { postId, status, errorMessage, secret } = body;

        // 1. Verify Secret
        const envSecret = process.env.MAKE_SOCIAL_CALLBACK_SECRET;
        let dbSecret = null;

        // Fetch settings to check DB secret
        const settings = await prisma.marketingSettings.findFirst();
        if (settings?.automationConfig) {
            try {
                const config = JSON.parse(settings.automationConfig);
                if (config.secret) dbSecret = config.secret;
            } catch { }
        }

        const validSecret = dbSecret || envSecret;

        if (validSecret && secret !== validSecret) {
            return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
        }

        if (!postId) {
            return NextResponse.json({ error: "postId required" }, { status: 400 });
        }

        // 2. Update Post
        if (status === "published") {
            await prisma.marketingPost.update({
                where: { id: postId },
                data: {
                    status: "published",
                    publishedAt: new Date(),
                    remoteStatus: "confirmed_published",
                    errorMessage: null
                }
            });
        } else if (status === "failed") {
            await prisma.marketingPost.update({
                where: { id: postId },
                data: {
                    status: "failed",
                    remoteStatus: "callback_failed",
                    errorMessage: errorMessage || "Unknown callback error"
                }
            });
        } else {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        return NextResponse.json({ ok: true });

    } catch (error: any) {
        console.error("Callback Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

