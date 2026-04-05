import {NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {createClient} from '@supabase/supabase-js';
import sharp from 'sharp';

async function getAdminDb() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY,
    );
}

export async function POST(request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token || token !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    const contentType = request.headers.get('content-type') || '';

    let buffer, mimeType, folder;

    try {
        if (contentType.includes('multipart/form-data')) {
            // ── 파일 직접 업로드 ──────────────────────────────────────
            const formData = await request.formData();
            const file = formData.get('file');
            folder = formData.get('folder') || 'posts/misc';
            if (!file) return NextResponse.json({error: 'File required'}, {status: 400});
            buffer = await file.arrayBuffer();
            mimeType = file.type || 'image/jpeg';
        } else {
            // ── 외부 URL 다운로드 후 업로드 ───────────────────────────
            const body = await request.json();
            const {url} = body;
            folder = body.folder || 'posts/misc';
            if (!url) return NextResponse.json({error: 'URL required'}, {status: 400});

            const imgRes = await fetch(url, {headers: {'User-Agent': 'Mozilla/5.0'}});
            if (!imgRes.ok) throw new Error(`이미지를 가져올 수 없습니다: ${imgRes.status}`);
            mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
            buffer = await imgRes.arrayBuffer();
        }

        // Convert to WebP
        const webpBuffer = await sharp(Buffer.from(buffer))
            .webp({quality: 85})
            .toBuffer();

        const filename = `${folder}/${Date.now()}.webp`;

        const db = await getAdminDb();
        const {error: uploadError} = await db.storage
            .from('images')
            .upload(filename, webpBuffer, {contentType: 'image/webp', upsert: false});
        if (uploadError) throw uploadError;

        const {data: {publicUrl}} = db.storage.from('images').getPublicUrl(filename);
        return NextResponse.json({url: publicUrl});
    } catch (err) {
        console.error('Image upload failed:', err);
        return NextResponse.json({error: err.message}, {status: 500});
    }
}
