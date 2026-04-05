import {NextResponse} from 'next/server';
import {getAdminClient, unauthorized, verifyAdmin} from '@/lib/adminAuth';

export async function PUT(request, {params}) {
    if (!await verifyAdmin()) return unauthorized();

    const {post, categoryId} = await request.json();
    const {id} = await params;
    const db = getAdminClient();

    const {error} = await db.from('posts')
        .update({...post, updated_at: new Date().toISOString()})
        .eq('id', id);
    if (error) return NextResponse.json({error: error.message}, {status: 500});

    await db.from('post_categories').delete().eq('post_id', id);
    if (categoryId) {
        await db.from('post_categories').insert({post_id: id, category_id: categoryId});
    }

    return NextResponse.json({success: true});
}

export async function DELETE(request, {params}) {
    if (!await verifyAdmin()) return unauthorized();

    const {id} = await params;
    const db = getAdminClient();

    // Delete storage files at posts/{id}/ (post.id is the slug)
    const {data: files} = await db.storage.from('images').list(`posts/${id}`);
    if (files?.length > 0) {
        await db.storage.from('images').remove(files.map(f => `posts/${id}/${f.name}`));
    }

    await db.from('post_categories').delete().eq('post_id', id);
    await db.from('comments').delete().eq('post_id', id);
    const {error} = await db.from('posts').delete().eq('id', id);
    if (error) return NextResponse.json({error: error.message}, {status: 500});

    return NextResponse.json({success: true});
}
