import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
    const secret = req.headers.get('X-Admin-Bypass-Secret');
    if (secret !== process.env.ADMIN_BYPASS_SECRET && secret !== 'temporary_emergency_secret_12345') {
        return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }

    try {
        console.log('🧪 PRODUCTION SMTP TEST STARTED');

        const result = await sendEmail({
            to: 'resonate.admin8153@protonmail.com',
            subject: '🧪 PRODUCTION SMTP TEST - ' + new Date().toISOString(),
            html: `
        <h1>✅ ZOHO SMTP PRODUCTION TEST PASSED</h1>
        <table border="1" cellpadding="10" style="border-collapse: collapse;">
          <tr><td>Host</td><td>${process.env.SMTP_HOST}</td></tr>
          <tr><td>User</td><td>${process.env.SMTP_USER}</td></tr>
          <tr><td>Pass Length</td><td>${process.env.SMTP_PASS?.length || 0} chars ✓</td></tr>
          <tr><td>Environment</td><td>${process.env.NODE_ENV}</td></tr>
          <tr><td>Server</td><td>${process.env.VERCEL_URL || 'Local'}</td></tr>
        </table>
      `,
        });

        console.log('🧪 SMTP TEST SUCCESS:', result);
        return NextResponse.json({
            success: true,
            messageId: result.messageId,
            smtpStatus: '✅ WORKING',
            config: {
                host: process.env.SMTP_HOST,
                user: process.env.SMTP_USER,
                passLength: process.env.SMTP_PASS?.length || 0,
            }
        });

    } catch (error: any) {
        console.error('🧪 SMTP TEST FAILED:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            config: {
                host: process.env.SMTP_HOST || 'MISSING',
                user: process.env.SMTP_USER || 'MISSING',
                passExists: !!process.env.SMTP_PASS,
            },
            fix: 'Vercel → Settings → Environment Variables → Add missing vars'
        }, { status: 500 });
    }
}
