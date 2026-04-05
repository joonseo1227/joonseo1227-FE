import {NextResponse} from 'next/server';
import {getAdminClient, unauthorized, verifyAdmin} from '@/lib/adminAuth';

export async function DELETE(request, {params}) {
    if (!await verifyAdmin()) return unauthorized();

    const {id} = await params;
    const db = getAdminClient();

    const {error} = await db.from('comments').delete().eq('id', id);
    if (error) return NextResponse.json({error: error.message}, {status: 500});

    return NextResponse.json({success: true});
}
