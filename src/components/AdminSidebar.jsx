'use client';

import {useEffect, useState} from 'react';
import {usePathname, useRouter} from 'next/navigation';
import Link from 'next/link';
import {AnimatePresence, motion} from 'framer-motion';
import {CloseLarge, Menu} from '@carbon/icons-react';
import styles from '@/styles/pages/AdminPage.module.css';

const iconVariants = {
    menu: {
        rotate: 0,
        transition: {duration: 0.3, ease: [0.22, 1, 0.36, 1]}
    },
    close: {
        rotate: 90,
        transition: {duration: 0.3, ease: [0.22, 1, 0.36, 1]}
    }
};

const navItems = [
    {href: '/admin', label: '대시보드'},
    {href: '/admin/posts', label: '포스트'},
    {href: '/admin/projects', label: '프로젝트'},
    {href: '/admin/comments', label: '댓글'},
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [drawerOpen, setDrawerOpen] = useState(false);

    const isActive = (href) => {
        if (href === '/admin') return pathname === '/admin';
        return pathname.startsWith(href);
    };

    const handleLogout = async () => {
        await fetch('/api/admin/logout', {method: 'POST'});
        router.push('/admin/login');
    };

    const closeDrawer = () => setDrawerOpen(false);

    useEffect(() => {
        document.body.style.overflow = drawerOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [drawerOpen]);

    return (
        <>
            {/* Desktop sidebar */}
            <aside className={styles.sidebar}>
                <Link href="/admin" className={styles.sidebarHeader}>
                    <div className={styles.sidebarLogo}>joonseo1227</div>
                    <div className={styles.sidebarSubtitle}>관리자 패널</div>
                </Link>
                <nav className={styles.nav}>
                    {navItems.map(({href, label}) => (
                        <Link
                            key={href}
                            href={href}
                            className={`${styles.navLink} ${isActive(href) ? styles.navLinkActive : ''}`}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>
                <div className={styles.sidebarFooter}>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        로그아웃
                    </button>
                </div>
            </aside>

            {/* Mobile top bar */}
            <header className={styles.mobileHeader}>
                <motion.div
                    className={styles.hamburgerBtn}
                    onClick={() => setDrawerOpen(!drawerOpen)}
                    animate={drawerOpen ? 'close' : 'menu'}
                    variants={iconVariants}
                    aria-label={drawerOpen ? '메뉴 닫기' : '메뉴 열기'}
                >
                    {drawerOpen ? <CloseLarge size={20}/> : <Menu size={20}/>}
                </motion.div>
                <Link href="/admin" className={styles.mobileHeaderTitle}>관리자 패널</Link>
            </header>

            <AnimatePresence>
                {drawerOpen && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            className={styles.drawerOverlay}
                            onClick={closeDrawer}
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            transition={{duration: 0.25, ease: [0.22, 1, 0.36, 1]}}
                        />

                        {/* Drawer */}
                        <motion.aside
                            className={styles.drawer}
                            initial={{x: '-100%'}}
                            animate={{x: 0}}
                            exit={{x: '-100%'}}
                            transition={{duration: 0.3, ease: [0.22, 1, 0.36, 1]}}
                        >
                            <nav className={styles.drawerNav}>
                                {navItems.map(({href, label}) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={`${styles.drawerNavLink} ${isActive(href) ? styles.drawerNavLinkActive : ''}`}
                                        onClick={closeDrawer}
                                    >
                                        {label}
                                    </Link>
                                ))}
                            </nav>

                            <div className={styles.drawerFooter}>
                                <button onClick={handleLogout} className={styles.logoutBtn}>
                                    로그아웃
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
