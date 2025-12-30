import { requireAdmin } from '@/lib/security/authz';

import { NextRequest, NextResponse } from "next/server";
import { generateMarketingPosts } from "@/services/marketing/generator";

export const maxDuration = 300; // Allow 5 minutes for AI generation

export async function POST(req: NextRequest) {
  await requireAdmin();
    try {
        const body = await req.json();
        const { count, campaignName } = body;

        const results = await generateMarketingPosts({
            count: count ? parseInt(count) : undefined,
            campaignName,
        });

        return NextResponse.json({ success: true, count: results.length, posts: results });
    } catch (error: any) {
        console.error("Generation error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

