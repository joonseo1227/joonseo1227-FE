import React from 'react';
import styles from '@/styles/components/LinkButton.module.css';
import {Launch} from '@carbon/icons-react';

const LinkButton = ({href, target, rel, children, className, ...props}) => {
    return (
        <a
            href={href}
            target={target}
            rel={rel}
            className={`${styles.linkButton} ${className || ''}`}
            {...props}
        >
            <span className={styles.linkContent}>{children}</span>
            <Launch size={20} className={styles.linkIcon}/>
        </a>
    );
};

export default LinkButton;
