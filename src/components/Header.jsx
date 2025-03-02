"use client";

import Link from "next/link";
import {useState} from "react";
import ThemeToggle from "@/components/ThemeToggle";
import {CloseLarge, Menu} from '@carbon/icons-react';
import styles from '@/styles/components/Header.module.css';
import {usePathname} from "next/navigation";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();
    const isHomePage = pathname === '/';

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // 메뉴 항목 클릭 시 메뉴를 닫는 함수
    const handleLinkClick = () => {
        setIsMenuOpen(false);
    };

    return (
        <header className={`${styles.header} ${isHomePage ? styles.headerHome : ''}`}>
            <div className={`${styles.navButton} ${styles.menuButton}`} onClick={toggleMenu}>
                {isMenuOpen ? <CloseLarge size={24}/> : <Menu size={24}/>}
            </div>
            <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
                <Link href='/' className={styles.link} onClick={handleLinkClick}>joonseo1227</Link>
                <Link href='/portfolio' className={styles.link} onClick={handleLinkClick}>Portfolio</Link>
                <Link href='/blog' className={styles.link} onClick={handleLinkClick}>Blog</Link>
                <Link href='/about' className={styles.link} onClick={handleLinkClick}>About</Link>
                <Link href='/contact' className={styles.link} onClick={handleLinkClick}>Contact</Link>
            </nav>
            <ThemeToggle/>
        </header>
    );
}