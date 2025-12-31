import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';
import { withRetry } from '@/lib/ai-helper';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

export async function POST(request: Request) {
    try {
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const { hook } = await request.json();
        const userId = 'admin-stub';

        if (!hook) {
            return NextResponse.json({ error: 'Hook text is required' }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const prompt = `Analyze this LinkedIn post opening line (hook): "${hook}"
    Return a JSON object: { "score": number, "color": string, "badges": [], "feedback": string, "alternatives": [] }`;

        const result = await withRetry(async () => {
            return await model.generateContent(prompt);
        });
        const response = await result.response;
        let text = response.text();
        text = text.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();

        let analysis = JSON.parse(text);

        if (userId) {
            try {
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
            }
        }

        return NextResponse.json(analysis);
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to analyze hook' }, { status: 500 });
    }
}
