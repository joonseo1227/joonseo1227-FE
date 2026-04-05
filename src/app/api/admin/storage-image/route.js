import {NextResponse} from 'next/server';
import {getAdminClient, unauthorized, verifyAdmin} from '@/lib/adminAuth';

// DELETE /api/admin/storage-image
// Body: { path: "posts/my-post-id/123.webp" }
export async function DELETE(request) {
    if (!await verifyAdmin()) return unauthorized();

    const {path} = await request.json();
    if (!path || typeof path !== 'string') {
        return NextResponse.json({error: 'path required'}, {status: 400});
    }

    // Only allow deleting files inside posts/ or projects/ folders
    if (!path.startsWith('posts/') && !path.startsWith('projects/')) {
        return NextResponse.json({error: 'Invalid path'}, {status: 400});
    }

    if (path.includes('..') || path.includes('//')) {
        return NextResponse.json({error: 'Invalid path'}, {status: 400});
    }

    const db = getAdminClient();
    const {error} = await db.storage.from('images').remove([path]);
    if (error) {
        return NextResponse.json({error: error.message}, {status: 500});
    }

    return NextResponse.json({success: true});
}
