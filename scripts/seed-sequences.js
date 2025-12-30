
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Seeding sequences...");

    // 1. Onboarding Sequence
    const onboarding = await prisma.outreachSequence.create({
        data: {
            name: "Onboarding (Free Users)",
            triggerType: "on_signup",
            active: true,
            steps: {
                create: [
                    {
                        stepNumber: 1,
                        delayMinutes: 0,
                        subjectTemplate: "Welcome to Resonate! 🚀",
                        bodyTemplateHtml: "<p>Hi {{name}},</p><p>Welcome to Resonate! We're excited to help you build your personal brand on LinkedIn.</p><p><strong>Tip:</strong> generating your first post takes less than 10 seconds.</p><p><a href='{{app_url}}'>Get Started Now</a></p>",
                        bodyTemplateText: "Hi {{name}}, Welcome to Resonate! We're excited to help you build your personal brand on LinkedIn."
                    },
                    {
                        stepNumber: 2,
                        delayMinutes: 1440, // 1 day
                        subjectTemplate: "Your Turn: Generate your first 7 posts",
                        bodyTemplateHtml: "<p>Hi {{name}},</p><p>Consistency is key. Why not generate a week's worth of content today?</p><p><a href='{{app_url}}'>Generate Content</a></p>",
                        bodyTemplateText: "Hi {{name}}, Consistency is key. Why not generate a week's worth of content today?"
                    },
                    {
                        stepNumber: 3,
                        delayMinutes: 2880, // 2 days
                        subjectTemplate: "Unlock Pro Features 🔓",
                        bodyTemplateHtml: "<p>{{name}}, did you know Pro users get 5x more engagement?</p><p><a href='{{app_url}}/upgrade'>Upgrade Now</a></p>",
                        bodyTemplateText: "Unlock Pro Features. Pro users get 5x more engagement."
                    }
                ]
            }
        }
    });

    // 2. Re-engagement Sequence
    const reactivation = await prisma.outreachSequence.create({
        data: {
            name: "Inactive Reactivation",
            triggerType: "inactive_days",
            active: true,
            steps: {
                create: [
                    {
                        stepNumber: 1,
                        delayMinutes: 0,
                        subjectTemplate: "We miss you! 👋",
                        bodyTemplateHtml: "<p>Hi {{name}}, it's been a while. Come check out our new features!</p>",
                        bodyTemplateText: "Hi {{name}}, it's been a while."
                    }
                ]
            }
        }
    });

    console.log("✅ Seeded sequences:", onboarding.name, reactivation.name);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
