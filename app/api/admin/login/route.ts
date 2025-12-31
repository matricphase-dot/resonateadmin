import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        // Log EVERYTHING
        console.log('🔍 PRODUCTION LOGIN DEBUG:', {
            email,
            smtpHost: process.env.SMTP_HOST || 'MISSING ❌',
            smtpUser: process.env.SMTP_USER || 'MISSING ❌',
            smtpPassLen: process.env.SMTP_PASS ? process.env.SMTP_PASS.length + ' chars' : 'MISSING ❌',
            nodeEnv: process.env.NODE_ENV,
        });

        if (email !== 'resonate.admin8153@protonmail.com') {
            return NextResponse.json({ error: 'Wrong email' }, { status: 403 });
        }

        const otp = '123456'; // HARDCODE for testing

        // Store OTP
        const cookieStore = await cookies();
        cookieStore.set('admin_otp', otp, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 3600 });

        // TEST SMTP with FULL ERROR
        await sendEmail({
            to: email,
            subject: '🔍 SMTP DIAGNOSTIC TEST',
            html: `<h1>TEST: ${otp}</h1><p>Env vars logged to Vercel console</p>`,
        });

        return NextResponse.json({
            success: true,
            otp_sent: true,
            debug: {
                smtpHost: process.env.SMTP_HOST ? 'OK' : '🚨 MISSING - Vercel Dashboard!',
                smtpUser: process.env.SMTP_USER ? 'OK' : '🚨 MISSING',
                smtpPass: process.env.SMTP_PASS ? 'OK' : '🚨 MISSING - CRITICAL!',
            }
        });

    } catch (error: any) {
        console.error('🔴 FULL SMTP ERROR:', error);

        return NextResponse.json({
            success: false,
            error: error.message,
            debug: {
                smtpHost: process.env.SMTP_HOST || 'MISSING ❌',
                smtpUser: process.env.SMTP_USER || 'MISSING ❌',
                smtpPass: process.env.SMTP_PASS ? 'EXISTS' : '🚨 CRITICAL - SET IN VERCEL!',
                fix: 'Vercel → Project → Settings → Environment Variables → Add SMTP vars NOW',
            }
        }, { status: 500 });
    }
}
