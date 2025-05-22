"use client";

import {useEffect} from 'react';

export default function BlogPostTransitionWrapper({children}) {
    useEffect(() => {
        // Call endProjectTransition when the component mounts
        if (window.endProjectTransition) {
            window.endProjectTransition();
        }
    }, []);

    return <>{children}</>;
}