import {NextResponse} from 'next/server';
import {getAdminClient, unauthorized, verifyAdmin} from '@/lib/adminAuth';

export async function PUT(request, {params}) {
    if (!await verifyAdmin()) return unauthorized();

    const {project, techIds} = await request.json();
    const {id} = await params;
    const db = getAdminClient();

    const {error} = await db.from('project').update(project).eq('id', id);
    if (error) return NextResponse.json({error: error.message}, {status: 500});

    await db.from('project_technologies').delete().eq('project_id', id);
    if (techIds?.length > 0) {
        await db.from('project_technologies').insert(
            techIds.map(tech_id => ({project_id: id, tech_id}))
        );
    }

    return NextResponse.json({success: true});
}

export async function DELETE(request, {params}) {
    if (!await verifyAdmin()) return unauthorized();

    const {id} = await params;
    const db = getAdminClient();

    // project.id is UUID — fetch slug first to build storage path projects/{slug}/
    const {data: project} = await db.from('project').select('slug').eq('id', id).single();
    if (project?.slug) {
        const {data: files} = await db.storage.from('images').list(`projects/${project.slug}`);
        if (files?.length > 0) {
            await db.storage.from('images').remove(files.map(f => `projects/${project.slug}/${f.name}`));
        }
    }

    await db.from('project_technologies').delete().eq('project_id', id);
    const {error} = await db.from('project').delete().eq('id', id);
    if (error) return NextResponse.json({error: error.message}, {status: 500});

    return NextResponse.json({success: true});
}
