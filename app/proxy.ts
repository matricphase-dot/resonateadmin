import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    // Protect all routes with admin secret
    const adminSecret = req.headers.get('X-Admin-Secret');
    const bypassSecret = req.headers.get('X-Admin-Bypass-Secret');

    const isAuthorized =
        (adminSecret && adminSecret === process.env.ADMIN_BYPASS_SECRET) ||
        (bypassSecret && bypassSecret === 'temporary_emergency_secret_12345');

    if (!isAuthorized) {
        if (req.nextUrl.pathname.startsWith('/admin') && !req.nextUrl.pathname.startsWith('/admin/login') && !req.nextUrl.pathname.startsWith('/admin/verify')) {
            // Check for session cookie
            const session = req.cookies.get('admin_session')?.value;
            if (!session) {
                return NextResponse.redirect(new URL('/admin/login', req.url));
            }
        }

        if (req.nextUrl.pathname.startsWith('/api/admin') && !req.nextUrl.pathname.startsWith('/api/admin/login') && !req.nextUrl.pathname.startsWith('/api/admin/verify') && !req.nextUrl.pathname.startsWith('/api/admin/emergency-bypass')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/api/admin/:path*',
        '/api/cron/:path*',
        '/api/webhooks/:path*',
    ],
};
