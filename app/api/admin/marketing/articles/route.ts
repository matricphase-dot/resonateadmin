import { requireAdmin } from '@/lib/security/authz';

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateMarketingArticle } from "@/services/marketing/articleGenerator";

const prisma = new PrismaClient();

// GET: List articles
export async function GET(req: NextRequest) {
  await requireAdmin();
    const articles = await prisma.marketingArticle.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
    });
    return NextResponse.json(articles);
}

// POST: Generate or Create Article
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  await requireAdmin();
    try {
        const body = await req.json();

        // If request has 'topic', generate it
        if (body.topic) {
            const article = await generateMarketingArticle({
                platform: body.platform || "medium",
                topic: body.topic, // topic
            });
            return NextResponse.json(article);
        }

        // Manual create or update logic could go here
        return NextResponse.json({ error: "Topic required for generation" }, { status: 400 });

    } catch (error: any) {
        console.error("Article error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT: Update status
export async function PUT(req: NextRequest) {
  await requireAdmin();
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const updated = await prisma.marketingArticle.update({
        where: { id: body.id },
        data: {
            status: body.status,
            targetUrl: body.targetUrl,
        }
    });
    return NextResponse.json(updated);
}

