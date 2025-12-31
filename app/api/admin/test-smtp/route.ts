import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
    const secret = req.headers.get('X-Admin-Bypass-Secret');
    if (secret !== process.env.ADMIN_BYPASS_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await sendEmail({
            to: 'resonate.admin8153@protonmail.com',
            subject: '🧪 PRODUCTION SMTP TEST',
            html: `
        <h1>✅ ZOHO SMTP PRODUCTION TEST</h1>
        <p>Site: ${process.env.APP_BASE_URL}</p>
        <p>Env: ${process.env.NODE_ENV}</p>
        <p>Password length: ${process.env.SMTP_PASS?.length || 0} chars</p>
        <p>Time: ${new Date().toISOString()}</p>
      `,
        });

        return NextResponse.json({
            success: true,
            messageId: result.messageId,
            smtpStatus: 'working'
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
            smtpPassLength: process.env.SMTP_PASS?.length || 0
        }, { status: 500 });
    }
}
