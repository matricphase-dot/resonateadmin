import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { orderCreationId, razorpayPaymentId, razorpaySignature, plan } = await req.json();
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const signature = orderCreationId + "|" + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
            .update(signature.toString())
            .digest("hex");

        if (expectedSignature !== razorpaySignature) {
            return NextResponse.json({ error: 'Invalid Payment Signature' }, { status: 400 });
        }

        // Determine plan code
        let planCode = 'FREE';
        if (plan === 'Pro Creator') planCode = 'PRO';
        if (plan === 'Business') planCode = 'BUSINESS';

        // Update User
        await prisma.user.upsert({
            where: { id: userId },
            update: {
                plan: planCode,
                subscriptionDate: new Date(),
            },
            create: {
                id: userId,
                email: 'unknown@example.com', // Should be handled by webhook ideally or earlier flow
                plan: planCode,
                subscriptionDate: new Date(),
            }
        });

        return NextResponse.json({ success: true, plan: planCode });
    } catch (error) {
        console.error("Payment Verification Error:", error);
        return NextResponse.json({ error: 'Verification Failed' }, { status: 500 });
    }
}
