
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

interface ArticleOptions {
    platform: string; // medium, devto, etc.
    topic: string;
}

export async function generateMarketingArticle(options: ArticleOptions) {
    const settings = await prisma.marketingSettings.findFirst();

    if (!settings) {
        throw new Error("Settings not found");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    You are an expert technical writer for the product "${settings.productName}".
    Product Stats: ${settings.productDescription}
    Target Audience: ${settings.targetAudience}
    Brand Voice: ${settings.brandVoice}

    Task: Write a complete, high-quality blog post for ${options.platform} about "${options.topic}".
    
    Structure:
    1. Catchy Title (H1)
    2. Introduction (Hook the reader, state the problem)
    3. Body Paragraphs (Practical advice, step-by-step, or insights. Use H2/H3)
    4. Conclusion & CTA (Naturally recommend checking out ${settings.productName} at ${process.env.NEXT_PUBLIC_APP_URL || settings.primaryWebsiteUrl})

    Format: return ONLY the Markdown content. Start with the Title as # Title.
    Do not wrap in \`\`\`markdown code blocks.
  `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text().trim();

    // Extract Title (Simple assumption: first line is # Title)
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : options.topic;

    // Create slug from title
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    const article = await prisma.marketingArticle.create({
        data: {
            title,
            slug: `${slug}-${Date.now()}`, // Ensure uniqueness
            platform: options.platform,
            content,
            status: "draft",
        },
    });

    return article;
}
