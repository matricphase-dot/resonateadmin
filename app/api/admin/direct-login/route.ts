import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        // HARDCODED SUPERADMIN CREDENTIALS
        if (email === 'resonate.admin8153@protonmail.com' && password === 'admin123') {
            const response = NextResponse.json({
                success: true,
                message: '🚀 SUPERADMIN ACCESS GRANTED - NO SMTP NEEDED!'
            });

            const cookieStore = await cookies();
            cookieStore.set('admin_session', 'SUPERADMIN_MASTER_2026', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 90 * 24 * 60 * 60, // 90 days
            });

            return response;
        }

        return NextResponse.json({
            error: '❌ Invalid credentials. Email: resonate.admin8153@protonmail.com | Pass: admin123'
        }, { status: 401 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
