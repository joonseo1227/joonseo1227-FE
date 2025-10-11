'use client';
import styles from '@/styles/pages/ContactPage.module.css';

export default function ContactPage() {
    const email = "joonseo1227@gmail.com";

    return (
        <div className={styles.contactPage}>
            <h1 className="titleText">Contact</h1>
            <div className={styles.emailContainer}>
                <h2>{email}</h2>
            </div>
        </div>
    );
}
