import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';
import { cookies } from 'next/headers';

export async function middleware(request: NextRequest) {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;

    if (request.nextUrl.pathname.startsWith('/admin') &&
        request.nextUrl.pathname !== '/admin/login' &&
        !adminSession) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};
