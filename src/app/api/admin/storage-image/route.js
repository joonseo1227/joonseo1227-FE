import {NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {createClient} from '@supabase/supabase-js';

function getAdminDb() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY,
    );
}

// DELETE /api/admin/storage-image
// Body: { path: "posts/my-post-id/123.webp" }
export async function DELETE(request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token || token !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    const {path} = await request.json();
    if (!path || typeof path !== 'string') {
        return NextResponse.json({error: 'path required'}, {status: 400});
    }

    // Only allow deleting files inside posts/ or projects/ folders
    if (!path.startsWith('posts/') && !path.startsWith('projects/')) {
        return NextResponse.json({error: 'Invalid path'}, {status: 400});
    }

    const db = getAdminDb();
    const {error} = await db.storage.from('images').remove([path]);
    if (error) {
        return NextResponse.json({error: error.message}, {status: 500});
    }

    return NextResponse.json({success: true});
}
