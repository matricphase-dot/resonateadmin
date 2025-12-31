import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
    const secret = req.headers.get('X-Admin-Bypass-Secret');
    if (secret !== process.env.ADMIN_BYPASS_SECRET) {
        return NextResponse.json({ error: 'Wrong secret' }, { status: 401 });
    }

    console.log('🧪 SMTP TEST STARTED');

    try {
        const result = await sendEmail({
            to: 'resonate.admin8153@protonmail.com',
            subject: '🧪 ULTIMATE SMTP TEST - PRODUCTION',
            html: `
        <h1>🔍 SMTP Diagnostics</h1>
        <ul>
          <li>Host: ${process.env.SMTP_HOST || 'MISSING'}</li>
          <li>User: ${process.env.SMTP_USER || 'MISSING'}</li>
          <li>Pass: ${process.env.SMTP_PASS ? 'OK (' + process.env.SMTP_PASS.length + ' chars)' : 'MISSING ❌'}</li>
          <li>Env: ${process.env.NODE_ENV || 'unknown'}</li>
          <li>Time: ${new Date().toLocaleString()}</li>
        </ul>
      `,
        });

        return NextResponse.json({
            success: true,
            message: 'SMTP WORKS!',
            messageId: result.messageId,
            envCheck: {
                smtpHost: process.env.SMTP_HOST ? 'OK' : 'MISSING ❌',
                smtpUser: process.env.SMTP_USER ? 'OK' : 'MISSING ❌',
                smtpPass: process.env.SMTP_PASS ? 'OK' : 'MISSING ❌',
            }
        });

    } catch (error: any) {
        console.error('🧪 SMTP TEST FAILED:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            envVarsMissing: !process.env.SMTP_PASS ? '🚨 SET SMTP_PASS IN VERCEL DASHBOARD' : 'false',
            vercelFix: 'Go to Vercel → Project → Settings → Environment Variables → Add SMTP vars'
        }, { status: 500 });
    }
}
