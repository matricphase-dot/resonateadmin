import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    const secret = req.headers.get('X-Admin-Bypass-Secret');

    if (secret !== 'temporary_emergency_secret_12345') {
        return NextResponse.json({ error: 'Wrong secret' }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set('admin_session', 'EMERGENCY_SUPERADMIN_' + Date.now(), {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/'
    });

    console.log('🚨 EMERGENCY BYPASS ACTIVATED');
    return NextResponse.json({
        success: true,
        message: '🚨 EMERGENCY ADMIN ACCESS GRANTED - 24hr session',
        warning: 'Remove this endpoint after fixing SMTP'
    });
}
