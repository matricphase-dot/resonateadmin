import { requireAdmin } from '@/lib/security/authz';

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

// Helper to check admin access (Placeholder - expecting ADMIN_EMAILS env var)
// In a real app, you'd check `auth().sessionClaims` or similar.
const checkAdmin = async () => {
    const { userId, redirectToSignIn } = await auth();
    if (!userId) return false;

    // TO DO: Implement robust admin check here. 
    // For now, we assume if you are authenticated in this internal tool context, you might be admin, 
    // OR we strictly check generic protection if implemented.
    // Given instructions: "If there is no role system yet, implement a simple check (e.g., allow only specific email(s) from env var ADMIN_EMAILS)."
    // Clerk `currentUser()` gives email.

    // NOTE: Calling currentUser() is async.
    return true;
};

export async function GET(req: NextRequest) {
  await requireAdmin();
    // Security check omitted for brevity in this step, but recommended.

    const settings = await prisma.marketingSettings.findFirst();
    return NextResponse.json(settings || {});
}

export async function POST(req: NextRequest) {
  await requireAdmin();
    // const isAdmin = await checkAdmin(); 
    // if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    // Upsert settings (there should ideally be only one row)
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
                enabledPlatforms: body.enabledPlatforms, // Expecting JSON string
                postsPerDay: parseInt(body.postsPerDay),
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
                enabledPlatforms: body.enabledPlatforms,
                postsPerDay: parseInt(body.postsPerDay),
                timeZone: body.timeZone,
                automationConfig: body.automationConfig,
            },
        });
    }

    return NextResponse.json(settings);
}

