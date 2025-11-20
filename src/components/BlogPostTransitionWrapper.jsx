"use client";

import {useEffect, useState} from 'react';
import styles from '@/styles/components/BlogPostTransitionWrapper.module.css';

const BLOG_CONTENT_FADE_DELAY = 0;

export default function BlogPostTransitionWrapper({children, className = ''}) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') {
            setIsVisible(true);
            return () => {
            };
        }

        let fadeTimeout = null;
        let rafId = null;

        if (window.endBlogTransition) {
            window.endBlogTransition();
        }

        rafId = window.requestAnimationFrame(() => {
            fadeTimeout = window.setTimeout(() => {
                setIsVisible(true);
            }, BLOG_CONTENT_FADE_DELAY);
        });

        return () => {
            if (fadeTimeout) {
                window.clearTimeout(fadeTimeout);
            }
            if (rafId) {
                window.cancelAnimationFrame(rafId);
            }
        };
    }, []);

    const containerClassName = [
        styles.fadeContainer,
        isVisible ? styles.fadeContainerVisible : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={containerClassName}>
            {children}
        </div>
    );
}