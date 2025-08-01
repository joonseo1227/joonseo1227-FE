"use client";

import {useEffect, useRef, useState} from "react";
import Link from "next/link";
import styles from '@/styles/pages/HomePage.module.css';
import supabase from "/src/lib/supabase.js";

export default function HomePage() {
    // Refs for intersection observer
    const aboutRef = useRef(null);
    const worksRef = useRef(null);
    const blogRef = useRef(null);
    const contactRef = useRef(null);

    // State for iOS detection
    const [isIOS, setIsIOS] = useState(false);

    // State for visibility of sections
    const [visibleSections, setVisibleSections] = useState({
        about: false,
        works: false,
        blog: false,
        contact: false
    });

    // State for real data
    const [projects, setProjects] = useState([]);
    const [blogPosts, setBlogPosts] = useState([]);
    const [loading, setLoading] = useState({
        projects: true,
        posts: true
    });
    const [error, setError] = useState(null);

    // Refs for project and blog post images (for transition animation)
    const imgRefs = useRef({});
    const blogImgRefs = useRef({});

    // Detect iOS devices
    useEffect(() => {
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIOSDevice);
    }, []);

    // Setup intersection observer for animations
    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const handleIntersect = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.dataset.section;
                    if (sectionId) {
                        setVisibleSections(prev => ({
                            ...prev,
                            [sectionId]: true
                        }));
                        // Once visible, no need to observe anymore
                        observer.unobserve(entry.target);
                    }
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersect, observerOptions);

        if (aboutRef.current) {
            observer.observe(aboutRef.current);
        }

        if (worksRef.current) {
            observer.observe(worksRef.current);
        }

        if (blogRef.current) {
            observer.observe(blogRef.current);
        }

        if (contactRef.current) {
            observer.observe(contactRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    // Fetch portfolio projects
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(prev => ({...prev, projects: true}));
                const {data, error} = await supabase
                    .from('project')
                    .select('*')
                    .order('start_date', {ascending: false})
                    .limit(4);

                if (error) {
                    console.error('Supabase error:', error);
                    setError(error.message);
                    return;
                }

                setProjects(data || []);
            } catch (err) {
                console.error('Exception:', err);
                setError(err.message);
            } finally {
                setLoading(prev => ({...prev, projects: false}));
            }
        };

        fetchProjects();
    }, []);

    // Fetch blog posts
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(prev => ({...prev, posts: true}));
                const {data, error} = await supabase
                    .from('posts')
                    .select('*')
                    .eq('status', 'published')
                    .order('created_at', {ascending: false})
                    .limit(3);

                if (error) {
                    console.error('Supabase error:', error);
                    setError(error.message);
                    return;
                }

                setBlogPosts(data || []);
            } catch (err) {
                console.error('Exception:', err);
                setError(err.message);
            } finally {
                setLoading(prev => ({...prev, posts: false}));
            }
        };

        fetchPosts();
    }, []);

    return (
        <div className={styles.homePage}>
            {/* Hero Section */}
            <section className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        {isIOS ? (
                            <>
                                경험의 디테일을<br/>
                                구현하는<br/>
                                프론트엔드 개발자
                            </>
                        ) : (
                            <>
                                경험의 디테일을 구현하는<br/>
                                프론트엔드 개발자
                            </>
                        )}
                    </h1>
                    <div className={styles.scrollDown}>↓</div>
                </div>
            </section>

            {/* About Me Section */}
            <section className={styles.aboutSection} data-section="about" ref={aboutRef}>
                <div className={styles.aboutContent}>
                    <div className={`${styles.aboutText} ${visibleSections.about ? styles.visible : ''}`}>
                        <p>
                            가장 작은 디테일이 가장 큰 차이를 만든다고 믿습니다.<br/>
                            사용자가 느끼는 미세한 순간까지 고민하는 개발을 추구합니다.
                        </p>
                    </div>
                </div>
            </section>

            {/* Works Section */}
            <section className={styles.worksSection} data-section="works" ref={worksRef}>
                <div className={styles.sectionHeader}>
                    <Link href="/portfolio" className={styles.sectionLabelLink}>
                        <span className={styles.sectionLabel}>Portfolio <span
                            className={styles.arrowIcon}>→</span></span>
                    </Link>
                    <h2 className={styles.sectionTitle}>Works</h2>
                </div>
                <div className={styles.worksGrid}>
                    {loading.projects ? (
                        // Loading state for projects
                        Array(4).fill(0).map((_, index) => (
                            <div
                                key={index}
                                className={`${styles.workCard} ${styles.workCardSkeleton}`}
                            ></div>
                        ))
                    ) : projects.length === 0 ? (
                        <p className={styles.noContent}>No projects available</p>
                    ) : (
                        projects.map((project, index) => {
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
                                        },
                                        'portfolio' // Explicitly specify 'portfolio' as the route
                                    );
                                } else {
                                    // Fallback to normal navigation if animation can't be triggered
                                    window.location.href = `/portfolio/${project.id}`;
                                }
                            };

                            return (
                                <Link
                                    href={`/portfolio/${project.id}`}
                                    key={project.id}
                                    onClick={handleProjectClick}
                                >
                                    <div
                                        className={`${styles.workCard} ${visibleSections.works ? styles.visible : ''}`}
                                        style={{animationDelay: `${0.1 + index * 0.1}s`}}
                                    >
                                        <img
                                            ref={el => imgRefs.current[project.id] = el}
                                            src={project.img_url}
                                            alt={project.title}
                                            className={styles.workCardImage}
                                        />
                                        <div className={styles.workCardInfo}>
                                            <h3 className={styles.workCardTitle}>{project.title}</h3>
                                            <p className={styles.workCardDescription}>{project.summary}</p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>
            </section>

            {/* Blog Section - Newsroom Style */}
            <section className={styles.blogSection} data-section="blog" ref={blogRef}>
                <div className={styles.sectionHeader}>
                    <Link href="/blog" className={styles.sectionLabelLink}>
                        <span className={styles.sectionLabel}>Blog <span className={styles.arrowIcon}>→</span></span>
                    </Link>
                    <h2 className={styles.sectionTitle}>Insights</h2>
                </div>
                <div className={styles.blogList}>
                    {loading.posts ? (
                        // Loading state for blog posts
                        Array(3).fill(0).map((_, index) => (
                            <div
                                key={index}
                                className={`${styles.blogCard} ${styles.blogCardSkeleton}`}
                            ></div>
                        ))
                    ) : blogPosts.length === 0 ? (
                        <p className={styles.noContent}>블로그 포스트가 없습니다.</p>
                    ) : (
                        blogPosts.map((post, index) => {
                            const handleBlogClick = (e) => {
                                e.preventDefault();

                                if (post.thumbnail_url && blogImgRefs.current[post.id] && window.startProjectTransition) {
                                    const rect = blogImgRefs.current[post.id].getBoundingClientRect();
                                    window.startProjectTransition(
                                        post.id,
                                        post.thumbnail_url,
                                        {
                                            top: rect.top,
                                            left: rect.left,
                                            width: rect.width,
                                            height: rect.height
                                        },
                                        'blog' // Specify 'blog' as the route
                                    );
                                } else {
                                    // Fallback to normal navigation if animation can't be triggered
                                    window.location.href = `/blog/${post.id}`;
                                }
                            };

                            return (
                                <Link
                                    href={`/blog/${post.id}`}
                                    key={post.id}
                                    onClick={handleBlogClick}
                                >
                                    <div
                                        className={`${styles.blogCard} ${visibleSections.blog ? styles.visible : ''}`}
                                        style={{animationDelay: `${0.1 + index * 0.1}s`}}
                                    >
                                        <div className={styles.blogCardContent}>
                                            <div className={styles.blogCardMeta}>
                                                <span className={styles.blogCardDate}>
                                                    {new Date(post.created_at).toLocaleDateString('ko-KR')}
                                                </span>
                                            </div>
                                            <h3 className={styles.blogCardTitle}>{post.title}</h3>
                                            <p className={styles.blogCardExcerpt}>{post.summary}</p>
                                        </div>
                                        {post.thumbnail_url && (
                                            <div className={styles.blogCardThumbnail}>
                                                <img
                                                    ref={el => blogImgRefs.current[post.id] = el}
                                                    src={post.thumbnail_url}
                                                    alt={post.title}
                                                    className={styles.blogCardImage}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>
            </section>

        </div>
    );
}
