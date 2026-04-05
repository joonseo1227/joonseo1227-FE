import {cookies} from 'next/headers';
import {createClient} from '@supabase/supabase-js';
import {NextResponse} from 'next/server';

export async function verifyAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    return token === process.env.ADMIN_PASSWORD;
}

export function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY,
    );
}

export function unauthorized() {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
}
