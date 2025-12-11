'use client';

import React, {useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import supabase from "@/lib/supabase";
import styles from '@/styles/pages/PortfolioProjectPage.module.css';
import ReactMarkdown from 'react-markdown';
import {FaAppStoreIos, FaGithub, FaGooglePlay} from "react-icons/fa";
import {ArrowUpRight, ChevronLeft, ChevronRight, Globe, Link} from "@carbon/icons-react";
import {motion, useMotionValue, useScroll, useSpring, useTransform} from "framer-motion";

const FadeInView = ({children, delay = 0}) => {
    return (
        <motion.div
            initial={{opacity: 0, y: 40}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, margin: "-100px"}}
            transition={{duration: 0.8, ease: [0.16, 1, 0.3, 1], delay}}
        >
            {children}
        </motion.div>
    );
};

const MagneticButton = ({children, className, href, target, rel}) => {
    const ref = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springConfig = {stiffness: 600, damping: 30, mass: 0.5};
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    const handleMouseMove = (e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distanceX = e.clientX - centerX;
        const distanceY = e.clientY - centerY;

        x.set(distanceX * 0.1);
        y.set(distanceY * 0.1);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        x.set(0);
        y.set(0);
    };

    return (
        <motion.a
            ref={ref}
            href={href}
            target={target}
            rel={rel}
            className={className}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            style={{x: springX, y: springY}}
            whileHover={{scale: 1.05}}
            whileTap={{scale: 0.95}}
        >
            {children}
        </motion.a>
    );
};

const ImmersiveThumbnail = ({thumbnailUrl, title}) => {
    const thumbnailRef = useRef(null);
    const {scrollYProgress: thumbnailProgress} = useScroll({
        target: thumbnailRef,
        offset: ["start end", "end start"]
    });

    const scale = useTransform(thumbnailProgress, [0.2, 0.35, 0.75], [0.7, 1, 1]);
    const borderRadius = useTransform(thumbnailProgress, [0.2, 0.35], [0, 0]);

    return (
        <section ref={thumbnailRef} className={styles.thumbnailSection}>
            <div className={styles.thumbnailStickyWrapper}>
                <motion.div
                    className={styles.thumbnailContainer}
                    style={{scale}}
                >
                    <motion.img
                        src={thumbnailUrl}
                        alt={`${title} thumbnail`}
                        className={styles.thumbnailImage}
                        style={{borderRadius}}
                    />
                </motion.div>
            </div>
        </section>
    );
};

export default function PortfolioProjectPage({params}) {
    const unwrappedParams = React.use(params);
    const slug = unwrappedParams?.id;
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    return (
        <main className={styles.container}>
            {/* Header / Hero */}
            <section className={styles.heroSection}>
                <FadeInView delay={0}>
                    {project.category && (
                        <motion.span
                            className={styles.categoryLabel}
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.6}}
                        >
                            {project.category}
                        </motion.span>
                    )}
                </FadeInView>

                <FadeInView delay={0.1}>
                    <motion.h1
                        className={styles.projectTitle}
                        initial={{opacity: 0, scale: 0.95}}
                        animate={{opacity: 1, scale: 1}}
                        transition={{duration: 0.8, ease: [0.16, 1, 0.3, 1]}}
                    >
                        {project.title}
                    </motion.h1>
                </FadeInView>

                {project.summary && (
                    <FadeInView delay={0.2}>
                        <p className={styles.summaryText}>{project.summary}</p>
                    </FadeInView>
                )}

                <FadeInView delay={0.3}>
                    <div className={styles.projectMeta}>
                        <div className={styles.metaItem}>
                            <span>{project.role || 'Creator'}</span>
                        </div>
                        <div className={styles.metaItem}>
                            <span>{formatDate(project.start_date)} - {formatDate(project.end_date)}</span>
                        </div>
                    </div>
                </FadeInView>

                {/* Tech Stack - Hero Meta */}
                {techStack.length > 0 && (
                    <FadeInView delay={0.4}>
                        <div className={styles.techStackMeta}>
                            {techStack.map((tech, idx) => (
                                <motion.span
                                    key={idx}
                                    className={styles.techBadge}
                                    initial={{opacity: 0, scale: 0.8}}
                                    animate={{opacity: 1, scale: 1}}
                                    transition={{duration: 0.4, delay: 0.4 + idx * 0.05}}
                                    whileHover={{scale: 1.08}}
                                >
                                    {tech}
                                </motion.span>
                            ))}
                        </div>
                    </FadeInView>
                )}
            </section>

            {/* Thumbnail with Immersive Parallax */}
            {project.thumbnail_url && (
                <ImmersiveThumbnail
                    thumbnailUrl={project.thumbnail_url}
                    title={project.title}
                />
            )}

            {/* Content Body */}
            <div className={styles.contentWrapper}>

                {/* Dynamic Content Sections */}
                {project.content_sections && project.content_sections.map((section, idx) => (
                    <FadeInView key={idx} delay={idx * 0.1}>
                        <section className={styles.section}>
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
                                <motion.blockquote
                                    className={styles.quoteBlock}
                                    whileHover={{scale: 1.01, x: 10}}
                                    transition={{duration: 0.3}}
                                >
                                    <p>"{section.content}"</p>
                                    {section.author && <footer>— {section.author}</footer>}
                                </motion.blockquote>
                            )}

                            {section.type === 'image' && section.url && (
                                <figure className={styles.contentImageWrapper}>
                                    <motion.img
                                        src={section.url}
                                        alt={section.caption || 'Project visual'}
                                        className={styles.contentImage}
                                        whileHover={{scale: 1.02}}
                                        transition={{duration: 0.4, ease: [0.16, 1, 0.3, 1]}}
                                    />
                                    {section.caption && <figcaption>{section.caption}</figcaption>}
                                </figure>
                            )}
                        </section>
                    </FadeInView>
                ))}

                {/* Key Features */}
                {project.key_features && project.key_features.length > 0 && (
                    <FadeInView>
                        <section className={styles.section}>
                            <h2 className={styles.sectionTitle}>Key Features</h2>
                            <div className={styles.featureList}>
                                {project.key_features.map((feature, idx) => (
                                    <motion.div
                                        key={idx}
                                        className={styles.featureItem}
                                        initial={{opacity: 0, y: 20}}
                                        whileInView={{opacity: 1, y: 0}}
                                        viewport={{once: true}}
                                        transition={{duration: 0.5, delay: idx * 0.1}}
                                        whileHover={{
                                            scale: 1.02,
                                            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)"
                                        }}
                                    >
                                        <p className={styles.featureText}>{feature}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    </FadeInView>
                )}
            </div>

            {/* Gallery - Horizontal Scroll with 3D Effect */}
            {project.gallery && project.gallery.length > 0 && (
                <FadeInView>
                    <section className={styles.gallerySection}>
                        <div className={styles.gallerySectionHeader}>
                            <h2 className={styles.sectionTitle}>Gallery</h2>
                            <div className={styles.galleryNav}>
                                <button
                                    onClick={() => {
                                        const container = document.getElementById('gallery-container');
                                        if (container) container.scrollBy({left: -500, behavior: 'smooth'});
                                    }}
                                    className={styles.galleryNavBtn}
                                >
                                    <ChevronLeft size={24}/>
                                </button>
                                <button
                                    onClick={() => {
                                        const container = document.getElementById('gallery-container');
                                        if (container) container.scrollBy({left: 500, behavior: 'smooth'});
                                    }}
                                    className={styles.galleryNavBtn}
                                >
                                    <ChevronRight size={24}/>
                                </button>
                            </div>
                        </div>

                        <div id="gallery-container" className={styles.galleryContainer}>
                            <div className={styles.galleryTrack}>
                                {project.gallery.map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        className={styles.galleryCard}
                                        initial={{opacity: 0, scale: 0.9}}
                                        whileInView={{opacity: 1, scale: 1}}
                                        viewport={{once: true, amount: 0.3}}
                                        transition={{duration: 0.6, ease: [0.16, 1, 0.3, 1]}}
                                    >
                                        <img
                                            src={item.url}
                                            alt={`Gallery ${idx + 1}`}
                                            className={styles.galleryCardImage}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                </FadeInView>
            )}

            {/* External Links with Magnetic Effect */}
            {project.links && project.links.length > 0 && (
                <FadeInView>
                    <section className={styles.linkSection}>
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
                                    <motion.div
                                        key={idx}
                                        initial={{opacity: 0, y: 20}}
                                        whileInView={{opacity: 1, y: 0}}
                                        viewport={{once: true}}
                                        transition={{duration: 0.5, delay: idx * 0.1}}
                                    >
                                        <MagneticButton
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.linkCard}
                                        >
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
                                        </MagneticButton>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </section>
                </FadeInView>
            )}
        </main>
    );
}

