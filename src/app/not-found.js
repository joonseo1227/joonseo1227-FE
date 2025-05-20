import styles from '@/styles/pages/NotFound.module.css';

export default function NotFound() {
    return (
        <div className={styles.notFoundContainer}>
            <h1 className={styles.title}>
                404
            </h1>
            <h2 className={styles.subtitle}>
                페이지를 찾을 수 없습니다
            </h2>
            <p className={styles.message}>
                찾으시는 페이지가 삭제되었거나 이동되었을 수 있습니다.
                <br/>
                입력하신 주소가 정확한지 다시 한번 확인해 주세요.
            </p>
        </div>
    );
}
