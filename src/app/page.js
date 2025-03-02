import Link from "next/link";
import styles from '@/styles/pages/HomePage.module.css';

export default function HomePage() {
    return (
        <div className={styles.homePage}>
            <div className={styles.leftSection}>
                <div className={styles.content}>
                    <h1 className={styles.title}>
                        안녕하세요. 프론트엔드 개발자 정준서입니다.
                    </h1>
                    <p>작은 디테일로 큰 가치를 만드는 프론트엔드 개발자입니다. UI/UX를 기반으로 사용자 중심의 경험을 창조합니다.</p>
                    <div className={styles.buttons}>
                        <Link href="/portfolio" className={styles.button}>
                            My Portfolio
                        </Link>
                    </div>
                </div>
            </div>
            <div className={styles.rightSection}>
                <img
                    src="https://avtqiifssheaiyrcujbi.supabase.co/storage/v1/object/sign/images/Main.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJpbWFnZXMvTWFpbi5qcGciLCJpYXQiOjE3NDA5NzAxMzUsImV4cCI6MzMyNDU0MzQxMzV9.WRJobhX_ndtM7JtbgTEvn1rKkIhtTb69iuVJFTiMpco"
                    alt="Description" className={styles.mainImage}
                />
            </div>
        </div>
    );
}