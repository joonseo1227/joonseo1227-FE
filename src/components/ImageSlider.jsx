"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {ChevronLeft, ChevronRight} from "@carbon/icons-react";
import styles from "@/styles/pages/PortfolioProjectPage.module.css";

const SLIDE_DURATION = 320;
const NAV_HIDE_DELAY = 2000;
const DIRECTION_THRESHOLD = 18;
const DISTANCE_THRESHOLD = 0.22;
const VELOCITY_THRESHOLD = 0.45;

const createGestureState = () => ({
    active: false,
    mode: "idle", // idle | undetermined | horizontal | vertical
    startX: 0,
    startY: 0,
    deltaX: 0,
    startTime: 0
});

export default function ImageSlider({images, defaultImage}) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [navigationVisible, setNavigationVisible] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const sliderRef = useRef(null);
    const navTimeoutRef = useRef(null);
    const gestureRef = useRef(createGestureState());

    const imageCount = images?.length ?? 0;
    const hasImages = imageCount > 0;

    const clearNavTimeout = useCallback(() => {
        if (navTimeoutRef.current) {
            clearTimeout(navTimeoutRef.current);
            navTimeoutRef.current = null;
        }
    }, []);

    const revealNavigation = useCallback(() => {
        setNavigationVisible(true);
        clearNavTimeout();
        navTimeoutRef.current = window.setTimeout(() => {
            setNavigationVisible(false);
        }, NAV_HIDE_DELAY);
    }, [clearNavTimeout]);

    const alignToIndex = useCallback((index, animate = true) => {
        const slider = sliderRef.current;
        if (!slider) return;
        slider.style.transition = animate ? `transform ${SLIDE_DURATION}ms ease` : "none";
        slider.style.transform = `translateX(-${index * 100}%)`;
    }, []);

    const moveBy = useCallback((delta) => {
        if (imageCount <= 1) return;
        setIsTransitioning(true);
        setActiveIndex(prev => {
            const next = (prev + delta + imageCount) % imageCount;
            return next;
        });
        revealNavigation();
    }, [imageCount, revealNavigation]);

    useEffect(() => {
        if (!hasImages) {
            setActiveIndex(0);
            return;
        }

        setActiveIndex(prev => {
            if (prev < imageCount) return prev;
            return Math.max(0, imageCount - 1);
        });
    }, [hasImages, imageCount]);

    useEffect(() => {
        if (!hasImages) return;
        alignToIndex(activeIndex, true);

        const timeoutId = window.setTimeout(() => {
            setIsTransitioning(false);
        }, SLIDE_DURATION);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [activeIndex, hasImages, alignToIndex]);

    useEffect(() => () => {
        clearNavTimeout();
    }, [clearNavTimeout]);

    const resetGesture = () => {
        gestureRef.current = createGestureState();
    };

    const handlePointerDown = (e) => {
        if (imageCount <= 1 || isTransitioning) return;
        if (e.pointerType === "mouse" && e.button !== 0) return;

        const slider = sliderRef.current;
        if (!slider) return;

        slider.style.transition = "none";
        gestureRef.current = {
            active: true,
            mode: "undetermined",
            startX: e.clientX,
            startY: e.clientY,
            deltaX: 0,
            startTime: performance.now()
        };
    };

    const handlePointerMove = (e) => {
        const gesture = gestureRef.current;
        if (!gesture.active || imageCount <= 1) return;

        const slider = sliderRef.current;
        if (!slider) return;

        const deltaX = e.clientX - gesture.startX;
        const deltaY = e.clientY - gesture.startY;

        if (gesture.mode === "undetermined") {
            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);

            if (absY > absX && absY > DIRECTION_THRESHOLD) {
                gesture.mode = "vertical";
                slider.style.transition = `transform ${SLIDE_DURATION}ms ease`;
                slider.style.transform = `translateX(-${activeIndex * 100}%)`;
                return;
            }

            if (absX > DIRECTION_THRESHOLD) {
                gesture.mode = "horizontal";
            } else {
                return;
            }
        }

        if (gesture.mode !== "horizontal") {
            return;
        }

        gesture.deltaX = deltaX;
        const containerWidth = slider.offsetWidth || 1;
        let percentMove = (deltaX / containerWidth) * 100;

        const atFirst = activeIndex === 0 && deltaX > 0;
        const atLast = activeIndex === imageCount - 1 && deltaX < 0;
        if (atFirst || atLast) {
            percentMove = percentMove / 2;
        }

        const translateX = -activeIndex * 100 + percentMove;
        slider.style.transform = `translateX(${translateX}%)`;
    };

    const finishGesture = useCallback((cancelled = false) => {
        const gesture = gestureRef.current;
        if (!gesture.active || imageCount <= 1) {
            resetGesture();
            return;
        }

        const slider = sliderRef.current;
        if (slider) {
            slider.style.transition = `transform ${SLIDE_DURATION}ms ease`;
        }

        if (cancelled || gesture.mode !== "horizontal") {
            alignToIndex(activeIndex, true);
            resetGesture();
            return;
        }

        const duration = Math.max(performance.now() - gesture.startTime, 1);
        const sliderWidth = slider?.offsetWidth || 1;
        const distanceRatio = Math.abs(gesture.deltaX) / sliderWidth;
        const velocity = Math.abs(gesture.deltaX) / duration;

        if (distanceRatio > DISTANCE_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
            moveBy(gesture.deltaX < 0 ? 1 : -1);
        } else {
            alignToIndex(activeIndex, true);
        }

        resetGesture();
    }, [activeIndex, alignToIndex, imageCount, moveBy]);

    const handlePointerUp = () => finishGesture(false);
    const handlePointerCancel = () => finishGesture(true);

    const galleryHandlers = imageCount > 1 ? {
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerUp,
        onPointerCancel: handlePointerCancel,
        onPointerLeave: handlePointerCancel
    } : {};

    const galleryStyle = imageCount > 1 ? {touchAction: "pan-y pinch-zoom"} : undefined;

    return (
        <div
            className={styles.imageGallery}
            style={galleryStyle}
            {...galleryHandlers}
        >
            {hasImages ? (
                <>
                    <div className={styles.imageSlider} ref={sliderRef}>
                        {images.map((image) => (
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

                    {imageCount > 1 && (
                        <div
                            className={`${styles.imageNavigation} ${navigationVisible ? styles.showNavigation : ""}`}
                        >
                            <button
                                className={styles.navButton}
                                onClick={() => moveBy(-1)}
                                aria-label="Previous image"
                                disabled={isTransitioning}
                            >
                                <ChevronLeft size={24}/>
                            </button>

                            <div className={styles.imageCounter}>
                                {activeIndex + 1} / {imageCount}
                            </div>

                            <button
                                className={styles.navButton}
                                onClick={() => moveBy(1)}
                                aria-label="Next image"
                                disabled={isTransitioning}
                            >
                                <ChevronRight size={24}/>
                            </button>
                        </div>
                    )}
                </>
            ) : (
                defaultImage && (
                    <div className={styles.imageSlider}>
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