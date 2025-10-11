"use client";

import styles from '@/styles/pages/PortfolioPage.module.css';
import {useEffect, useRef, useState} from "react";
import supabase from "/src/lib/supabase.js";
import Link from "next/link";
import SkeletonLoader from '@/components/SkeletonLoader';
import EmptyState from '@/components/EmptyState';

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
                    console.error('포트폴리오 데이터 로딩 실패:', error);
                    setError('프로젝트를 불러올 수 없습니다.');
                    return;
                }

                setProjects(data || []);
            } catch (err) {
                console.error('포트폴리오 데이터 로딩 실패:', err);
                setError('프로젝트를 불러올 수 없습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);


    return (
        <div className={styles.portfolioPage}>
            <h1 className="titleText">Portfolio</h1>

            {loading ? (
                <SkeletonLoader page="portfolioPage"/>
            ) : error ? (
                <EmptyState type="error" message={error}/>
            ) : projects.length === 0 ? (
                <EmptyState type="empty" message="게시물이 없습니다."/>
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
