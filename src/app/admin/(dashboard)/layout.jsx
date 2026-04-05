import AdminSidebar from '@/components/AdminSidebar';
import styles from '@/styles/pages/AdminPage.module.css';

export const metadata = {
    title: '관리자 - joonseo1227',
    robots: {index: false, follow: false},
};

export default function AdminLayout({children}) {
    return (
        <div className={styles.adminLayout}>
            <AdminSidebar/>
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}
