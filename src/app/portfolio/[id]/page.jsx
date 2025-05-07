"use client";

import styles from "@/styles/pages/PortfolioProjectPage.module.css";
import {use, useEffect, useState} from "react";
import supabase from "/src/lib/supabase.js";
import {LogoGithub} from "@carbon/icons-react";
import SkeletonLoader from '@/components/SkeletonLoader';

export default function PortfolioProjectPage({params}) {
    const unwrappedParams = use(params);
    const projectId = unwrappedParams?.id;

    const [project, setProject] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const {data, error} = await supabase
                    .from('project')
                    .select('*')
                    .eq('id', projectId)
                    .single();

                if (error) {
                    console.error('Supabase 에러:', error);
                    setError(error.message);
                    return;
                }

                setProject(data);
            } catch (err) {
                console.error('예외 발생:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProject();
    }, [projectId]);

    if (isLoading) {
        return (
            <div className={styles.portfolioProjectPage}>
                <SkeletonLoader page="portfolioDetail" />
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className={styles.portfolioProjectPage}>
                <h1 className="titleText">존재하지 않는 포스트입니다.</h1>
            </div>
        );
    }

    return (
        <div className={styles.portfolioProjectPage}>
            <h1 className="titleText">{project.title}</h1>

            <div className={styles.projectInfo}>
                <img src={project.img_url} alt={project.title}/>

                <div>
                    <p className={styles.jobText}>{project.job}</p>
                    <p className={styles.periodText}>
                        {new Date(project.start_date).toLocaleDateString()} -&nbsp;
                        {project.end_date ? new Date(project.end_date).toLocaleDateString() : '진행중'}
                    </p>
                    <p className={styles.techText}>{project.tech}</p>
                </div>
            </div>

            <p className={styles.descriptionText}>{project.description}</p>

            {project.github_url && (
                <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                    <LogoGithub className={styles.icon}/>
                </a>
            )}
        </div>
    );
}
