import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        console.log('🔐 ADMIN LOGIN:', { email, timestamp: new Date().toISOString() });

        // Super-admin only
        if (email !== 'resonate.admin8153@protonmail.com') {
            return NextResponse.json({ error: 'Invalid admin email' }, { status: 403 });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP securely
        const cookieStore = await cookies();
        cookieStore.set('admin_otp', otp, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 600, // 10 minutes
        });

        // Send OTP via Zoho SMTP
        await sendEmail({
            to: email,
            subject: '🔐 Resonate Admin Login Code',
            html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 500px;">
          <h1 style="color: #1e40af;">Admin Login Code</h1>
          <div style="background: #1e40af; color: white; font-size: 48px; font-weight: bold; letter-spacing: 12px; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code expires in 10 minutes.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #666;">
            Sent from production server<br>
            ${new Date().toLocaleString()}
          </p>
        </div>
      `,
        });

        console.log('✅ OTP SENT SUCCESSFULLY:', { email, otpLength: otp.length });
        return NextResponse.json({
            success: true,
            message: 'Login code sent! Check your ProtonMail inbox.'
        });

    } catch (error: any) {
        console.error('🔴 LOGIN ERROR:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
        });

        return NextResponse.json({
            success: false,
            error: error.message,
            type: error.message.includes('ENV') ? 'ENV_VARS_MISSING' :
                error.message.includes('SMTP') ? 'SMTP_CONFIG' : 'UNKNOWN',
            fix: error.message.includes('ENV') ?
                'Go to Vercel Dashboard → Settings → Environment Variables → Add ALL SMTP vars' :
                'Check Vercel Function Logs for SMTP details',
        }, { status: 500 });
    }
}
