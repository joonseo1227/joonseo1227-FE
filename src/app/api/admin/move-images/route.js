import {NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {createClient} from '@supabase/supabase-js';

async function getAdminDb() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY,
    );
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
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token || token !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    const {urls, targetFolder} = await request.json();
    if (!Array.isArray(urls) || !targetFolder) {
        return NextResponse.json({error: 'urls and targetFolder required'}, {status: 400});
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const db = await getAdminDb();
    const urlMap = {};

    await Promise.all(urls.map(async (oldUrl) => {
        const fromPath = urlToStoragePath(oldUrl, supabaseUrl);
        if (!fromPath) return;

        // e.g. "posts/misc/1234567890.webp" → filename "1234567890.webp"
        const filename = fromPath.split('/').pop();
        const toPath = `${targetFolder}/${filename}`;

        // copy to new location
        const {error: copyError} = await db.storage.from('images').copy(fromPath, toPath);
        if (copyError) {
            console.error('copy error', fromPath, '->', toPath, copyError);
            return;
        }

        // delete original
        const {error: removeError} = await db.storage.from('images').remove([fromPath]);
        if (removeError) {
            console.error('remove error', fromPath, removeError);
        }

        const {data: {publicUrl: newUrl}} = db.storage.from('images').getPublicUrl(toPath);
        urlMap[oldUrl] = newUrl;
    }));

    return NextResponse.json({urlMap});
}
