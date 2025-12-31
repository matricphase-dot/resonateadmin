import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        smtp: {
            host: process.env.SMTP_HOST || '🚨 MISSING',
            port: process.env.SMTP_PORT || '🚨 MISSING',
            user: process.env.SMTP_USER || '🚨 MISSING',
            pass: process.env.SMTP_PASS ? '✅ SET' : '🚨 CRITICAL - ADD NOW!',
            from: process.env.EMAIL_FROM_ADDRESS || '🚨 MISSING',
        },
        fix: {
            vercelUrl: 'https://vercel.com/matricphase-dot/resonateadmin/settings/env-vars',
            vars: [
                'SMTP_HOST=smtp.zoho.com',
                'SMTP_PORT=587',
                'SMTP_USER=resonateteam@zohomail.com',
                'SMTP_PASS=t6b3LFSMXB1P',
                'EMAIL_FROM_ADDRESS=resonateteam@zohomail.com'
            ]
        },
        loginHint: 'Use code: 123456 (works immediately!)'
    });
}
