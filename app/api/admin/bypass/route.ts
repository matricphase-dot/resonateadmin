import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    const secret = process.env.ADMIN_BYPASS_SECRET;
    const providedSecret = req.headers.get('X-Admin-Bypass-Secret');

    if (!secret || providedSecret !== secret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = NextResponse.json({ message: 'Admin access granted via bypass' });
    const cookieStore = await cookies();

    cookieStore.set('resonate_admin_session', 'superadmin_token_bypass', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
    });

    return response;
}
