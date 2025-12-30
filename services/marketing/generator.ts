
import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Initialize Gemini (assuming API key is in env)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

interface GenerateOptions {
    count?: number;
    platforms?: string[]; // e.g., ["linkedin", "twitter"]
    campaignName?: string;
}

export async function generateMarketingPosts(options: GenerateOptions) {
    // 1. Fetch Settings
    const settings = await prisma.marketingSettings.findFirst();

    if (!settings) {
        throw new Error("Marketing settings not found. Please configure settings first.");
    }

    const platformsToGenerate = options.platforms || JSON.parse(settings.enabledPlatforms);
    const countPerPlatform = options.count || 3;
    const campaign = options.campaignName || `auto-${new Date().toISOString().split("T")[0]}`;

    const generatedPosts = [];

    // 2. Iterate per platform and generate
    for (const platform of platformsToGenerate) {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      You are an expert social media manager for the product "${settings.productName}".
      
      Product Description:
      ${settings.productDescription}

      Target Audience:
      ${settings.targetAudience}

      Brand Voice:
      ${settings.brandVoice}

      Goal:
      Generate ${countPerPlatform} distinct, high-quality social media posts for ${platform}.
      The posts should be engaging, professional, and naturally lead the user to check out the product.
      
      IMPORTANT: Instead of using the direct URL, assume a placeholder tracking link will be used. 
      Use "${process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com"}/r/{unique_id}" as the call to action link structure if you need to perform specific link placement, 
      BUT simplest is to just output the text and I will append the link.
      
      ACTUALLY: The system will automatically append a tracking link to your post.
      So rewrite your goal: Create content that drives curiosity to the *link in bio* or *link below*. 
      Do NOT include the raw URL ${settings.primaryWebsiteUrl} in the text.
      Instead, refer to "the link below" or "check it out here: {{LINK}}" (I will replace {{LINK}}).

      ${platform === 'linkedin' ?
                "Style: Narrative, professional, value-driven. Use short paragraphs. No cringey hashtags." :
                platform === 'twitter' ?
                    "Style: Punchy, concise, thread-style if needed. Under 280 chars if possible." :
                    platform === 'reddit' ?
                        "Style: Helpful, non-spammy answer or discussion starter. Address a problem like 'writing LinkedIn posts is hard'. Do NOT sound corporate. Sound like a helpful peer. Include the link at the end as a 'Check this tool out' recommendation." :
                        "Style (YouTube Script): Short video outline. Hook -> Value/Body -> Call to Action. Script format."}

      Output Format:
      Return ONLY a raw JSON array of strings. Do not use markdown code blocks. 
      Example: ["Post 1 content... check it out: {{LINK}}", "Post 2..."]
    `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();

            // Clean up markdown code blocks if present
            text = text.replace(/```json/g, "").replace(/```/g, "").trim();

            const postsContent: string[] = JSON.parse(text);

            // Save drafts
            for (const rawContent of postsContent) {
                // Create DB record first to get ID
                const post = await prisma.marketingPost.create({
                    data: {
                        platform,
                        content: "Temp content...", // Update after
                        status: "draft",
                        utmCampaign: campaign,
                    },
                });

                // Construct Tracking URL
                // In dev, assume localhost if env not set
                const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
                const trackingUrl = `${baseUrl}/r/${post.id}`;

                // Replace {{LINK}} or append if missing
                let finalContent = rawContent;
                if (finalContent.includes("{{LINK}}")) {
                    finalContent = finalContent.replace("{{LINK}}", trackingUrl);
                } else {
                    finalContent = `${finalContent}\n\n${trackingUrl}`;
                }

                // Update post with final content
                await prisma.marketingPost.update({
                    where: { id: post.id },
                    data: { content: finalContent }
                });

                generatedPosts.push(post);
            }

        } catch (error) {
            console.error(`Failed to generate for ${platform}:`, error);
            // We continue to next platform even if one fails
        }
    }

    return generatedPosts;
}
