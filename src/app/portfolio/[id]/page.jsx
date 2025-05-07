"use client";

import styles from "@/styles/pages/PortfolioProjectPage.module.css";
import {use, useEffect, useRef, useState} from "react";
import supabase from "/src/lib/supabase.js";
import {ChevronLeft, ChevronRight, LogoGithub} from "@carbon/icons-react";
import SkeletonLoader from '@/components/SkeletonLoader';
import LinkButton from '@/components/LinkButton';

export default function PortfolioProjectPage({params}) {
    const unwrappedParams = use(params);
    const projectId = unwrappedParams?.id;

    const [project, setProject] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [showNavigationOnMobile, setShowNavigationOnMobile] = useState(false);

    // Touch swipe functionality
    const galleryRef = useRef(null);
    const sliderRef = useRef(null);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);

    // Handle touch events for swipe functionality
    const handleTouchStart = (e) => {
        if (!project?.project_images || project.project_images.length <= 1) return;

        setIsDragging(true);
        setTouchStart(e.touches[0].clientX);
        setTouchEnd(e.touches[0].clientX);

        // Remove transition during dragging for immediate response
        if (sliderRef.current) {
            sliderRef.current.style.transition = 'none';
        }
    };

    const handleTouchMove = (e) => {
        if (!isDragging || !touchStart) return;

        const currentTouch = e.touches[0].clientX;
        setTouchEnd(currentTouch);

        // Calculate how far we've dragged
        const currentOffset = currentTouch - touchStart;
        setDragOffset(currentOffset);

        // Use requestAnimationFrame for smoother animations
        requestAnimationFrame(() => {
            // Apply the transform to move the slider with the finger
            if (sliderRef.current) {
                const translateX = -activeImageIndex * 100 + (currentOffset / sliderRef.current.offsetWidth * 100);
                sliderRef.current.style.transform = `translateX(${translateX}%)`;
            }
        });
    };

    const handleTouchEnd = () => {
        if (!isDragging || !touchStart || !touchEnd) return;
        if (!project?.project_images || project.project_images.length <= 1) return;

        // Restore the transition for smooth animation after release
        if (sliderRef.current) {
            sliderRef.current.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)';
        }

        const distance = touchStart - touchEnd;
        const threshold = 50; // Minimum distance to trigger a swipe

        if (Math.abs(distance) > threshold) {
            let nextIndex;
            if (distance > 0 && project.project_images.length > 1) {
                // Swipe left - go to next image
                nextIndex = activeImageIndex === project.project_images.length - 1 ? 0 : activeImageIndex + 1;
            } else if (distance < 0 && project.project_images.length > 1) {
                // Swipe right - go to previous image
                nextIndex = activeImageIndex === 0 ? project.project_images.length - 1 : activeImageIndex - 1;
            }

            // Apply smooth transition to the next image
            if (sliderRef.current && nextIndex !== undefined) {
                sliderRef.current.style.transform = `translateX(-${nextIndex * 100}%)`;

                // Update the active index after the animation completes
                setTimeout(() => {
                    setActiveImageIndex(nextIndex);
                    setShowNavigationOnMobile(true);
                }, 500); // Match the transition duration (0.5s)
            }
        } else {
            // If the swipe wasn't far enough, snap back to the current image with smooth animation
            if (sliderRef.current) {
                sliderRef.current.style.transform = `translateX(-${activeImageIndex * 100}%)`;
            }
        }

        // Reset states
        setIsDragging(false);
        setDragOffset(0);
        setTouchStart(null);
        setTouchEnd(null);
    };

    // Effect to update slider position when activeImageIndex changes
    useEffect(() => {
        if (sliderRef.current && !isDragging && project?.project_images?.length > 1) {
            sliderRef.current.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)';
            sliderRef.current.style.transform = `translateX(-${activeImageIndex * 100}%)`;
        }
    }, [activeImageIndex, isDragging, project]);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                // Fetch project data with related tech stacks and images
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
                    console.error('Supabase 에러:', error);
                    setError(error.message);
                    return;
                }

                // Sort images by display_order
                if (data.project_images) {
                    data.project_images.sort((a, b) => a.display_order - b.display_order);
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

    // Initialize slider position when project data is loaded
    useEffect(() => {
        if (project && sliderRef.current && project.project_images?.length > 0) {
            // Short delay to ensure the slider is fully rendered
            setTimeout(() => {
                sliderRef.current.style.transition = 'none';
                sliderRef.current.style.transform = `translateX(-${activeImageIndex * 100}%)`;
                // Re-enable transitions after initial positioning
                setTimeout(() => {
                    if (sliderRef.current) {
                        sliderRef.current.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)';
                    }
                }, 50);
            }, 0);
        }
    }, [project, activeImageIndex]);

    // Hide navigation controls on mobile after a timeout
    useEffect(() => {
        let timeoutId;
        if (showNavigationOnMobile) {
            timeoutId = setTimeout(() => {
                setShowNavigationOnMobile(false);
            }, 2000); // Hide after 2 seconds
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [showNavigationOnMobile]);

    if (isLoading) {
        return (
            <div className={styles.portfolioProjectPage}>
                <SkeletonLoader page="portfolioDetail"/>
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
            <div className={styles.projectHeader}>
                <h1 className="titleText">{project.title}</h1>
            </div>

            <div className={styles.projectInfo}>
                {/* Image Gallery/Carousel */}
                <div
                    className={styles.imageGallery}
                    ref={galleryRef}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {project.project_images && project.project_images.length > 0 ? (
                        <>
                            <div
                                className={styles.imageSlider}
                                ref={sliderRef}
                                style={{transform: `translateX(-${activeImageIndex * 100}%)`}}
                            >
                                {project.project_images.map((image, index) => (
                                    <div
                                        key={image.id}
                                        className={styles.imageItem}
                                    >
                                        <div
                                            className={styles.imageBackground}
                                            style={{backgroundImage: `url(${image.img_url})`}}
                                        ></div>
                                        <div className={styles.imageContainer}>
                                            <img src={image.img_url} alt={image.caption || project.title}/>
                                        </div>
                                        {image.caption && <p className={styles.imageCaption}>{image.caption}</p>}
                                    </div>
                                ))}
                            </div>

                            {/* Navigation buttons - only show if there are multiple images */}
                            {project.project_images.length > 1 && (
                                <div
                                    className={`${styles.imageNavigation} ${showNavigationOnMobile ? styles.showNavigation : ''}`}>
                                    <button
                                        className={styles.navButton}
                                        onClick={() => {
                                            const nextIndex = activeImageIndex === 0
                                                ? project.project_images.length - 1
                                                : activeImageIndex - 1;

                                            // Apply smooth transition
                                            if (sliderRef.current) {
                                                sliderRef.current.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)';
                                                sliderRef.current.style.transform = `translateX(-${nextIndex * 100}%)`;

                                                // Update state after animation completes
                                                setTimeout(() => {
                                                    setActiveImageIndex(nextIndex);
                                                    setShowNavigationOnMobile(true);
                                                }, 500);
                                            }
                                        }}
                                        aria-label="Previous image"
                                    >
                                        <ChevronLeft/>
                                    </button>
                                    <div className={styles.imageCounter}>
                                        {activeImageIndex + 1} / {project.project_images.length}
                                    </div>
                                    <button
                                        className={styles.navButton}
                                        onClick={() => {
                                            const nextIndex = activeImageIndex === project.project_images.length - 1
                                                ? 0
                                                : activeImageIndex + 1;

                                            // Apply smooth transition
                                            if (sliderRef.current) {
                                                sliderRef.current.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)';
                                                sliderRef.current.style.transform = `translateX(-${nextIndex * 100}%)`;

                                                // Update state after animation completes
                                                setTimeout(() => {
                                                    setActiveImageIndex(nextIndex);
                                                    setShowNavigationOnMobile(true);
                                                }, 500);
                                            }
                                        }}
                                        aria-label="Next image"
                                    >
                                        <ChevronRight/>
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        // Fallback to the original image if no images in the new table
                        project.img_url && (
                            <div className={styles.imageSlider} ref={sliderRef}>
                                <div className={styles.imageItem}>
                                    <div
                                        className={styles.imageBackground}
                                        style={{backgroundImage: `url(${project.img_url})`}}
                                    ></div>
                                    <div className={styles.imageContainer}>
                                        <img src={project.img_url} alt={project.title}/>
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </div>

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
