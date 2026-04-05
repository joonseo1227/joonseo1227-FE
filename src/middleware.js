import {NextResponse} from 'next/server';

export function middleware(request) {
    const {pathname} = request.nextUrl;

    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        const token = request.cookies.get('admin_token')?.value;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!token || !adminPassword || token !== adminPassword) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
