"use client";

import styles from '@/styles/pages/PortfolioPage.module.css';
import {useEffect, useRef, useState} from "react";
import supabase from "/src/lib/supabase.js";
import Link from "next/link";
import SkeletonLoader from '@/components/SkeletonLoader';

export default function PortfolioPage() {
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const imgRefs = useRef({});

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                const {data, error} = await supabase
                    .from('project')
                    .select('*')
                    .order('start_date', {ascending: false});

                if (error) {
                    console.error('Supabase 에러:', error);
                    setError(error.message);
                    return;
                }

                setProjects(data || []);
            } catch (err) {
                console.error('예외 발생:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);


    if (error) {
        return <div>에러가 발생했습니다: {error}</div>;
    }

    return (
        <div className={styles.portfolioPage}>
            <h1 className="titleText">Portfolio</h1>

            {loading ? (
                <SkeletonLoader page="portfolioList"/>
            ) : error ? (
                <p className={styles.errorMessage}>{error}</p>
            ) : projects.length === 0 ? (
                <p className={styles.noProjects}>게시물이 없습니다.</p>
            ) : (
                <div className={styles.projectList}>
                    {projects.map((project) => {
                        const handleProjectClick = (e) => {
                            e.preventDefault();

                            if (project.img_url && imgRefs.current[project.id] && window.startProjectTransition) {
                                const rect = imgRefs.current[project.id].getBoundingClientRect();
                                window.startProjectTransition(
                                    project.id,
                                    project.img_url,
                                    {
                                        top: rect.top,
                                        left: rect.left,
                                        width: rect.width,
                                        height: rect.height
                                    }
                                );
                            } else {
                                // Fallback to normal navigation if animation can't be triggered
                                window.location.href = `/portfolio/${project.id}`;
                            }
                        };

                        return (
                            <Link
                                key={project.id}
                                className={styles.projectLink}
                                href={`/portfolio/${project.id}`}
                                onClick={handleProjectClick}
                            >
                                <article className={styles.projectTile}>
                                    {project.img_url && (
                                        <img
                                            ref={el => imgRefs.current[project.id] = el}
                                            className={styles.projectThumbnail}
                                            src={project.img_url}
                                            alt={project.title}
                                        />
                                    )}
                                    <h2 className={styles.projectTitle}>{project.title}</h2>
                                </article>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
