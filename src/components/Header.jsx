"use client";

import Link from "next/link";
import {useEffect, useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import {CloseLarge, Menu} from '@carbon/icons-react';
import styles from '@/styles/components/Header.module.css';

// Animation variants
const overlayVariants = {
    hidden: {
        opacity: 0,
        transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1]
        }
    },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1]
        }
    }
};

const menuContainerVariants = {
    hidden: {
        transition: {
            staggerChildren: 0,  // 동시에 닫힘
            when: "afterChildren"
        }
    },
    visible: {
        transition: {
            staggerChildren: 0.04,  // 빠르게 연속적으로 열림
            delayChildren: 0.1,
            when: "beforeChildren"
        }
    }
};

const menuItemVariants = {
    hidden: {
        opacity: 0,
        y: 20,
        scale: 0.5,
        transition: {
            duration: 0.25,
            ease: [0.22, 1, 0.36, 1]
        }
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 25,
            mass: 0.8
        }
    }
};

const iconVariants = {
    menu: {
        rotate: 0,
        transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1]
        }
    },
    close: {
        rotate: 90,
        transition: {
            duration: 0.3,
            ease: [0.22, 1, 0.36, 1]
        }
    }
};

// Navigation links
const NAV_LINKS = [
    {href: '/portfolio', label: 'Portfolio'},
    {href: '/blog', label: 'Blog'},
    {href: '/about', label: 'About'},
    {href: '/contact', label: 'Contact'}
];

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLinkClick = () => {
        setIsMenuOpen(false);
    };

    // Scroll lock when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isMenuOpen]);

    return (
        <>
            <header className={styles.headerWrapper}>
                <div className={styles.header}>
                    <div className={styles.logoSection}>
                        <motion.div
                            className={`${styles.navButton} ${styles.menuButton}`}
                            onClick={toggleMenu}
                            animate={isMenuOpen ? "close" : "menu"}
                            variants={iconVariants}
                        >
                            {isMenuOpen ? <CloseLarge size={20}/> : <Menu size={20}/>}
                        </motion.div>
                        <Link href='/' className={styles.link} onClick={handleLinkClick}>joonseo1227</Link>
                        <div className={styles.mobileThemeToggle}>
                            <ThemeToggle/>
                        </div>
                    </div>
                    {/* PC Navigation */}
                    <nav className={styles.nav}>
                        {NAV_LINKS.map(({href, label}) => (
                            <Link key={href} href={href} className={styles.link}>
                                {label}
                            </Link>
                        ))}
                    </nav>
                    <div className={styles.themeToggleSection}>
                        <ThemeToggle/>
                    </div>
                </div>
            </header>

            {/* Mobile Full-Screen Overlay Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        className={styles.overlay}
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                    >
                        <motion.nav
                            className={styles.mobileMenu}
                            variants={menuContainerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                        >
                            {NAV_LINKS.map(({href, label}) => (
                                <motion.div
                                    key={href}
                                    variants={menuItemVariants}
                                >
                                    <motion.div
                                        whileTap={{
                                            scale: 0.95,
                                            transition: {duration: 0.2, ease: [0.22, 1, 0.36, 1]}
                                        }}
                                    >
                                        <Link href={href} className={styles.mobileLink} onClick={handleLinkClick}>
                                            {label}
                                        </Link>
                                    </motion.div>
                                </motion.div>
                            ))}
                        </motion.nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
