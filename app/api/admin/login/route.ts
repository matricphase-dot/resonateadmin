import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const VALID_EMAIL = 'resonate.admin8153@protonmail.com';
const HARDCODED_OTP = '123456'; // 100% BYPASS

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();
        const cleanEmail = email?.toLowerCase().trim();

        console.log('🔍 LOGIN DEBUG:', {
            received: cleanEmail,
            expected: VALID_EMAIL,
            smtpHost: process.env.SMTP_HOST || '🚨 MISSING',
            smtpUser: process.env.SMTP_USER || '🚨 MISSING',
            smtpPass: process.env.SMTP_PASS ? `${process.env.SMTP_PASS.length} chars ✓` : '🚨 MISSING',
        });

        // VALIDATE EMAIL
        if (cleanEmail !== VALID_EMAIL) {
            return NextResponse.json({
                error: `❌ Use EXACTLY: ${VALID_EMAIL}`,
                received: cleanEmail
            }, { status: 403 });
        }

        // HARDCODE OTP (WORKS EVEN IF SMTP FAILS)
        const cookieStore = await cookies();
        cookieStore.set('admin_otp', HARDCODED_OTP, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 3600, // 1 hour
            path: '/'
        });

        // SMTP ATTEMPT (non-blocking)
        try {
            const { sendEmail } = await import('@/lib/email');
            await sendEmail({
                to: VALID_EMAIL,
                subject: '🔐 Resonate Admin Code: 123456',
                html: `<h1 style="font-size: 64px; color: #10b981;">123456</h1>`,
            });
        } catch (smtpError: any) {
            console.log('⚠️ SMTP FAILED (using hardcoded OTP):', smtpError.message);
        }

        return NextResponse.json({
            success: true,
            message: '✅ Use code: 123456 (ProtonMail or direct)',
            smtpStatus: process.env.SMTP_PASS ? 'Configured' : '🚨 Add SMTP_PASS in Vercel Dashboard',
            vercelFix: 'https://vercel.com/matricphase-dot/resonateadmin/settings/env-vars'
        });

    } catch (error: any) {
        console.error('🔴 LOGIN CRITICAL ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
