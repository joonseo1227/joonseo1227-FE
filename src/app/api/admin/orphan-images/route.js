import {NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {createClient} from '@supabase/supabase-js';

function getAdminDb() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY,
    );
}

// GET /api/admin/orphan-images?folder=posts/my-post-id
export async function GET(request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token || token !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    const {searchParams} = new URL(request.url);
    const folder = searchParams.get('folder');
    if (!folder) {
        return NextResponse.json({error: 'folder required'}, {status: 400});
    }

    const db = getAdminDb();
    const {data, error} = await db.storage.from('images').list(folder, {limit: 500});
    if (error) {
        return NextResponse.json({error: error.message}, {status: 500});
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const files = (data || [])
        .filter(f => f.name && f.name !== '.emptyFolderPlaceholder')
        .map(f => ({
            name: f.name,
            url: `${supabaseUrl}/storage/v1/object/public/images/${folder}/${f.name}`,
            size: f.metadata?.size ?? null,
        }));

    return NextResponse.json({files});
}
