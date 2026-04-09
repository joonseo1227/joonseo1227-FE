import {NextResponse} from 'next/server';
import {getAdminClient, unauthorized, verifyAdmin} from '@/lib/adminAuth';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

function isValidSlug(slug) {
    if (!slug || typeof slug !== 'string') return false;
    if (slug.length > 80) return false;
    // 영문 소문자, 숫자, 한글, 하이픈만 허용
    return /^[a-z0-9가-힣-]+$/.test(slug);
}

// POST /api/admin/posts/[id]/rename-slug
// Body: { newSlug: string }
// 1) 스토리지 posts/{oldId}/ → posts/{newSlug}/ 이동
// 2) content/thumbnail_url 내 URL 교체
// 3) posts.id UPDATE (ON UPDATE CASCADE → post_categories, comments 자동 연동)
export async function POST(request, {params}) {
    if (!await verifyAdmin()) return unauthorized();

    const {id: oldSlug} = await params;
    const {newSlug} = await request.json();

    if (!isValidSlug(newSlug)) {
        return NextResponse.json({error: '유효하지 않은 슬러그입니다. 영문 소문자, 숫자, 한글, 하이픈(-)만 사용 가능합니다.'}, {status: 400});
    }

    if (oldSlug === newSlug) {
        return NextResponse.json({success: true, id: newSlug});
    }

    const db = getAdminClient();

    // 중복 슬러그 확인
    const {data: existing} = await db.from('posts').select('id').eq('id', newSlug).single();
    if (existing) {
        return NextResponse.json({error: `슬러그 "${newSlug}"는 이미 사용 중입니다.`}, {status: 409});
    }

    // 기존 포스트 조회 (content, thumbnail_url 필요)
    const {
        data: post,
        error: fetchError
    } = await db.from('posts').select('content, thumbnail_url').eq('id', oldSlug).single();
    if (fetchError || !post) {
        return NextResponse.json({error: '포스트를 찾을 수 없습니다.'}, {status: 404});
    }

    // ── 1. 스토리지 파일 이동 ──────────────────────────────────────────────
    const oldFolder = `posts/${oldSlug}`;
    const newFolder = `posts/${newSlug}`;
    const urlMap = {};

    const {data: files} = await db.storage.from('images').list(oldFolder);
    if (files?.length > 0) {
        await Promise.all(files.map(async (file) => {
            const fromPath = `${oldFolder}/${file.name}`;
            const toPath = `${newFolder}/${file.name}`;

            const {error: copyError} = await db.storage.from('images').copy(fromPath, toPath);
            if (copyError) {
                console.error('copy error', fromPath, '->', toPath, copyError);
                return;
            }

            await db.storage.from('images').remove([fromPath]);

            const oldUrl = `${SUPABASE_URL}/storage/v1/object/public/images/${fromPath}`;
            const {data: {publicUrl: newUrl}} = db.storage.from('images').getPublicUrl(toPath);
            urlMap[oldUrl] = newUrl;
        }));
    }

    // ── 2. content / thumbnail_url URL 교체 ──────────────────────────────
    let {content, thumbnail_url} = post;
    for (const [oldUrl, newUrl] of Object.entries(urlMap)) {
        if (thumbnail_url === oldUrl) thumbnail_url = newUrl;
        content = content?.replaceAll(oldUrl, newUrl) ?? content;
    }

    // ── 3. posts.id UPDATE (FK ON UPDATE CASCADE 로 post_categories, comments 자동 연동) ──
    const {error: updateError} = await db.from('posts').update({
        id: newSlug,
        content,
        thumbnail_url,
        updated_at: new Date().toISOString(),
    }).eq('id', oldSlug);

    if (updateError) {
        return NextResponse.json({error: `슬러그 변경 실패: ${updateError.message}`}, {status: 500});
    }

    return NextResponse.json({success: true, id: newSlug, urlMap});
}
