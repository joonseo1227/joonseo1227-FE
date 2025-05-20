"use client";

import Link from "next/link";
import {useEffect, useRef, useState} from "react";
import ThemeToggle from "@/components/ThemeToggle";
import {CloseLarge, Menu} from '@carbon/icons-react';
import styles from '@/styles/components/Header.module.css';
import {usePathname} from "next/navigation";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();
    const isHomePage = pathname === '/';
    const navRef = useRef(null);
    const menuButtonRef = useRef(null);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // 메뉴 항목 클릭 시 메뉴를 닫는 함수
    const handleLinkClick = () => {
        setIsMenuOpen(false);
    };

    // Handle click outside to close menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMenuOpen &&
                navRef.current &&
                !navRef.current.contains(event.target) &&
                menuButtonRef.current &&
                !menuButtonRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        // Lock/unlock body scroll when menu is open/closed
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = ''; // Ensure scroll is enabled when component unmounts
        };
    }, [isMenuOpen]);

    return (
        <header
            className={`${styles.headerWrapper} ${isHomePage ? styles.headerHome : ''} ${isMenuOpen ? styles.menuOpened : ''}`}>
            <div className={styles.header}>
                <div className={styles.logoSection}>
                    <div ref={menuButtonRef} className={`${styles.navButton} ${styles.menuButton}`}
                         onClick={toggleMenu}>
                        {isMenuOpen ? <CloseLarge size={20}/> : <Menu size={20}/>}
                    </div>
                    <Link href='/' className={styles.link} onClick={handleLinkClick}>joonseo1227</Link>
                </div>
                <nav ref={navRef} className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
                    <Link href='/portfolio' className={styles.link} onClick={handleLinkClick}>Portfolio</Link>
                    <Link href='/blog' className={styles.link} onClick={handleLinkClick}>Blog</Link>
                    <Link href='/about' className={styles.link} onClick={handleLinkClick}>About</Link>
                    <Link href='/contact' className={styles.link} onClick={handleLinkClick}>Contact</Link>
                </nav>
                <div className={styles.themeToggleSection}>
                    <ThemeToggle/>
                </div>
            </div>
        </header>
    );
}
