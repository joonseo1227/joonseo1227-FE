'use client';

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import supabase from "@/lib/supabase";

export default function PortfolioProjectPage({params}) {
    const unwrappedParams = React.use(params);
    const projectId = unwrappedParams?.id;
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                setLoading(true);
                const {data, error} = await supabase
                    .from('project')
                    .select(`
                        *,
                        project_techs(id, tech_name),
                        project_images(id, img_url, caption, display_order)
                    `)
                    .eq('id', projectId)
                    .single();

                if (error) {
                    setError(error.message);
                    return;
                }

                // Sort images by display_order
                if (data.project_images) {
                    data.project_images.sort((a, b) => a.display_order - b.display_order);
                }

                setProject(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [projectId]);

    const router = useRouter();

    if (loading) {
        return null; // or return a loading spinner
    }

    if (error || !project) {
        router.push('/404');
        return null;
    }

    return (
        <div>
            {project && (
                <>
                    {/* Background Image (semantics only if needed, or just remove if purely decorative) - keeping as img tag for content */}
                    {project.img_url && (
                        <p>Background Image: {project.img_url}</p>
                    )}

                    <h1>{project.title}</h1>

                    <div>
                        {/* Image List replacing Slider */}
                        {project.project_images && project.project_images.length > 0 ? (
                            <ul>
                                {project.project_images.map((img) => (
                                    <li key={img.id}>
                                        <img src={img.img_url}
                                             alt={img.caption || `Project image ${img.display_order}`}/>
                                        {img.caption && <p>{img.caption}</p>}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            // Fallback main image if no gallery
                            project.img_url && <img src={project.img_url} alt={project.title}/>
                        )}

                        <div>
                            <p>Job: {project.job}</p>
                            <p>
                                Period: {new Date(project.start_date).toLocaleDateString()} -
                                {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Present'}
                            </p>

                            {/* Tech Stack */}
                            <h3>Tech Stack</h3>
                            <ul>
                                {project.project_techs && project.project_techs.length > 0 ? (
                                    project.project_techs.map((tech) => (
                                        <li key={tech.id}>{tech.tech_name}</li>
                                    ))
                                ) : (
                                    project.tech && <li>{project.tech}</li>
                                )}
                            </ul>
                        </div>
                    </div>

                    <p>{project.description}</p>

                    {project.github_url && (
                        <div>
                            <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                                GitHub Repository
                            </a>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
