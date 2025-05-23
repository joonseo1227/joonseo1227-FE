import React from 'react';
import styles from '@/styles/components/SkeletonLoader.module.css';

// Generic skeleton box component
const SkeletonBox = ({className}) => {
    return <div className={`${styles.skeletonBox} ${className || ''}`}></div>;
};

// Blog list page skeleton
export const BlogListSkeleton = () => {
    return (
        <div className={styles.skeletonContainer}>
            {/* Category buttons skeleton */}
            <div className={styles.categoryContainer}>
                {[...Array(3)].map((_, i) => (
                    <SkeletonBox key={i} className={styles.categoryButton}/>
                ))}
            </div>

            {/* Blog post tiles skeleton */}
            <div className={styles.gridContainer}>
                {[...Array(6)].map((_, i) => (
                    <div key={i} className={styles.tileContainer}>
                        <SkeletonBox className={styles.thumbnail}/>
                        <div className={styles.contentContainer}>
                            <SkeletonBox className={styles.title}/>
                            <SkeletonBox className={styles.summary}/>
                            <SkeletonBox className={styles.date}/>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Blog detail page skeleton
export const BlogDetailSkeleton = () => {
    return (
        <div className={styles.skeletonContainer}>
            {/* Header skeleton */}
            <div className={styles.headerContainer}>
                <SkeletonBox className={styles.detailTitle}/>
                <SkeletonBox className={styles.detailDate}/>
            </div>

            {/* Content skeleton */}
            <div className={styles.detailContentContainer}>
                <SkeletonBox className={styles.paragraph}/>
                <SkeletonBox className={styles.paragraph}/>
                <SkeletonBox className={styles.paragraph}/>
                <SkeletonBox className={styles.paragraph}/>
                <SkeletonBox className={styles.paragraph}/>
            </div>
        </div>
    );
};

// Portfolio list page skeleton
export const PortfolioListSkeleton = () => {
    return (
        <div className={styles.skeletonContainer}>
            {/* Portfolio project tiles skeleton */}
            <div className={styles.gridContainer}>
                {[...Array(6)].map((_, i) => (
                    <div key={i} className={styles.tileContainer}>
                        <SkeletonBox className={styles.thumbnail}/>
                        <div className={styles.contentContainer}>
                            <SkeletonBox className={styles.title}/>
                            <SkeletonBox className={styles.summary}/>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Portfolio detail page skeleton
export const PortfolioDetailSkeleton = () => {
    return (
        <div className={styles.skeletonContainer}>
            {/* Project header with title skeleton */}
            <div className={styles.projectHeader}>
                <SkeletonBox className={styles.detailTitle}/>
            </div>

            {/* Project info skeleton */}
            <div className={styles.projectInfoContainer}>
                {/* Image gallery skeleton */}
                <div className={styles.imageGallerySkeleton}>
                    <SkeletonBox className={styles.projectImage}/>
                    {/* Image navigation skeleton */}
                    <div className={styles.imageNavigationSkeleton}>
                        <SkeletonBox className={styles.navButtonSkeleton}/>
                        <SkeletonBox className={styles.imageCounterSkeleton}/>
                        <SkeletonBox className={styles.navButtonSkeleton}/>
                    </div>
                </div>

                {/* Project details skeleton */}
                <div className={styles.projectDetailsSkeleton}>
                    <SkeletonBox className={styles.projectJob}/>
                    <SkeletonBox className={styles.projectPeriod}/>

                    {/* Tech stack container skeleton */}
                    <div className={styles.techStackContainerSkeleton}>
                        <SkeletonBox className={styles.techTagSkeleton}/>
                        <SkeletonBox className={styles.techTagSkeleton}/>
                        <SkeletonBox className={styles.techTagSkeleton}/>
                    </div>
                </div>
            </div>

            {/* Description skeleton */}
            <SkeletonBox className={styles.paragraph}/>
            <SkeletonBox className={styles.paragraph}/>

            {/* GitHub link skeleton */}
            <div className={styles.buttonContainerSkeleton}>
                <SkeletonBox className={styles.githubLink}/>
            </div>
        </div>
    );
};

// Export a function that returns the appropriate skeleton based on the page
const SkeletonLoader = ({page}) => {
    switch (page) {
        case 'blogList':
            return <BlogListSkeleton/>;
        case 'blogDetail':
            return <BlogDetailSkeleton/>;
        case 'portfolioList':
            return <PortfolioListSkeleton/>;
        case 'portfolioDetail':
            return <PortfolioDetailSkeleton/>;
        default:
            return <BlogListSkeleton/>;
    }
};

export default SkeletonLoader;
