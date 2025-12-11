'use client';

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import supabase from "@/lib/supabase";
import styles from '@/styles/pages/PortfolioProjectPage.module.css';
import ReactMarkdown from 'react-markdown';
import {FaAppStoreIos, FaGithub, FaGooglePlay} from "react-icons/fa";
import {ArrowUpRight, Globe, Link} from "@carbon/icons-react";

export default function PortfolioProjectPage({params}) {
    const unwrappedParams = React.use(params);
    const slug = unwrappedParams?.id;
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orientation, setOrientation] = useState(null);

    const router = useRouter();

    useEffect(() => {
        const fetchProject = async () => {
            if (!slug) return;

            try {
                setLoading(true);
                const {data, error} = await supabase
                    .from('project')
                    .select('*, project_technologies(technologies(name, icon_url))')
                    .eq('slug', slug)
                    .single();

                if (error) throw error;
                setProject(data);
            } catch (err) {
                console.error("Error fetching project:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [slug]);

    if (loading) {
        return <div className={styles.container} style={{minHeight: '100vh'}}/>;
    }

    if (error || !project) {
        return (
            <div className={styles.container} style={{textAlign: 'center', paddingTop: '100px'}}>
                <h1>Project not found</h1>
                <button onClick={() => router.back()} className={styles.linkButton} style={{marginTop: '20px'}}>Go
                    Back
                </button>
            </div>
        );
    }

    const techStack = project.project_technologies?.map(pt => pt.technologies?.name).filter(Boolean) || [];

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Present';
        const date = new Date(dateStr);
        return date.toLocaleDateString('ko-KR', {year: 'numeric', month: 'long'});
    };


    const handleImageLoad = (e) => {
        if (orientation) return;

        const {naturalWidth, naturalHeight} = e.target;
        if (naturalHeight > naturalWidth) {
            setOrientation('portrait');
        } else {
            setOrientation('landscape');
        }
    };

    return (
        <main className={styles.container}>
            {/* Header / Hero */}
            <section className={`${styles.heroSection} ${styles.fadeIn}`}>
                {project.category && (
                    <span className={styles.categoryLabel}>{project.category}</span>
                )}
                <h1 className={styles.projectTitle}>{project.title}</h1>

                {project.summary && (
                    <p className={styles.summaryText}>{project.summary}</p>
                )}

                <div className={styles.projectMeta}>
                    <div className={styles.metaItem}>
                        <span>{project.role || 'Creator'}</span>
                    </div>
                    <div className={styles.metaItem}>
                        <span>{formatDate(project.start_date)} - {formatDate(project.end_date)}</span>
                    </div>
                </div>
            </section>

            {/* Thumbnail */}
            {project.thumbnail_url && (
                <div className={`${styles.thumbnailWrapper} ${styles.fadeIn} ${styles.delay1}`}>
                    <img
                        src={project.thumbnail_url}
                        alt={`${project.title} thumbnail`}
                        className={styles.thumbnailImage}
                    />
                </div>
            )}

            {/* Content Body */}
            <div className={`${styles.contentWrapper} ${styles.fadeIn} ${styles.delay2}`}>

                {/* Dynamic Content Sections */}
                {project.content_sections && project.content_sections.map((section, idx) => (
                    <section key={idx} className={styles.section}>
                        {section.title && <h3 className={styles.contentTitle}>{section.title}</h3>}

                        {section.type === 'text' && (
                            <div className={styles.contentText}>
                                <ReactMarkdown
                                    components={{
                                        li: ({node, ...props}) => <li className={styles.listItem} {...props} />,
                                        p: ({node, ...props}) => <p className={styles.paragraph} {...props} />
                                    }}
                                >
                                    {section.content}
                                </ReactMarkdown>
                            </div>
                        )}

                        {section.type === 'quote' && (
                            <blockquote className={styles.quoteBlock}>
                                <p>"{section.content}"</p>
                                {section.author && <footer>— {section.author}</footer>}
                            </blockquote>
                        )}

                        {section.type === 'image' && section.url && (
                            <figure className={styles.contentImageWrapper}>
                                <img src={section.url} alt={section.caption || 'Project visual'}
                                     className={styles.contentImage}/>
                                {section.caption && <figcaption>{section.caption}</figcaption>}
                            </figure>
                        )}
                    </section>
                ))}

                {/* Key Features */}
                {project.key_features && project.key_features.length > 0 && (
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Key Features</h2>
                        <div className={styles.featureList}>
                            {project.key_features.map((feature, idx) => (
                                <div key={idx} className={styles.featureItem}>
                                    <p className={styles.featureText}>{feature}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Tech Stack */}
                {techStack.length > 0 && (
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Technologies</h2>
                        <div className={styles.techGrid}>
                            {techStack.map((tech, idx) => (
                                <span key={idx} className={styles.techBadge}>{tech}</span>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Gallery (Adaptive Grid) */}
            {project.gallery && project.gallery.length > 0 && (
                <section className={`${styles.section} ${styles.fadeIn} ${styles.delay3}`}>
                    {/* Render a hidden image to detect orientation if not yet set */}
                    {!orientation && (
                        <img
                            src={project.gallery[0].url}
                            alt="Orientation Detector"
                            style={{display: 'none'}}
                            onLoad={handleImageLoad}
                        />
                    )}

                    <div className={`
                        ${styles.galleryGrid} 
                        ${orientation === 'portrait' ? styles.portraitGrid : styles.landscapeGrid}
                    `}>
                        {project.gallery.map((item, idx) => (
                            <div key={idx} className={styles.galleryItem}>
                                <img src={item.url} alt={`Gallery ${idx + 1}`} className={styles.galleryImage}/>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* External Links */}
            {project.links && project.links.length > 0 && (
                <section className={`${styles.linkSection} ${styles.fadeIn} ${styles.delay3}`}>
                    <h2 className={styles.sectionTitle}>Project Links</h2>
                    <div className={styles.linkGrid}>
                        {project.links.map((link, idx) => {
                            const getIcon = (title) => {
                                const lowerTitle = title?.toLowerCase() || '';
                                if (lowerTitle.includes('github')) {
                                    return <FaGithub size={28}/>;
                                } else if (lowerTitle.includes('app store') || lowerTitle.includes('ios')) {
                                    return <FaAppStoreIos size={28}/>;
                                } else if (lowerTitle.includes('play store') || lowerTitle.includes('google play') || lowerTitle.includes('android')) {
                                    return <FaGooglePlay size={28}/>;
                                } else if (lowerTitle.includes('demo') || lowerTitle.includes('live') || lowerTitle.includes('website')) {
                                    return <Globe size={28}/>;
                                }
                                return <Link size={28}/>;
                            };

                            return (
                                <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer"
                                   className={styles.linkCard}>
                                    <div className={styles.linkContent}>
                                        <div className={styles.linkIcon}>
                                            {getIcon(link.title)}
                                        </div>
                                        <div className={styles.linkInfo}>
                                            <h4 className={styles.linkTitle}>{link.title || 'Visit Link'}</h4>
                                            <p className={styles.linkUrl}>
                                                {(() => {
                                                    try {
                                                        return new URL(link.url).hostname.replace('www.', '');
                                                    } catch {
                                                        return link.url;
                                                    }
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={styles.linkArrow}>
                                        <ArrowUpRight size={20}/>
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                </section>
            )}
        </main>
    );
}
