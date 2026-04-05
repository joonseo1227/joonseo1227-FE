import {NextResponse} from 'next/server';
import {getAdminClient, unauthorized, verifyAdmin} from '@/lib/adminAuth';
import sharp from 'sharp';

const ALLOWED_FOLDER_PREFIXES = ['posts/', 'projects/'];

function isValidFolder(folder) {
    if (!folder || typeof folder !== 'string') return false;
    if (!ALLOWED_FOLDER_PREFIXES.some(p => folder.startsWith(p))) return false;
    if (folder.includes('..') || folder.includes('//')) return false;
    return true;
}

function isSafeUrl(url) {
    try {
        const {protocol, hostname} = new URL(url);
        if (!['http:', 'https:'].includes(protocol)) return false;
        // Block private/loopback/link-local ranges
        if (/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.)/i.test(hostname)) return false;
        if (hostname === '::1' || hostname === '[::1]') return false;
        return true;
    } catch {
        return false;
    }
}

export async function POST(request) {
    if (!await verifyAdmin()) return unauthorized();

    const contentType = request.headers.get('content-type') || '';

    let buffer, mimeType, folder;

    try {
        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            const file = formData.get('file');
            folder = formData.get('folder') || 'posts/misc';
            if (!file) return NextResponse.json({error: 'File required'}, {status: 400});
            buffer = await file.arrayBuffer();
            mimeType = file.type || 'image/jpeg';
        } else {
            const body = await request.json();
            const {url} = body;
            folder = body.folder || 'posts/misc';
            if (!url) return NextResponse.json({error: 'URL required'}, {status: 400});
            if (!isSafeUrl(url)) return NextResponse.json({error: 'Invalid URL'}, {status: 400});

            const imgRes = await fetch(url, {headers: {'User-Agent': 'Mozilla/5.0'}});
            if (!imgRes.ok) throw new Error(`이미지를 가져올 수 없습니다: ${imgRes.status}`);
            mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
            buffer = await imgRes.arrayBuffer();
        }

        if (!isValidFolder(folder)) {
            return NextResponse.json({error: 'Invalid folder'}, {status: 400});
        }

        let uploadBuffer, uploadContentType, filename;

        if (mimeType.split(';')[0].trim() === 'image/gif') {
            // GIF는 애니메이션을 보존하며 animated WebP로 변환
            uploadBuffer = await sharp(Buffer.from(buffer), {animated: true})
                .webp({quality: 85})
                .toBuffer();
            uploadContentType = 'image/webp';
            filename = `${folder}/${Date.now()}.webp`;
        } else {
            uploadBuffer = await sharp(Buffer.from(buffer))
                .webp({quality: 85})
                .toBuffer();
            uploadContentType = 'image/webp';
            filename = `${folder}/${Date.now()}.webp`;
        }

        const db = getAdminClient();
        const {error: uploadError} = await db.storage
            .from('images')
            .upload(filename, uploadBuffer, {contentType: uploadContentType, upsert: false});
        if (uploadError) throw uploadError;

        const {data: {publicUrl}} = db.storage.from('images').getPublicUrl(filename);
        return NextResponse.json({url: publicUrl});
    } catch (err) {
        console.error('Image upload failed:', err);
        return NextResponse.json({error: err.message}, {status: 500});
    }
}
