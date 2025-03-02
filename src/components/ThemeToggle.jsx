"use client";

import styles from '@/styles/components/Header.module.css';
import {useEffect, useState} from "react";
import {Asleep, Sun} from '@carbon/icons-react';

const ThemeToggle = () => {
    const [theme, settheme] = useState("dark");

    useEffect(() => {
        // 컴포넌트가 마운트된 후에 localStorage 접근
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            settheme(savedTheme);
        }
    }, []);

    const themetoggle = () => {
        settheme(theme === "dark" ? "light" : "dark");
    };

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        <div className={styles.navButton} onClick={themetoggle}>
            {theme === "dark" ? <Asleep size="24"/> : <Sun size="24"/>}
        </div>
    );
};

export default ThemeToggle;