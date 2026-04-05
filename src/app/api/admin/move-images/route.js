import {NextResponse} from 'next/server';
import {getAdminClient, unauthorized, verifyAdmin} from '@/lib/adminAuth';

const ALLOWED_FOLDER_PREFIXES = ['posts/', 'projects/'];

function isValidFolder(folder) {
    if (!folder || typeof folder !== 'string') return false;
    if (!ALLOWED_FOLDER_PREFIXES.some(p => folder.startsWith(p))) return false;
    if (folder.includes('..') || folder.includes('//')) return false;
    return true;
}

// Extract storage path from a public URL
// e.g. "https://.../storage/v1/object/public/images/posts/misc/123.webp"
//   → "posts/misc/123.webp"
function urlToStoragePath(url, supabaseUrl) {
    const prefix = `${supabaseUrl}/storage/v1/object/public/images/`;
    if (!url.startsWith(prefix)) return null;
    return url.slice(prefix.length);
}

// POST /api/admin/move-images
// Body: { urls: string[], targetFolder: string }
// Returns: { urlMap: { [oldUrl]: newUrl } }
export async function POST(request) {
    if (!await verifyAdmin()) return unauthorized();

    const {urls, targetFolder} = await request.json();
    if (!Array.isArray(urls) || !targetFolder) {
        return NextResponse.json({error: 'urls and targetFolder required'}, {status: 400});
    }

    if (!isValidFolder(targetFolder)) {
        return NextResponse.json({error: 'Invalid targetFolder'}, {status: 400});
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const db = getAdminClient();
    const urlMap = {};

    await Promise.all(urls.map(async (oldUrl) => {
        const fromPath = urlToStoragePath(oldUrl, supabaseUrl);
        if (!fromPath) return;

        const filename = fromPath.split('/').pop();
        const toPath = `${targetFolder}/${filename}`;

        const {error: copyError} = await db.storage.from('images').copy(fromPath, toPath);
        if (copyError) {
            console.error('copy error', fromPath, '->', toPath, copyError);
            return;
        }

        const {error: removeError} = await db.storage.from('images').remove([fromPath]);
        if (removeError) {
            console.error('remove error', fromPath, removeError);
        }

        const {data: {publicUrl: newUrl}} = db.storage.from('images').getPublicUrl(toPath);
        urlMap[oldUrl] = newUrl;
    }));

    return NextResponse.json({urlMap});
}
