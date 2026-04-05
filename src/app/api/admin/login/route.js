import {NextResponse} from 'next/server';
import {generateAdminToken} from '@/lib/adminToken';

// In-memory rate limiter (resets on cold start; sufficient for personal blog)
const attempts = new Map();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;

function isRateLimited(ip) {
    const now = Date.now();
    const record = attempts.get(ip) || {count: 0, resetAt: now + WINDOW_MS};

    if (now > record.resetAt) {
        record.count = 0;
        record.resetAt = now + WINDOW_MS;
    }

    record.count++;
    attempts.set(ip, record);
    return record.count > MAX_ATTEMPTS;
}

export async function POST(request) {
    const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        request.headers.get('x-real-ip') ||
        'unknown';

    if (isRateLimited(ip)) {
        return NextResponse.json(
            {error: '너무 많은 시도입니다. 15분 후 다시 시도해주세요.'},
            {status: 429},
        );
    }

    const {password} = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword || password !== adminPassword) {
        return NextResponse.json({error: '비밀번호가 올바르지 않습니다.'}, {status: 401});
    }

    const token = await generateAdminToken(adminPassword);

    const response = NextResponse.json({success: true});
    response.cookies.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
    });

    return response;
}
