import { requireAdmin } from '@/lib/security/authz';
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        await requireAdmin();
        const settings = await prisma.marketingSettings.findFirst();
        return NextResponse.json(settings || {});
    } catch (err) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await requireAdmin();
        const body = await req.json();

        const existing = await prisma.marketingSettings.findFirst();

        let settings;
        if (existing) {
            settings = await prisma.marketingSettings.update({
                where: { id: existing.id },
                data: {
                    productName: body.productName,
                    productDescription: body.productDescription,
                    targetAudience: body.targetAudience,
                    brandVoice: body.brandVoice,
                    primaryWebsiteUrl: body.primaryWebsiteUrl,
                    enabledPlatforms: body.enabledPlatforms,
                    postsPerDay: parseInt(body.postsPerDay) || 1,
                    timeZone: body.timeZone,
                    automationConfig: body.automationConfig,
                },
            });
        } else {
            settings = await prisma.marketingSettings.create({
                data: {
                    productName: body.productName,
                    productDescription: body.productDescription,
                    targetAudience: body.targetAudience,
                    brandVoice: body.brandVoice,
                    primaryWebsiteUrl: body.primaryWebsiteUrl,
                    enabledPlatforms: body.enabledPlatforms || "[]",
                    postsPerDay: parseInt(body.postsPerDay) || 1,
                    timeZone: body.timeZone || "UTC",
                    automationConfig: body.automationConfig || "{}",
                },
            });
        }

        return NextResponse.json(settings);
    } catch (err) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}
