import { requireAdmin } from '@/lib/security/authz';
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { getCurrentAdmin } from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
    await requireAdmin();
    try {
        const admin = await getCurrentAdmin();
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { email } = await req.json(); // Admin can specify email or default to their own
        const targetEmail = email || admin.email;

        const result = await sendEmail({
            to: targetEmail,
            subject: "Test Email from Resonate",
            html: "<h1>It Works!</h1><p>This is a test email sent from the Resonate Admin Dashboard via Zoho Mail.</p>"
        });

        return NextResponse.json({ message: `Sent to ${targetEmail}`, ...result });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
