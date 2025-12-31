import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';
import { withRetry } from '@/lib/ai-helper';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

export async function POST(request: Request) {
    try {
        const { sourceText, url } = await request.json();
        const userId = 'admin-stub';

        // Trial/Plan logic bypassed for admin build
        const dbUser = await prisma.user.findUnique({ where: { id: userId } });
        if (dbUser) {
            // Logic preserved but using stub
        }

        if (!sourceText && !url) {
            return NextResponse.json({ error: 'Text or URL is required' }, { status: 400 });
        }

        let textToProcess = sourceText;
        if (url && !sourceText) {
            textToProcess = `Content from ${url}`;
        }

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `Repurpose the following content into LinkedIn formats:
    Content: "${textToProcess.substring(0, 5000)}"

    Output JSON with 3 keys:
    1. "thread": A twitter/linkedin thread (array of strings).
    2. "carousel": Outline for a document carousel (array of objects with "title" and "content").
    3. "question": An engaging discussion question based on the content.

    Return JSON only.`;

        const result = await withRetry(async () => {
            return await model.generateContent(prompt);
        });
        const response = await result.response;
        let text = response.text();
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error("JSON parse error:", text);
            throw new Error("Invalid JSON from AI");
        }

        if (!data.thread || !Array.isArray(data.thread)) data.thread = [];
        if (!data.carousel || !Array.isArray(data.carousel)) data.carousel = [];
        if (!data.question) data.question = "could not generate question";

        return NextResponse.json(data);
    } catch (error) {
        console.error("Repurpose error:", error);
        return NextResponse.json(
            { error: 'Failed to repurpose content' },
            { status: 500 }
        );
    }
}
