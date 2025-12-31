import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect all /admin routes except for the login page
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        const adminSession = request.cookies.get('admin_session')?.value;

        // Strict check for SUPERADMIN session
        if (!adminSession || !adminSession.includes('SUPERADMIN')) {
            console.log('🚫 REJECTED: No valid admin session found for', pathname);
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};
