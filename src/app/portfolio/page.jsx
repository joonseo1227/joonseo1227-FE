"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import supabase from "@/lib/supabase";
import Link from "next/link";
import SkeletonLoader from '@/components/SkeletonLoader';
import EmptyState from '@/components/EmptyState';
import {AnimatePresence, motion} from "framer-motion";
import styles from '@/styles/pages/PortfolioPage.module.css';
import {Filter} from "@carbon/icons-react";

export default function PortfolioPage() {
    const [projects, setProjects] = useState([]);
    const [categories, setCategories] = useState([]);


    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedTech, setSelectedTech] = useState(null);
    const [isTechExpanded, setIsTechExpanded] = useState(false);

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const imgRefs = useRef({});
    const categoryScrollRef = useRef(null);
    const categoryBtnRefs = useRef({});

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                const {data, error} = await supabase
                    .from('project')
                    .select('*, project_technologies(technologies(name))')
                    .order('start_date', {ascending: false});

                if (error) {
                    console.error('포트폴리오 데이터 로딩 실패:', error);
                    setError('프로젝트를 불러올 수 없습니다.');
                    return;
                }

                const loadedProjects = data || [];
                setProjects(loadedProjects);

                const uniqueCategories = new Set(['All']);
                loadedProjects.forEach(p => {
                    if (p.category) uniqueCategories.add(p.category);
                });
                setCategories(Array.from(uniqueCategories));

            } catch (err) {
                console.error('포트폴리오 데이터 로딩 실패:', err);
                setError('프로젝트를 불러올 수 없습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    useEffect(() => {
        if (!loading && projects.length > 0 && isInitialLoad) {
            requestAnimationFrame(() => {
                setIsInitialLoad(false);
            });
        }
    }, [loading, projects, isInitialLoad]);

    const categoryFilteredProjects = selectedCategory === 'All'
        ? projects
        : projects.filter(p => p.category === selectedCategory);

    const techs = useMemo(() => {
        const allowedTechs = new Set();
        categoryFilteredProjects.forEach(p => {
            if (p.project_technologies && Array.isArray(p.project_technologies)) {
                p.project_technologies.forEach(pt => {
                    if (pt.technologies?.name) {
                        allowedTechs.add(pt.technologies.name);
                    }
                });
            }
        });
        return Array.from(allowedTechs).sort();
    }, [categoryFilteredProjects]);

    useEffect(() => {
        setSelectedTech(null);
    }, [selectedCategory]);

    const [indicatorStyle, setIndicatorStyle] = useState({left: 0, width: 0, opacity: 0});

    useEffect(() => {
        if (selectedCategory && categoryBtnRefs.current[selectedCategory]) {
            const btn = categoryBtnRefs.current[selectedCategory];

            // Update indicator position
            setIndicatorStyle({
                left: btn.offsetLeft,
                width: btn.offsetWidth,
                opacity: 1
            });

            // Scroll to center logic
            if (categoryScrollRef.current) {
                const container = categoryScrollRef.current;
                const containerWidth = container.offsetWidth;
                const btnLeft = btn.offsetLeft;
                const btnWidth = btn.offsetWidth;
                const scrollLeft = btnLeft - (containerWidth / 2) + (btnWidth / 2);

                container.scrollTo({
                    left: scrollLeft,
                    behavior: 'smooth'
                });
            }
        }
    }, [selectedCategory, categories]);


    const finalFilteredProjects = selectedTech
        ? categoryFilteredProjects.filter(p =>
            p.project_technologies?.some(pt => pt.technologies?.name === selectedTech)
        )
        : categoryFilteredProjects;


    const handleCategoryChange = (cat) => {
        setSelectedCategory(cat);
    };

    const handleTechChange = (tech) => {
        setSelectedTech(tech);
    };

    return (
        <div className={styles.portfolioPage}>
            <h1 className="titleText">Portfolio</h1>

            <SkeletonLoader isLoading={loading} page="portfolioPage">

                {!loading && categories.length > 0 && (
                    <div className={styles.categoryTabs} ref={categoryScrollRef}>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                ref={el => categoryBtnRefs.current[cat] = el}
                                className={`${styles.categoryTabBtn} ${selectedCategory === cat ? styles.active : ''}`}
                                onClick={() => handleCategoryChange(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                        <div
                            className={styles.activeTabIndicator}
                            style={{
                                left: indicatorStyle.left,
                                width: indicatorStyle.width,
                                opacity: indicatorStyle.opacity
                            }}
                        />
                    </div>
                )}

                {!loading && techs.length > 0 && (
                    <div className={styles.techFilterContainer}>
                        <div className={styles.mobileFilterControls}>
                            <button
                                className={`${styles.filterCircleBtn} ${isTechExpanded ? styles.active : ''}`}
                                onClick={() => setIsTechExpanded(!isTechExpanded)}
                                aria-label="Toggle tech filter"
                            >
                                <Filter/>
                            </button>
                            {selectedTech && (
                                <div className={styles.selectedFilterChip}>
                                    {selectedTech}
                                </div>
                            )}
                        </div>

                        <motion.div
                            className={styles.techList}
                            initial={false}
                            animate={{
                                height: isTechExpanded ? 'auto' : 0,
                                opacity: isTechExpanded ? 1 : 0
                            }}
                            transition={{duration: 0.3, ease: "easeInOut"}}
                            style={{overflow: 'hidden'}}
                        >
                            <button
                                className={`${styles.techBtn} ${selectedTech === null ? styles.active : ''}`}
                                onClick={() => handleTechChange(null)}
                            >
                                전체
                            </button>
                            {techs.map((tech) => (
                                <button
                                    key={tech}
                                    className={`${styles.techBtn} ${selectedTech === tech ? styles.active : ''}`}
                                    onClick={() => handleTechChange(tech)}
                                >
                                    {tech}
                                </button>
                            ))}
                        </motion.div>
                    </div>
                )}

                {error ? (
                    <EmptyState type="error" message={error}/>
                ) : finalFilteredProjects.length === 0 && !loading ? (
                    <EmptyState type="empty" message="게시물이 없습니다."/>
                ) : (
                    <div className={styles.projectGrid}>
                        <AnimatePresence mode="popLayout" initial={false}>
                            {finalFilteredProjects.map((project) => {
                                const handleProjectClick = (e) => {
                                    e.preventDefault();

                                    const imgElement = imgRefs.current[project.id];
                                    if (project.thumbnail_url && imgElement && window.startPortfolioTransition) {
                                        const rect = imgElement.getBoundingClientRect();
                                        window.startPortfolioTransition(
                                            project.slug,
                                            project.thumbnail_url,
                                            {
                                                top: rect.top,
                                                left: rect.left,
                                                width: rect.width,
                                                height: rect.height
                                            },
                                            {sourceElement: imgElement}
                                        );
                                    } else {
                                        window.location.href = `/portfolio/${project.slug}`;
                                    }
                                };

                                const tileVariants = {
                                    hidden: {scale: 0.8, opacity: 0},
                                    visible: {scale: 1, opacity: 1}
                                };

                                return (
                                    <motion.div
                                        key={project.id}
                                        layout
                                        variants={tileVariants}
                                        initial={isInitialLoad ? false : "hidden"}
                                        animate={isInitialLoad ? false : "visible"}
                                        exit="hidden"
                                        transition={{duration: 0.3}}
                                    >
                                        <Link
                                            className={styles.projectLink}
                                            href={`/portfolio/${project.slug}`}
                                            onClick={handleProjectClick}
                                        >
                                            <article className={styles.projectCard}>
                                                {project.thumbnail_url && (
                                                    <img
                                                        ref={el => imgRefs.current[project.id] = el}
                                                        className={styles.projectThumbnail}
                                                        src={project.thumbnail_url}
                                                        alt={project.title}
                                                    />
                                                )}
                                                <div className={styles.cardDescription}>
                                                    <div className={styles.cardHead}>
                                                        <h2 className={styles.projectTitle}>{project.title}</h2>
                                                        {project.summary && (
                                                            <p className={styles.projectSummary}>{project.summary}</p>
                                                        )}
                                                    </div>

                                                    {project.project_technologies && project.project_technologies.length > 0 && (
                                                        <div className={styles.techChipsContainer}>
                                                            {project.project_technologies.slice(0, 4).map((pt) => (
                                                                <span key={pt.technologies.name}
                                                                      className={styles.techChip}>
                                                                    {pt.technologies.name}
                                                                </span>
                                                            ))}
                                                            {project.project_technologies.length > 4 && (
                                                                <span className={styles.techChip}>+</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </article>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </SkeletonLoader>
        </div>
    );
}

