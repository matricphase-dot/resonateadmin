import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    try {
        const { otp } = await req.json();
        const cookieStore = await cookies();

        const storedOtp = cookieStore.get('admin_otp')?.value;
        const expires = parseInt(cookieStore.get('otp_expires')?.value || '0');

        console.log('🔍 OTP VERIFY:', {
            inputOtp: otp?.slice(0, 3) + '...',
            storedOtp: storedOtp ? storedOtp.slice(0, 3) + '...' : 'MISSING',
            expired: Date.now() > expires
        });

        if (!storedOtp || Date.now() > expires) {
            return NextResponse.json({ error: 'Code expired or not found. Request new code.' }, { status: 400 });
        }

        if (otp !== storedOtp) {
            return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
        }

        // Create admin session
        const response = NextResponse.json({ success: true });

        // Set the admin session cookie on the response
        response.cookies.set('admin_session', 'SUPERADMIN_' + Date.now(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/', // Session valid for all routes
            maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        // Clear internal OTP verification cookies
        response.cookies.delete('admin_otp');
        response.cookies.delete('otp_expires');

        console.log('✅ OTP VERIFIED - SESSION CREATED');
        return response;

    } catch (error: any) {
        console.error('🔴 VERIFY ERROR:', error);
        return NextResponse.json({ error: 'Verification failed: ' + error.message }, { status: 500 });
    }
}
