import {NextResponse} from 'next/server';
import {verifyAdminToken} from './lib/adminToken';

export async function middleware(request) {
    const {pathname} = request.nextUrl;
    const isAdminPage = pathname.startsWith('/admin') && pathname !== '/admin/login';
    const isAdminApi = pathname.startsWith('/api/admin') && pathname !== '/api/admin/login';

    if (isAdminPage || isAdminApi) {
        const token = request.cookies.get('admin_token')?.value;
        const isValid = await verifyAdminToken(token, process.env.ADMIN_PASSWORD);

        if (!isValid) {
            if (isAdminApi) {
                return NextResponse.json({error: 'Unauthorized'}, {status: 401});
            }
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
