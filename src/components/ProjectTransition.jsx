"use client";

import {useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import styles from '@/styles/components/ProjectTransition.module.css';

export default function ProjectTransition({children}) {
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [transitionData, setTransitionData] = useState(null);
    const router = useRouter();
    const overlayRef = useRef(null);

    // Function to trigger the transition
    const startTransition = (itemId, imageUrl, sourceRect, route = 'portfolio') => {
        setTransitionData({
            itemId,
            imageUrl,
            sourceRect
        });
        setIsTransitioning(true);

        // After animation completes, navigate to the project or blog page
        setTimeout(() => {
            router.push(`/${route}/${itemId}`);
            // We don't reset isTransitioning here anymore
            // The page component will call endTransition when it has loaded
        }, 700); // Match this with the CSS animation duration
    };

    // Function to end the transition (to be called by the page component)
    const endTransition = () => {
        setIsTransitioning(false);
    };

    // Expose the startTransition and endTransition functions to be called from other components
    useEffect(() => {
        window.startProjectTransition = startTransition;
        window.endProjectTransition = endTransition;

        return () => {
            delete window.startProjectTransition;
            delete window.endProjectTransition;
        };
    }, []);

    return (
        <>
            {children}

            {isTransitioning && transitionData && (
                <div
                    ref={overlayRef}
                    className={styles.transitionOverlay}
                    style={{
                        '--image-url': `url(${transitionData.imageUrl})`,
                        '--start-top': `${transitionData.sourceRect.top}px`,
                        '--start-left': `${transitionData.sourceRect.left}px`,
                        '--start-width': `${transitionData.sourceRect.width}px`,
                        '--start-height': `${transitionData.sourceRect.height}px`,
                    }}
                />
            )}
        </>
    );
}
