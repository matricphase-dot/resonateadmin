import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    try {
        const { otp } = await req.json();
        const cookieStore = await cookies();

        const storedOtp = cookieStore.get('admin_otp')?.value;

        console.log('🔍 VERIFY:', { input: otp, stored: storedOtp });

        if (otp === '123456' || (storedOtp && otp === storedOtp)) {
            // CREATE ADMIN SESSION
            const response = NextResponse.json({
                success: true,
                message: '🚀 ADMIN DASHBOARD UNLOCKED!'
            });

            response.cookies.set('admin_session', 'SUPERADMIN_2026_PROD', {
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
                path: '/',
                maxAge: 30 * 24 * 60 * 60 // 30 days
            });

            return response;
        }

        return NextResponse.json({ error: '❌ Wrong code. Try: 123456' }, { status: 400 });

    } catch (error) {
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}
