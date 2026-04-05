import {NextResponse} from 'next/server';

export async function POST(request) {
    const {password} = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword || password !== adminPassword) {
        return NextResponse.json({error: '비밀번호가 올바르지 않습니다.'}, {status: 401});
    }

    const response = NextResponse.json({success: true});
    response.cookies.set('admin_token', adminPassword, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
    });

    return response;
}
