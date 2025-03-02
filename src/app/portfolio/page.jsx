"use client";

import styles from '@/styles/pages/PortfolioPage.module.css';
import {useEffect, useState} from "react";
import supabase from "/src/lib/supabase.js";
import Link from "next/link";

export default function PortfolioPage() {
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

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
                <p>로딩 중...</p>
            ) : error ? (
                <p className={styles.errorMessage}>{error}</p>
            ) : projects.length === 0 ? (
                <p className={styles.noProjects}>게시물이 없습니다.</p>
            ) : (
                <div className={styles.projectList}>
                    {projects.map((project) => (
                        <Link key={project.id} className={styles.projectLink} href={`/portfolio/${project.id}`}>
                            <article className={styles.projectTile}>
                                {project.img_url && (
                                    <img
                                        className={styles.projectThumbnail}
                                        src={project.img_url}
                                        alt={project.title}
                                    />
                                )}
                                <div className={styles.projectInfo}>
                                    <h2>{project.title}</h2>
                                    <p>{project.summary}</p>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
