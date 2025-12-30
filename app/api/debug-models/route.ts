
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

export async function GET() {
    const results: Record<string, any> = {};

    // Test gemini-pro
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello from gemini-pro");
        results['gemini-pro'] = { success: true, response: result.response.text() };
    } catch (e: any) {
        results['gemini-pro'] = { success: false, error: e.message };
    }

    // Test gemini-1.5-flash-001
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
        const result = await model.generateContent("Hello from gemini-1.5-flash-001");
        results['gemini-1.5-flash-001'] = { success: true, response: result.response.text() };
    } catch (e: any) {
        results['gemini-1.5-flash-001'] = { success: false, error: e.message };
    }

    return NextResponse.json(results);
}
