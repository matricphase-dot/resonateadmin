import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { sign } from '@/lib/security/jwt';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        // Only super-admin allowed
        const superAdmin = 'resonate.admin8153@protonmail.com';
        if (email !== superAdmin) {
            console.warn(`🚫 Unauthorized login attempt for: ${email}`);
            return NextResponse.json({ error: 'Invalid admin email' }, { status: 403 });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        try {
            console.log(`📧 Sending OTP to ${email}...`);
            await sendEmail({
                to: email,
                subject: '🔐 Resonate Admin Login Code',
                html: `
          <h1>Your Admin Login Code</h1>
          <p><strong>${otp}</strong></p>
          <p>This code expires in 10 minutes.</p>
        `,
            });

            // Create Context Token (Stateless OTP)
            const encoder = new TextEncoder();
            const data = encoder.encode(otp);
            const hashBuffer = await crypto.subtle.digest("SHA-256", data);
            const otpHash = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));

            const token = await sign({
                email,
                otpHash,
                exp: Date.now() + 10 * 60 * 1000 // 10 mins
            }, process.env.ADMIN_OTP_SECRET || "default-secret");

            console.log('✅ OTP sent to super-admin:', email);

            const res = NextResponse.json({ success: true, otpSent: true });
            res.cookies.set("resonate_admin_otp_context", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
                maxAge: 600 // 10 mins
            });

            return res;
        } catch (error: any) {
            console.error('🔴 ZOHO SMTP ERROR in Login:', error.message);
            return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
