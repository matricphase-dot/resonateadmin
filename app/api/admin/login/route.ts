import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        // Super-admin only
        if (email !== 'resonate.admin8153@protonmail.com') {
            return NextResponse.json({ error: 'Invalid admin email' }, { status: 403 });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = Date.now() + 10 * 60 * 1000; // 10 min

        // Store OTP in cookie (production safe)
        const cookieStore = await cookies();
        cookieStore.set('admin_otp', otp, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 600, // 10 min
            path: '/admin',
        });
        cookieStore.set('otp_expires', expires.toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 600,
            path: '/admin',
        });

        // Send OTP via Zoho
        await sendEmail({
            to: email,
            subject: `🔐 Resonate Admin Code (expires in 10 min)`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px;">
          <h2>Resonate Admin Login</h2>
          <p>Your one-time login code is:</p>
          <h1 style="font-size: 48px; color: #1e40af; letter-spacing: 8px;">${otp}</h1>
          <p><small>This code expires in 10 minutes.</small></p>
          <hr>
          <p>If you didn't request this, ignore this email.</p>
        </div>
      `,
        });

        console.log('✅ OTP sent to super-admin:', email);
        return NextResponse.json({
            success: true,
            message: 'OTP sent! Check your ProtonMail inbox.'
        });

    } catch (error: any) {
        console.error('🔴 ADMIN LOGIN ERROR:', error);
        return NextResponse.json(
            {
                error: 'Failed to send OTP',
                details: error.message.includes('SMTP') ? error.message : 'Internal error'
            },
            { status: 500 }
        );
    }
}
