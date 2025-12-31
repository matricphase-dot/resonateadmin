import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    try {
        const { otp } = await req.json();
        const cookieStore = await cookies();

        const storedOtp = cookieStore.get('admin_otp')?.value;
        const expires = parseInt(cookieStore.get('otp_expires')?.value || '0');

        if (!storedOtp || Date.now() > expires) {
            return NextResponse.json({ error: 'OTP expired or invalid' }, { status: 400 });
        }

        if (otp !== storedOtp) {
            return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
        }

        // Create admin session
        const response = NextResponse.json({ success: true, message: 'Admin logged in' });
        response.cookies.set('admin_session', 'superadmin_prod_' + Date.now(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        // Clear OTP
        cookieStore.delete('admin_otp');
        cookieStore.delete('otp_expires');

        return response;

    } catch (error) {
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}
