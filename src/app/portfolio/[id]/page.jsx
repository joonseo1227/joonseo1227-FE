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

    // Refs for the image slider
    const sliderRef = useRef(null);

    // Swipe state management
    const [swipeState, setSwipeState] = useState({
        isSwiping: false,
        startX: 0,
        currentX: 0,
        startTime: 0
    });

    // Animation state
    const [isAnimating, setIsAnimating] = useState(false);

    // Get the total number of images
    const imageCount = project?.project_images?.length || 0;

    // Function to go to a specific image index with animation
    const goToImage = (index) => {
        if (isAnimating || !sliderRef.current || imageCount <= 1) return;

        // Ensure the index is within bounds
        const targetIndex = (index + imageCount) % imageCount;

        // Set animating state to prevent multiple transitions
        setIsAnimating(true);

        // Apply the transition
        sliderRef.current.style.transition = 'transform 0.3s ease';
        sliderRef.current.style.transform = `translateX(-${targetIndex * 100}%)`;

        // Update the state after animation completes
        setTimeout(() => {
            setActiveImageIndex(targetIndex);
            setIsAnimating(false);
            setShowNavigationOnMobile(true);
        }, 300);
    };

    // Go to next image
    const goToNext = () => {
        goToImage(activeImageIndex + 1);
    };

    // Go to previous image
    const goToPrevious = () => {
        goToImage(activeImageIndex - 1);
    };

    // Handle touch start
    const handleTouchStart = (e) => {
        if (imageCount <= 1 || isAnimating) return;

        // Prevent default to avoid page scrolling
        e.preventDefault();

        // Capture the start position and time
        setSwipeState({
            isSwiping: true,
            startX: e.touches[0].clientX,
            currentX: e.touches[0].clientX,
            startTime: Date.now()
        });

        // Remove transition for immediate response
        if (sliderRef.current) {
            sliderRef.current.style.transition = 'none';
        }
    };

    // Handle touch move
    const handleTouchMove = (e) => {
        if (!swipeState.isSwiping || imageCount <= 1) return;

        // Prevent default to stop scrolling while swiping
        e.preventDefault();

        const currentX = e.touches[0].clientX;
        const deltaX = currentX - swipeState.startX;

        // Update the current position
        setSwipeState(prev => ({
            ...prev,
            currentX
        }));

        // Calculate the percentage to move based on container width
        const containerWidth = sliderRef.current?.offsetWidth || 1;
        let percentMove = (deltaX / containerWidth) * 100;

        // Add resistance at the edges
        if ((activeImageIndex === 0 && deltaX > 0) || 
            (activeImageIndex === imageCount - 1 && deltaX < 0)) {
            percentMove = percentMove / 3; // More resistance at the edges
        }

        // Apply the transform
        if (sliderRef.current) {
            const translateX = -activeImageIndex * 100 + percentMove;
            sliderRef.current.style.transform = `translateX(${translateX}%)`;
        }
    };

    // Handle touch end
    const handleTouchEnd = (e) => {
        if (!swipeState.isSwiping || imageCount <= 1) return;

        // Calculate swipe distance and duration
        const deltaX = swipeState.currentX - swipeState.startX;
        const swipeDuration = Date.now() - swipeState.startTime;

        // Restore the transition for smooth animation
        if (sliderRef.current) {
            sliderRef.current.style.transition = 'transform 0.3s ease';
        }

        // Determine if we should change the image
        const containerWidth = sliderRef.current?.offsetWidth || 1;
        const percentMoved = Math.abs(deltaX) / containerWidth;
        const velocity = Math.abs(deltaX) / swipeDuration;

        if (percentMoved > 0.2 || velocity > 0.5) {
            // Swipe was significant enough to change image
            if (deltaX < 0) {
                goToNext();
            } else {
                goToPrevious();
            }
        } else {
            // Swipe wasn't significant, snap back
            if (sliderRef.current) {
                sliderRef.current.style.transform = `translateX(-${activeImageIndex * 100}%)`;
            }
        }

        // Reset swipe state
        setSwipeState({
            isSwiping: false,
            startX: 0,
            currentX: 0,
            startTime: 0
        });
    };

    // Handle touch cancel - same as touch end
    const handleTouchCancel = handleTouchEnd;

    // Fetch project data
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

    // Initialize slider position when project data is loaded or active index changes
    useEffect(() => {
        if (project && sliderRef.current && imageCount > 0 && !swipeState.isSwiping && !isAnimating) {
            sliderRef.current.style.transition = 'none';
            sliderRef.current.style.transform = `translateX(-${activeImageIndex * 100}%)`;

            // Force a reflow to ensure the transition is removed before re-enabling
            sliderRef.current.offsetHeight;

            // Re-enable transitions
            sliderRef.current.style.transition = 'transform 0.3s ease';
        }
    }, [project, activeImageIndex, imageCount, swipeState.isSwiping, isAnimating]);

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
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchCancel}
                >
                    {project.project_images && project.project_images.length > 0 ? (
                        <>
                            <div
                                className={styles.imageSlider}
                                ref={sliderRef}
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
                                        onClick={goToPrevious}
                                        aria-label="Previous image"
                                    >
                                        <ChevronLeft/>
                                    </button>
                                    <div className={styles.imageCounter}>
                                        {activeImageIndex + 1} / {project.project_images.length}
                                    </div>
                                    <button
                                        className={styles.navButton}
                                        onClick={goToNext}
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
