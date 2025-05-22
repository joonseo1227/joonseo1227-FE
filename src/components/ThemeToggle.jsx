"use client";

import headerStyles from '@/styles/components/Header.module.css';
import themeStyles from '@/styles/components/ThemeToggle.module.css';
import {useEffect, useState} from "react";
import {Asleep, Sun} from '@carbon/icons-react';

const ThemeToggle = () => {
    const [theme, setTheme] = useState("dark");
    const [isManuallySet, setIsManuallySet] = useState(false);

    // Initialize theme from localStorage or system preference
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        const isManualOverride = localStorage.getItem("isManualOverride") === "true";

        if (savedTheme && isManualOverride) {
            setTheme(savedTheme);
            setIsManuallySet(true);
        } else {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(systemPrefersDark ? "dark" : "light");
        }
    }, []);

    // Listen for system preference changes when not manually set
    useEffect(() => {
        if (!isManuallySet) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = (e) => setTheme(e.matches ? "dark" : "light");

            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [isManuallySet]);

    // Update document and localStorage when theme changes
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        if (isManuallySet) {
            localStorage.setItem('isManualOverride', 'true');
        }
    }, [theme, isManuallySet]);

    const toggleTheme = () => {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const systemTheme = systemPrefersDark ? "dark" : "light";
        const newTheme = theme === "dark" ? "light" : "dark";

        // If toggling to match system preference, reset to auto mode
        if (isManuallySet && newTheme === systemTheme) {
            setIsManuallySet(false);
            localStorage.removeItem('isManualOverride');
        } else {
            // Otherwise toggle theme and set as manually overridden
            setTheme(newTheme);
            setIsManuallySet(true);
        }
    };

    return (
        <div className={`${headerStyles.navButton} ${themeStyles.themeToggle}`} onClick={toggleTheme}>
            <div className={themeStyles.iconWrapper}>
                <Sun className={themeStyles.sunIcon} size="20"/>
                <Asleep className={themeStyles.moonIcon} size="20"/>
            </div>
        </div>
    );
};

export default ThemeToggle;
