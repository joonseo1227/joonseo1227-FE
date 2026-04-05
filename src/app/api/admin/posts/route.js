import {NextResponse} from 'next/server';
import {getAdminClient, unauthorized, verifyAdmin} from '@/lib/adminAuth';

export async function POST(request) {
    if (!await verifyAdmin()) return unauthorized();

    const {post, categoryId} = await request.json();
    const db = getAdminClient();

    const {data, error} = await db.from('posts').insert([post]).select().single();
    if (error) return NextResponse.json({error: error.message}, {status: 500});

    if (categoryId) {
        await db.from('post_categories').insert({post_id: data.id, category_id: categoryId});
    }

    return NextResponse.json({id: data.id});
}
