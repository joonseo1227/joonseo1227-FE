import Link from 'next/link';
import styles from '@/styles/pages/NotFound.module.css';

export default function NotFound() {
    return (
        <div className={styles.notFoundContainer}>
            <h1 className={styles.title}>404 - 페이지를 찾을 수 없습니다</h1>
            <p className={styles.message}>
                찾으시는 페이지가 삭제되었거나 이동되었을 수 있습니다.
            </p>
            <div className={styles.suggestions}>
                <p>다른 콘텐츠를 확인해보세요:</p>
                <ul>
                    <li>
                        <Link href="/" className={styles.link}>
                            홈페이지
                        </Link>
                    </li>
                    <li>
                        <Link href="/blog" className={styles.link}>
                            블로그
                        </Link>
                    </li>
                    <li>
                        <Link href="/portfolio" className={styles.link}>
                            포트폴리오
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
}