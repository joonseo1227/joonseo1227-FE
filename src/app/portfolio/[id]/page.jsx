import {notFound} from 'next/navigation';
import styles from "@/styles/pages/PortfolioProjectPage.module.css";
import supabase from "/src/lib/supabase.js";
import {LogoGithub} from "@carbon/icons-react";
import LinkButton from '@/components/LinkButton';
import ImageSlider from '@/components/ImageSlider';

// Generate static paths at build time
export async function generateStaticParams() {
    const {data: projects} = await supabase
        .from('project')
        .select('id');

    return projects?.map((project) => ({
        id: project.id,
    })) || [];
}

export default async function PortfolioProjectPage({params}) {
    const projectId = params?.id;

    // Fetch project data with related tech stacks and images
    const {data: project, error} = await supabase
        .from('project')
        .select(`
            *,
            project_techs(id, tech_name),
            project_images(id, img_url, caption, display_order)
        `)
        .eq('id', projectId)
        .single();

    if (error || !project) {
        notFound();
    }

    // Sort images by display_order
    if (project.project_images) {
        project.project_images.sort((a, b) => a.display_order - b.display_order);
    }

    return (
        <div className={styles.portfolioProjectPage}>
            <div className={styles.projectHeader}>
                <h1 className="titleText">{project.title}</h1>
            </div>

            <div className={styles.projectInfo}>
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
                            project.project_techs.map(tech => (
                                <span key={tech.id} className={styles.techTag}>
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

            <p className={styles.descriptionText}>{project.description}</p>

            {project.github_url && (
                <LinkButton
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <LogoGithub size={24} className={styles.icon}/>GitHub
                </LinkButton>
            )}
        </div>
    );
}
