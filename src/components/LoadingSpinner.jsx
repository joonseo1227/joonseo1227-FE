import React from 'react';
import styles from '@/styles/components/LoadingSpinner.module.css';

const LoadingSpinner = () => {
    return (
        <div className={styles.spinnerContainer}>
            <div className={styles.spinner}>
                <div className={styles.dot1}></div>
                <div className={styles.dot2}></div>
                <div className={styles.dot3}></div>
            </div>
            <p className={styles.loadingText}>로딩 중...</p>
        </div>
    );
};

export default LoadingSpinner;