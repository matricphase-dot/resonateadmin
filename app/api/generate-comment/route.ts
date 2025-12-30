
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
                { error: 'Server configuration error: Google AI API Key is missing.' },
                { status: 500 }
            );
        }

        const { postContent, postAuthor } = await request.json();
        const { userId } = await auth();
        const user = await currentUser();

        let userVoiceProfile = null;
        let userStories = [];

        // Fetch user voice profile if logged in to make comments sound authentic
        if (userId && user) {
            const dbUser = await prisma.user.findUnique({
                where: { id: userId },
            });

            if (dbUser?.voiceProfile) {
                try {
                    const profile = JSON.parse(dbUser.voiceProfile);
                    userVoiceProfile = profile;
                    userStories = profile.stories || [];
                } catch (e) {
                    console.error("Error parsing voice profile", e);
                }
            }
        }

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        // Pick a random story to potentially use in the 'story' comment option
        const randomStory = userStories.length > 0 ? userStories[Math.floor(Math.random() * userStories.length)] : null;
        const tone = userVoiceProfile?.tone || 'Professional';

        const prompt = `Generate 3 smart, engaging LinkedIn comments for the following post by ${postAuthor || 'someone'}:
    
    Post: "${postContent}"

    Your Persona Tone: ${tone}

    Output JSON with 3 specific keys:
    1. "valueAdd": A comment that adds a new insight, tip, or perspective to the post.
    2. "question": A thoughtful question to spark discussion with the author.
    3. "story": A comment that briefly relates a personal experience. ${randomStory ? `Try to weave in this story if relevant: ${randomStory.title} - ${randomStory.summary}` : 'Use a generic relatable professional experience.'}

    Keep comments under 50 words. Sound human, not AI. No hashtags.
    Return only valid JSON.`;

        // Wrap generation in retry logic
        const result = await withRetry(async () => {
            return await model.generateContent(prompt);
        });

        const response = await result.response;
        let text = response.text();
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const data = JSON.parse(text);

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Comment generation error:", error);

        let errorMessage = 'Failed to generate comments';
        if (error.message && error.message.includes('404')) {
            errorMessage = 'AI Model not found or API Key invalid. Please check server configuration.';
        } else if (error.message) {
            errorMessage = error.message;
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
