"use client";

import styles from '@/styles/components/Header.module.css';
import {useEffect, useState} from "react";
import {Asleep, Sun} from '@carbon/icons-react';

const ThemeToggle = () => {
    const [theme, settheme] = useState("dark");
    const [isManuallySet, setIsManuallySet] = useState(false);

    useEffect(() => {
        // Check if theme is manually set in localStorage
        const savedTheme = localStorage.getItem("theme");
        const isManualOverride = localStorage.getItem("isManualOverride");

        if (savedTheme && isManualOverride === "true") {
            settheme(savedTheme);
            setIsManuallySet(true);
        } else {
            // Check system preference if no manual override
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            settheme(systemPrefersDark ? "dark" : "light");
        }
    }, []);

    // Set up listener for system preference changes
    useEffect(() => {
        if (!isManuallySet) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = (e) => {
                settheme(e.matches ? "dark" : "light");
            };

            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [isManuallySet]);

    const themetoggle = () => {
        // If already manually set and user clicks again on the current system preference,
        // reset to follow system preference
        if (isManuallySet) {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const systemTheme = systemPrefersDark ? "dark" : "light";
            const newTheme = theme === "dark" ? "light" : "dark";

            if (newTheme === systemTheme) {
                setIsManuallySet(false);
                localStorage.removeItem('isManualOverride');
                return;
            }
        }

        // Otherwise toggle theme and set as manually overridden
        settheme(theme === "dark" ? "light" : "dark");
        setIsManuallySet(true);
    };

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (isManuallySet) {
            localStorage.setItem('isManualOverride', 'true');
        }
    }, [theme, isManuallySet]);

    return (
        <div className={styles.navButton} onClick={themetoggle}>
            {theme === "dark" ? <Asleep size="20"/> : <Sun size="20"/>}
        </div>
    );
};

export default ThemeToggle;
