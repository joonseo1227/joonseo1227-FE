'use client';

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import styles from "@/styles/pages/PortfolioProjectPage.module.css";
import supabase from "/src/lib/supabase.js";
import {LogoGithub} from "@carbon/icons-react";
import LinkButton from '@/components/LinkButton';
import ImageSlider from '@/components/ImageSlider';
import {useInView} from 'react-intersection-observer';

export default function PortfolioProjectPage({params}) {
    const unwrappedParams = React.use(params);
    const projectId = unwrappedParams?.id;
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const observerOptions = {
        triggerOnce: true,
        threshold: 0.1,
        rootMargin: '-50px 0px -100px 0px', // Trigger earlier for smoother transitions
    };

    // Title section
    const [titleRef, titleInView] = useInView({
        ...observerOptions,
        threshold: 0.2, // Higher threshold for title to ensure it's more visible
    });

    // Project info section
    const [infoRef, infoInView] = useInView({
        ...observerOptions,
        delay: 100
    });

    // Description section
    const [descRef, descInView] = useInView({
        ...observerOptions,
        delay: 150
    });

    // GitHub button section
    const [buttonRef, buttonInView] = useInView({
        ...observerOptions,
        delay: 200
    });

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

    // End the transition when loading is complete
    useEffect(() => {
        if (!loading && window.endProjectTransition) {
            window.endProjectTransition();
        }
    }, [loading]);

    const router = useRouter();

    if (error || !project) {
        router.push('/404');
        return null;
    }

    return (
        <div className={styles.portfolioProjectPage}>
            {project && (
                project.img_url && (
                    <div
                        key={`bg-main`}
                        className={styles.blurredBackground}
                        style={{backgroundImage: `url(${project.img_url})`}}
                    />
                )
            )}
            <div
                ref={titleRef}
                className={`${styles.projectHeader} ${titleInView ? styles.animate : ''}`}
            >
                <h1 className="titleText">{project.title}</h1>
            </div>

            <div
                ref={infoRef}
                className={`${styles.projectInfo} ${infoInView ? styles.animate : ''}`}
            >
                {/* Image Gallery/Carousel */}
                <ImageSlider
                    images={project.project_images}
                    defaultImage={project.img_url}
                />

                <div className={styles.projectDetails}>
                    <p className={styles.jobText}>{project.job}</p>
                    <p className={styles.periodText}>
                        {new Date(project.start_date).toLocaleDateString()} -&nbsp;
                        {project.end_date ? new Date(project.end_date).toLocaleDateString() : '진행중'}
                    </p>

                    {/* Tech Stack Tags */}
                    <div className={styles.techStackContainer}>
                        {project.project_techs && project.project_techs.length > 0 ? (
                            project.project_techs.map((tech, i) => (
                                <span
                                    key={tech.id}
                                    className={styles.techTag}
                                    style={{animationDelay: `${i * 80 + 100}ms`}}
                                >
                                    {tech.tech_name}
                                </span>
                            ))
                        ) : (
                            // Fallback to the original tech field if no tech stacks in the new table
                            project.tech && <p className={styles.techText}>{project.tech}</p>
                        )}
                    </div>
                </div>
            </div>

            <p
                ref={descRef}
                className={`${styles.descriptionText} ${descInView ? styles.animate : ''}`}
            >
                {project.description}
            </p>

            {project.github_url && (
                <div
                    ref={buttonRef}
                    className={`${styles.buttonContainer} ${buttonInView ? styles.animate : ''}`}
                >
                    <LinkButton
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <LogoGithub size={24} className={styles.icon}/>GitHub
                    </LinkButton>
                </div>
            )}
        </div>
    );
}
