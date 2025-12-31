import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        console.log('🔐 ADMIN LOGIN ATTEMPT:', { email });

        if (email !== 'resonate.admin8153@protonmail.com') {
            return NextResponse.json({ error: 'Invalid admin email' }, { status: 403 });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP
        const cookieStore = await cookies();
        cookieStore.set('admin_otp', otp, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600 });
        cookieStore.set('otp_expires', (Date.now() + 600000).toString(), { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600 });

        // Send OTP
        await sendEmail({
            to: email,
            subject: '🔐 Resonate Admin OTP (10 min expiry)',
            html: `
        <h1 style="color: #1e40af;">Your Admin Code: ${otp}</h1>
        <p>Valid for 10 minutes only.</p>
        <hr>
        <p>Site: ${process.env.APP_BASE_URL || 'Production'}</p>
      `,
        });

        console.log('✅ OTP GENERATED + SENT:', { email, otpLength: otp.length });
        return NextResponse.json({ success: true, message: 'Check ProtonMail (OTP sent)' });

    } catch (error: any) {
        console.error('🔴 LOGIN API ERROR:', error.message);
        return NextResponse.json(
            {
                error: 'OTP failed',
                details: error.message.includes('SMTP') || error.message.includes('VERCEL') ? error.message : 'Server error',
                smtpCheck: process.env.SMTP_PASS ? 'PASS OK' : 'MISSING PASS ❌'
            },
            { status: 500 }
        );
    }
}
