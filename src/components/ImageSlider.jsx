"use client";

import {useEffect, useRef, useState} from "react";
import {ChevronLeft, ChevronRight} from "@carbon/icons-react";
import styles from "@/styles/pages/PortfolioProjectPage.module.css";

export default function ImageSlider({images, defaultImage}) {
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
    const imageCount = images?.length || 0;

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

    // Initialize slider position when project data is loaded or active index changes
    useEffect(() => {
        if (sliderRef.current && imageCount > 0 && !swipeState.isSwiping && !isAnimating) {
            sliderRef.current.style.transition = 'none';
            sliderRef.current.style.transform = `translateX(-${activeImageIndex * 100}%)`;

            // Force a reflow to ensure the transition is removed before re-enabling
            sliderRef.current.offsetHeight;

            // Re-enable transitions
            sliderRef.current.style.transition = 'transform 0.3s ease';
        }
    }, [activeImageIndex, imageCount, swipeState.isSwiping, isAnimating]);

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

    return (
        <div
            className={styles.imageGallery}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchCancel}
        >
            {images && images.length > 0 ? (
                <>
                    <div
                        className={styles.imageSlider}
                        ref={sliderRef}
                    >
                        {images.map((image, index) => (
                            <div
                                key={image.id}
                                className={styles.imageItem}
                            >
                                <div
                                    className={styles.imageBackground}
                                    style={{backgroundImage: `url(${image.img_url})`}}
                                ></div>
                                <div className={styles.imageContainer}>
                                    <img src={image.img_url} alt={image.caption || "Project image"}/>
                                </div>
                                {image.caption && <p className={styles.imageCaption}>{image.caption}</p>}
                            </div>
                        ))}
                    </div>

                    {/* Navigation buttons - only show if there are multiple images */}
                    {images.length > 1 && (
                        <div
                            className={`${styles.imageNavigation} ${showNavigationOnMobile ? styles.showNavigation : ''}`}>

                            <button
                                className={styles.navButton}
                                onClick={goToPrevious}
                                aria-label="Previous image"
                            >
                                <ChevronLeft size={24}/>
                            </button>

                            <div className={styles.imageCounter}>
                                {activeImageIndex + 1} / {images.length}
                            </div>

                            <button
                                className={styles.navButton}
                                onClick={goToNext}
                                aria-label="Next image"
                            >
                                <ChevronRight size={24}/>
                            </button>

                        </div>
                    )}
                </>
            ) : (
                // Fallback to the original image if no images in the new table
                defaultImage && (
                    <div className={styles.imageSlider} ref={sliderRef}>
                        <div className={styles.imageItem}>
                            <div
                                className={styles.imageBackground}
                                style={{backgroundImage: `url(${defaultImage})`}}
                            ></div>
                            <div className={styles.imageContainer}>
                                <img src={defaultImage} alt="Project image"/>
                            </div>
                        </div>
                    </div>
                )
            )}
        </div>
    );
}