"use client";

import Link from "next/link";
import {FaGithub, FaInstagram, FaLinkedin, FaYoutube} from "react-icons/fa";
import styles from "@/styles/components/Footer.module.css";

const SOCIAL_LINKS = [
    {
        id: 'github',
        url: "https://github.com/joonseo1227",
        Icon: FaGithub,
        label: "GitHub"
    },
    {
        id: 'instagram',
        url: "https://www.instagram.com/joonseo1227/",
        Icon: FaInstagram,
        label: "Instagram"
    },
    {
        id: 'linkedin',
        url: "https://www.linkedin.com/in/joonseo1227/",
        Icon: FaLinkedin,
        label: "LinkedIn"
    },
    {
        id: 'youtube',
        url: "https://www.youtube.com/@nulll0512/featured",
        Icon: FaYoutube,
        label: "YouTube"
    }
];

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.topSection}>
                    <div className={styles.brandColumn}>
                        <Link href="/" className={styles.logo}>
                            joonseo1227
                        </Link>
                        <p className={styles.tagline}>
                            Building digital experiences with passion and precision.
                            Exploring the intersection of design and technology.
                        </p>
                    </div>

                    <div className={styles.linkColumn}>
                        <h3 className={styles.columnTitle}>Connect</h3>
                        <ul className={styles.socialLinks}>
                            {SOCIAL_LINKS.map(({id, url, Icon, label}) => (
                                <li key={id}>
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.socialIcon}
                                        aria-label={label}
                                    >
                                        <Icon/>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className={styles.bottomSection}>
                    <p className={styles.copyright}>
                        © {currentYear} joonseo1227. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
