import {AnimatePresence, motion} from 'framer-motion';
import styles from '@/styles/components/SkeletonLoader.module.css';

export default function SkeletonLoader({isLoading, page, children}) {
    const renderSkeleton = () => {
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
    };

    return (
        <div className={styles.container}>
            <AnimatePresence mode="popLayout">
                {isLoading && (
                    <motion.div
                        key="skeleton"
                        className={styles.layer}
                        initial={{opacity: 1}}
                        exit={{opacity: 0}}
                        transition={{duration: 0.5, ease: "easeInOut"}}
                    >
                        {renderSkeleton()}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                className={styles.layer}
                initial={{opacity: 0}}
                animate={{opacity: isLoading ? 0 : 1}}
                transition={{duration: 0.5, ease: "easeInOut"}}
            >
                {children}
            </motion.div>
        </div>
    );
}
