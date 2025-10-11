import styles from '@/styles/components/SkeletonLoader.module.css';

export default function SkeletonLoader({page}) {
    if (page === 'blogPage') {
        return (
            <>
                <div className={styles.categoryFilter}>
                    {[...Array(5)].map((_, index) => (
                        <div key={index} className={`${styles.categoryBtn} ${styles.skeleton}`}></div>
                    ))}
                </div>
                <div className={styles.postList}>
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className={styles.postTile}>
                            <div className={styles.postThumbnail}></div>
                            <div className={styles.tileDescription}>
                                <div className={styles.tileHead}>
                                    <div className={`${styles.postTitle} ${styles.skeleton}`}></div>
                                    <div className={`${styles.postSummary} ${styles.skeleton}`}></div>
                                </div>
                                <div className={`${styles.postDate} ${styles.skeleton}`}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        );
    }

    if (page === 'portfolioPage') {
        return (
            <div className={styles.projectList}>
                {[...Array(6)].map((_, index) => (
                    <div key={index} className={styles.projectTile}>
                        <div className={styles.projectThumbnail}></div>
                        <div className={`${styles.projectTitle} ${styles.skeleton}`}></div>
                    </div>
                ))}
            </div>
        );
    }

    return null;
}
