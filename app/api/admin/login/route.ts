import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        console.log('🔐 LOGIN ATTEMPT:', { email });

        // ✅ EXACT EMAIL MATCH (case-sensitive)
        const VALID_ADMIN_EMAIL = 'resonate.admin8153@protonmail.com';
        if (email !== VALID_ADMIN_EMAIL) {
            console.log('❌ INVALID EMAIL:', email);
            return NextResponse.json({
                error: `Invalid admin email. Use: ${VALID_ADMIN_EMAIL}`
            }, { status: 403 });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = Date.now() + 10 * 60 * 1000; // 10 min

        // Store OTP in cookies
        const cookieStore = await cookies();
        cookieStore.set('admin_otp', otp, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 600,
            path: '/admin',
        });
        cookieStore.set('otp_expires', expires.toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 600,
            path: '/admin',
        });

        console.log('📱 OTP GENERATED:', otp.slice(0, 3) + '...');

        // Send OTP via Zoho SMTP
        await sendEmail({
            to: email,
            subject: '🔐 Resonate Admin Code',
            html: `
        <div style="font-family: Arial; max-width: 500px;">
          <h2>Resonate Admin Login</h2>
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; font-size: 48px; font-weight: bold; 
                      letter-spacing: 8px; padding: 30px; text-align: center; 
                      border-radius: 12px; margin: 20px 0;">
            ${otp}
          </div>
          <p>Enter this code on the admin login page.</p>
          <p><em>Expires in 10 minutes</em></p>
        </div>
      `,
        });

        console.log('✅ OTP SENT TO:', email);
        return NextResponse.json({
            success: true,
            message: 'Code sent! Check ProtonMail inbox.'
        });

    } catch (error: any) {
        console.error('🔴 LOGIN ERROR:', error);
        return NextResponse.json({
            error: error.message.includes('SMTP') ? 'SMTP failed - check Vercel env vars' : error.message
        }, { status: 500 });
    }
}
