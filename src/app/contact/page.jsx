'use client';
import styles from '@/styles/pages/ContactPage.module.css';
import {useState} from 'react';
import {CheckmarkFilled, Copy} from '@carbon/icons-react';

export default function ContactPage() {
    const [copied, setCopied] = useState(false);
    const email = "joonseo1227@gmail.com";

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(email);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <div className={styles.contactPage}>
            <h1 className="titleText">Contact</h1>
            <div className={styles.emailContainer}>
                <h2>{email}</h2>
                <button
                    className={`${styles.copyButton} ${copied ? styles.copied : ''}`}
                    onClick={copyToClipboard}
                    aria-label="Copy email to clipboard"
                >
                    {copied ? <CheckmarkFilled size={24}/> : <Copy size={24}/>}
                </button>
            </div>
        </div>
    );
}
