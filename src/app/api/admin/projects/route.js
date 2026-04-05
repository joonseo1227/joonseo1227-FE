import {NextResponse} from 'next/server';
import {getAdminClient, unauthorized, verifyAdmin} from '@/lib/adminAuth';

export async function POST(request) {
    if (!await verifyAdmin()) return unauthorized();

    const {project, techIds} = await request.json();
    const db = getAdminClient();

    const {data, error} = await db.from('project').insert([project]).select().single();
    if (error) return NextResponse.json({error: error.message}, {status: 500});

    if (techIds?.length > 0) {
        await db.from('project_technologies').insert(
            techIds.map(tech_id => ({project_id: data.id, tech_id}))
        );
    }

    return NextResponse.json({id: data.id});
}
