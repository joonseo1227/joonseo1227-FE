"use client";

import styles from '@/styles/components/SocialIcons.module.css';

import {FaGithub, FaInstagram, FaLinkedin, FaYoutube} from "react-icons/fa";
import {usePathname} from 'next/navigation';

const socialLinks = [
    {
        id: 'github',
        url: "https://github.com/joonseo1227",
        Icon: FaGithub
    },
    {
        id: 'instagram',
        url: "https://www.instagram.com/joonseo1227/",
        Icon: FaInstagram
    },
    {
        id: 'linkedin',
        url: "https://www.linkedin.com/in/joonseo1227/",
        Icon: FaLinkedin
    },
    {
        id: 'youtube',
        url: "https://www.youtube.com/@nulll0512/featured",
        Icon: FaYoutube
    }
];

export const SocialIcons = () => {
    const pathname = usePathname();

    if (pathname !== '/') return null;

    return (
        <div className={styles.socialIcons}>
            <ul>
                {socialLinks.map(({id, url, Icon}) => (
                    <li key={id}>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                            <Icon/>
                        </a>
                    </li>
                ))}
            </ul>
            <div className={styles.line}></div>
            <p>Follow Me</p>
        </div>
    );
};
