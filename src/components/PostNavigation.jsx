import Link from 'next/link';
import styles from '@/styles/components/PostNavigation.module.css';

export default function PostNavigation({prevPost, nextPost}) {
    return (
        <div className={styles.postNavigation}>
            <div className={styles.navContainer}>
                {prevPost && (
                    <Link href={`/blog/${prevPost.id}`} className={`${styles.navLink} ${styles.prevPost}`}>
                        <div className={styles.navContent}>
                            <span className={styles.navLabel}>이전 글</span>
                            <h3 className={styles.navTitle}>{prevPost.title}</h3>
                        </div>
                        {prevPost.thumbnail_url && (
                            <div
                                className={styles.navThumbnail}
                                style={{backgroundImage: `url(${prevPost.thumbnail_url})`}}
                            />
                        )}
                    </Link>
                )}

                {nextPost && (
                    <Link href={`/blog/${nextPost.id}`} className={`${styles.navLink} ${styles.nextPost}`}>
                        {nextPost.thumbnail_url && (
                            <div
                                className={styles.navThumbnail}
                                style={{backgroundImage: `url(${nextPost.thumbnail_url})`}}
                            />
                        )}
                        <div className={styles.navContent}>
                            <span className={styles.navLabel}>다음 글</span>
                            <h3 className={styles.navTitle}>{nextPost.title}</h3>
                        </div>
                    </Link>
                )}
            </div>
        </div>
    );
}