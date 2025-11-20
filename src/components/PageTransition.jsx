"use client";

import {useEffect, useRef, useState} from 'react';
import {usePathname, useRouter} from 'next/navigation';
import styles from '@/styles/components/ProjectTransition.module.css';

const TRANSITION_DURATION = 500;
const CONTENT_FADE_LEAD = 0;

const calculateEndRect = () => {
    const headerHeight = 52;
    let endWidth;
    let endLeft;

    if (window.innerWidth <= 768) {
        endWidth = window.innerWidth;
        endLeft = 0;
    } else {
        const maxContainerWidth = 800;
        const padding = 64;
        const containerWidth = Math.min(window.innerWidth, maxContainerWidth);
        endWidth = containerWidth - padding;
        endLeft = (window.innerWidth - endWidth) / 2;
    }

    return {
        width: endWidth,
        height: endWidth * (9 / 16),
        top: headerHeight,
        left: endLeft,
    };
};

export default function PageTransition({children}) {
    const router = useRouter();
    const pathname = usePathname();
    const [portfolioTransition, setPortfolioTransition] = useState(null);
    const [blogTransition, setBlogTransition] = useState(null);
    const [isContentFading, setIsContentFading] = useState(false);
    const [disableFadeTransition, setDisableFadeTransition] = useState(false);
    const timeoutIdsRef = useRef([]);
    const hiddenElementsRef = useRef(new Map());

    const scheduleTimeout = (callback, delay) => {
        const id = window.setTimeout(() => {
            callback();
            timeoutIdsRef.current = timeoutIdsRef.current.filter((storedId) => storedId !== id);
        }, delay);
        timeoutIdsRef.current.push(id);
        return id;
    };

    useEffect(() => {
        return () => {
            timeoutIdsRef.current.forEach((id) => clearTimeout(id));
            restoreHiddenElements();
        };
    }, []);

    const hideSourceElement = (element) => {
        if (!element) return;
        if (!hiddenElementsRef.current.has(element)) {
            hiddenElementsRef.current.set(element, {
                opacity: element.style.opacity,
                transition: element.style.transition,
            });
        }
        element.style.transition = 'opacity 0.1s ease';
        element.style.opacity = '0';
    };

    const restoreHiddenElements = () => {
        hiddenElementsRef.current.forEach((styleCache, element) => {
            if (!element) return;
            element.style.opacity = styleCache.opacity;
            element.style.transition = styleCache.transition;
        });
        hiddenElementsRef.current.clear();
    };

    useEffect(() => {
        setDisableFadeTransition(true);
        setIsContentFading(false);
        setPortfolioTransition(null);
        setBlogTransition(null);
        restoreHiddenElements();

        const id = requestAnimationFrame(() => {
            setDisableFadeTransition(false);
        });

        return () => cancelAnimationFrame(id);
    }, [pathname]);

    const startPortfolioTransition = (itemId, imageUrl, sourceRect, options = {}) => {
        const {sourceElement} = options;
        setPortfolioTransition(null);
        setIsContentFading(true);

        scheduleTimeout(() => {
            setPortfolioTransition({
                itemId,
                imageUrl,
                sourceRect,
                endRect: calculateEndRect(),
            });

            requestAnimationFrame(() => {
                hideSourceElement(sourceElement);
            });

            scheduleTimeout(() => {
                router.push(`/portfolio/${itemId}`);
            }, TRANSITION_DURATION);
        }, CONTENT_FADE_LEAD);
    };

    const startBlogTransition = (itemId, imageUrl, sourceRect, options = {}) => {
        const {sourceElement} = options;
        setBlogTransition(null);
        setIsContentFading(true);

        scheduleTimeout(() => {
            setBlogTransition({
                itemId,
                imageUrl,
                sourceRect,
                endRect: calculateEndRect(),
            });

            requestAnimationFrame(() => {
                hideSourceElement(sourceElement);
            });

            scheduleTimeout(() => {
                router.push(`/blog/${itemId}`);
            }, TRANSITION_DURATION);
        }, CONTENT_FADE_LEAD);
    };

    const endPortfolioTransition = () => {
        setPortfolioTransition(null);
        setIsContentFading(false);
        restoreHiddenElements();
    };

    const endBlogTransition = () => {
        setBlogTransition(null);
        setIsContentFading(false);
        restoreHiddenElements();
    };

    useEffect(() => {
        window.startPortfolioTransition = startPortfolioTransition;
        window.endPortfolioTransition = endPortfolioTransition;
        window.startBlogTransition = startBlogTransition;
        window.endBlogTransition = endBlogTransition;

        return () => {
            delete window.startPortfolioTransition;
            delete window.endPortfolioTransition;
            delete window.startBlogTransition;
            delete window.endBlogTransition;
        };
    }, []);

    return (
        <>
            <div
                className={`${styles.transitionContent} ${disableFadeTransition ? styles.noTransition : ''} ${isContentFading ? styles.fadeOut : ''}`}
            >
                {children}
            </div>

            {portfolioTransition && (
                <div
                    className={`${styles.transitionOverlay} ${styles.portfolioOverlay}`}
                    style={{
                        '--image-url': `url(${portfolioTransition.imageUrl})`,
                        '--start-top': `${portfolioTransition.sourceRect.top}px`,
                        '--start-left': `${portfolioTransition.sourceRect.left}px`,
                        '--start-width': `${portfolioTransition.sourceRect.width}px`,
                        '--start-height': `${portfolioTransition.sourceRect.height}px`,
                        '--end-top': `${portfolioTransition.endRect.top}px`,
                        '--end-left': `${portfolioTransition.endRect.left}px`,
                        '--end-width': `${portfolioTransition.endRect.width}px`,
                        '--end-height': `${portfolioTransition.endRect.height}px`,
                    }}
                />
            )}

            {blogTransition && (
                <div
                    className={`${styles.transitionOverlay} ${styles.blogOverlay}`}
                    style={{
                        '--image-url': `url(${blogTransition.imageUrl})`,
                        '--start-top': `${blogTransition.sourceRect.top}px`,
                        '--start-left': `${blogTransition.sourceRect.left}px`,
                        '--start-width': `${blogTransition.sourceRect.width}px`,
                        '--start-height': `${blogTransition.sourceRect.height}px`,
                        '--end-top': `${blogTransition.endRect.top}px`,
                        '--end-left': `${blogTransition.endRect.left}px`,
                        '--end-width': `${blogTransition.endRect.width}px`,
                        '--end-height': `${blogTransition.endRect.height}px`,
                    }}
                />
            )}
        </>
    );
}
