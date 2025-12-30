import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { withRetry } from '@/lib/ai-helper';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

export async function POST(request: Request) {
    try {
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            console.error("GOOGLE_GENERATIVE_AI_API_KEY is missing");
            return NextResponse.json(
                { error: 'Server configuration error: API key missing' },
                { status: 500 }
            );
        }

        const { hook } = await request.json();
        const { userId } = await auth();

        if (!hook) {
            return NextResponse.json({ error: 'Hook text is required' }, { status: 400 });
        }

        if (userId) {
            const dbUser = await prisma.user.findUnique({ where: { id: userId } });
            if (dbUser) {
                const ONE_DAY = 24 * 60 * 60 * 1000;
                const daysSinceCreation = Math.floor((Date.now() - new Date(dbUser.createdAt).getTime()) / ONE_DAY);
                const isTrialActive = daysSinceCreation < 14;
                const isPro = dbUser.plan === 'PRO' || dbUser.plan === 'BUSINESS';

                if (!isTrialActive && !isPro) {
                    return NextResponse.json(
                        { error: 'Viral Hook Engine is a Pro feature. Please upgrade.' },
                        { status: 403 }
                    );
                }
            }
        }

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `Analyze this LinkedIn post opening line (hook): "${hook}"

    Return a JSON object with the following structure (do not include markdown formatting):
    {
      "score": number (1-10),
      "color": "green" | "yellow" | "red",
      "badges": ["string (e.g., Curiosity gap detected, Emotional trigger present, Question fatigue warning, Generic opening detected)"],
      "feedback": "string (Why this score?)",
      "alternatives": ["string (Alternative hook 1)", "string (Alternative hook 2)", "string (Alternative hook 3)"]
    }

    Scoring criteria:
    - 8-10 (Green): High curiosity, strong emotion, or specific benefit.
    - 5-7 (Yellow): Good but could be sharper.
    - 1-4 (Red): Generic, boring, or too long.`;

        const result = await withRetry(async () => {
            return await model.generateContent(prompt);
        });
        const response = await result.response;
        let text = response.text();

        // Clean up markdown code blocks if present (handle ```json and ```)
        text = text.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();

        let analysis;
        try {
            analysis = JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse LLM response:", text);
            return NextResponse.json(
                { error: 'Failed to parse AI response. Please try again.' },
                { status: 500 }
            );
        }

        // Save to DB if logged in
        if (userId) {
            try {
                // Ensure user exists in DB first (upsert)
                await prisma.user.upsert({
                    where: { id: userId },
                    update: {},
                    create: { id: userId, email: (await currentUser())?.emailAddresses[0]?.emailAddress || 'unknown' },
                });

                await prisma.hookAnalysis.create({
                    data: {
                        hookText: hook,
                        score: analysis.score,
                        feedback: JSON.stringify(analysis),
                        userId: userId,
                    },
                });
            } catch (dbError) {
                console.error("Database error saving analysis:", dbError);
                // Don't fail the request if saving to DB fails, just log it
            }
        }

        return NextResponse.json(analysis);
    } catch (error: any) {
        console.error("Hook analysis error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to analyze hook' },
            { status: 500 }
        );
    }
}
