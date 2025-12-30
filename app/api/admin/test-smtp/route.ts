import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
    // Require bypass secret
    const secret = req.headers.get('X-Admin-Bypass-Secret');
    if (secret !== process.env.ADMIN_BYPASS_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await sendEmail({
            to: 'resonate.admin8153@protonmail.com',
            subject: '✅ ZOHO SMTP TEST - Resonate',
            html: `
        <h1>✅ Zoho SMTP Working!</h1>
        <p>From: resonateteam@zohomail.com</p>
        <p>App Password: ${process.env.SMTP_PASS?.length || 0} chars ✓</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `,
        });
        return NextResponse.json({ ...result });
    } catch (error: any) {
        console.error('TEST SMTP FAILED:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                smtpPassLength: process.env.SMTP_PASS?.length || 0
            },
            { status: 500 }
        );
    }
}
