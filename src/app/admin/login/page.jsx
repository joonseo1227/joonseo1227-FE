'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import styles from '@/styles/pages/AdminPage.module.css';

export default function AdminLoginPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({password}),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || '로그인에 실패했습니다.');
                return;
            }

            router.push('/admin');
            router.refresh();
        } catch {
            setError('서버 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginPage}>
            <div className={styles.loginCard}>
                <h1 className={styles.loginTitle}>관리자 로그인</h1>
                <p className={styles.loginSubtitle}>joonseo1227 관리자 패널</p>

                <form onSubmit={handleSubmit} className={styles.loginForm}>
                    {error && (
                        <div className={`${styles.alert} ${styles.alertError}`}>
                            {error}
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="password">
                            비밀번호
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            placeholder="관리자 비밀번호 입력"
                            autoFocus
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        disabled={loading}
                        style={{width: '100%', justifyContent: 'center', padding: '11px'}}
                    >
                        {loading ? '로그인 중...' : '로그인'}
                    </button>
                </form>
            </div>
        </div>
    );
}
