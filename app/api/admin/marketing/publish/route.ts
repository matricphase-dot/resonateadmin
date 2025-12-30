import { requireAdmin } from '@/lib/security/authz';

import { NextRequest, NextResponse } from "next/server";
import { publishPost } from "@/services/marketing/publisher";

export async function POST(req: NextRequest) {
  await requireAdmin();
    try {
        const body = await req.json();
        const { postId } = body;

        if (!postId) {
            return NextResponse.json({ error: "postId is required" }, { status: 400 });
        }

        const result = await publishPost(postId);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Publishing error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

