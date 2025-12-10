'use client';

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import supabase from "@/lib/supabase";

export default function PortfolioProjectPage({params}) {
    const unwrappedParams = React.use(params);
    const slug = unwrappedParams?.id;
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                setLoading(true);
                const {data, error} = await supabase
                    .from('project')
                    .select('*')
                    .eq('slug', slug)
                    .single();

                if (error) {
                    setError(error.message);
                    return;
                }

                setProject(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [slug]);

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


                    <h1>{project.title}</h1>

                    <div>

                        {project.gallery && project.gallery.length > 0 ? (
                            <ul>
                                {project.gallery.map((img, index) => (
                                    <li key={index}>
                                        <img src={img.url}
                                             alt={img.caption || `Project image ${index + 1}`}/>
                                        {img.caption && <p>{img.caption}</p>}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            project.img_url && <img src={project.img_url} alt={project.title}/>
                        )}

                        <div>
                            <p>Role: {project.role}</p>
                            <p>
                                Period: {new Date(project.start_date).toLocaleDateString()} -
                                {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Present'}
                            </p>

                            <h3>Tech Stack</h3>
                            <ul>
                                {project.tech_stack && project.tech_stack.length > 0 &&
                                    project.tech_stack.map((tech, index) => (
                                        <li key={index}>{tech}</li>
                                    ))
                                }
                            </ul>
                        </div>
                    </div>

                    <p>{project.description}</p>

                    {project.links && project.links.length > 0 && (
                        <div>
                            {project.links.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {link.title}
                                </a>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
