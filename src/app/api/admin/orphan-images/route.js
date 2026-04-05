import {NextResponse} from 'next/server';
import {getAdminClient, unauthorized, verifyAdmin} from '@/lib/adminAuth';

const ALLOWED_FOLDER_PREFIXES = ['posts/', 'projects/'];

function isValidFolder(folder) {
    if (!folder || typeof folder !== 'string') return false;
    if (!ALLOWED_FOLDER_PREFIXES.some(p => folder.startsWith(p))) return false;
    if (folder.includes('..') || folder.includes('//')) return false;
    return true;
}

// GET /api/admin/orphan-images?folder=posts/my-post-id
export async function GET(request) {
    if (!await verifyAdmin()) return unauthorized();

    const {searchParams} = new URL(request.url);
    const folder = searchParams.get('folder');
    if (!folder) {
        return NextResponse.json({error: 'folder required'}, {status: 400});
    }

    if (!isValidFolder(folder)) {
        return NextResponse.json({error: 'Invalid folder'}, {status: 400});
    }

    const db = getAdminClient();
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
