import styles from '@/styles/components/SocialIcons.module.css';

import {
    FaCircle,
    FaFacebookF,
    FaGithub,
    FaInstagram,
    FaLinkedin,
    FaSnapchatGhost,
    FaTiktok,
    FaTwitch,
    FaTwitter,
    FaYoutube
} from "react-icons/fa";

const ICON_MAPPING = {
    default: FaCircle,
    facebook: FaFacebookF,
    github: FaGithub,
    instagram: FaInstagram,
    linkedin: FaLinkedin,
    snapchat: FaSnapchatGhost,
    tiktok: FaTiktok,
    twitter: FaTwitter,
    twitch: FaTwitch,
    youtube: FaYoutube
};

const social = {
    github: "https://github.com/joonseo1227",
    instagram: "https://www.instagram.com/joonseo1227/",
    linkedin: "https://www.linkedin.com/in/joonseo1227/",
    youtube: "https://www.youtube.com/@nulll0512/featured",
};

export const SocialIcons = () => {
    return (
        <div className={styles.socialIcons}>
            <ul>
                {Object.entries(social).map(([platform, url]) => {
                    const IconComponent = ICON_MAPPING[platform] || ICON_MAPPING.default;
                    return (
                        <li key={platform}>
                            <a href={url}>
                                <IconComponent/>
                            </a>
                        </li>
                    );
                })}
            </ul>
            <div className={styles.line}></div>
            <p>Follow Me</p>
        </div>
    );
};
