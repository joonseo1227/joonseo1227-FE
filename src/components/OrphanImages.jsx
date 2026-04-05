'use client';

import {useEffect, useState} from 'react';
import styles from '@/styles/pages/AdminPage.module.css';

const normalizeUrl = (url) => url?.split('?')[0] ?? '';

export default function OrphanImages({folder, referencedUrls}) {
    const [open, setOpen] = useState(false);
    const [images, setImages] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(new Set());

    useEffect(() => {
        if (!folder) return;
        let cancelled = false;
        setLoading(true);
        setImages(null);
        fetch(`/api/admin/orphan-images?folder=${encodeURIComponent(folder)}`)
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(({files}) => {
                if (!cancelled) setImages(files);
            })
            .catch(() => {
                if (!cancelled) setImages([]);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [folder]);

    const normalizedRefs = referencedUrls.map(normalizeUrl);
    const orphans = images?.filter(img => !normalizedRefs.includes(normalizeUrl(img.url))) ?? [];

    const handleDelete = async (img) => {
        setDeleting(prev => new Set([...prev, img.name]));
        try {
            const res = await fetch('/api/admin/storage-image', {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({path: `${folder}/${img.name}`}),
            });
            if (res.ok) {
                setImages(prev => prev?.filter(i => i.name !== img.name) ?? prev);
            }
        } finally {
            setDeleting(prev => {
                const s = new Set(prev);
                s.delete(img.name);
                return s;
            });
        }
    };

    if (loading || orphans.length === 0) return null;

    return (
        <div className={styles.orphanSection}>
            <button
                type="button"
                className={styles.orphanToggle}
                onClick={() => setOpen(o => !o)}
            >
                <span className={styles.orphanIcon}>{open ? '▾' : '▸'}</span>
                미사용 이미지
                <span className={styles.orphanBadge}>{orphans.length}</span>
            </button>
            {open && (
                <div className={styles.orphanGrid}>
                    {orphans.map(img => (
                        <div
                            key={img.name}
                            className={styles.orphanItem}
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.setData('application/x-orphan-image-url', img.url);
                                e.dataTransfer.effectAllowed = 'copy';
                            }}
                        >
                            <img
                                src={img.url}
                                alt=""
                                className={styles.orphanThumb}
                                onClick={() => window.open(img.url, '_blank', 'noopener,noreferrer')}
                                title="클릭하여 원본 보기"
                            />
                            <button
                                type="button"
                                className={styles.orphanDeleteBtn}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(img);
                                }}
                                disabled={deleting.has(img.name)}
                                title="삭제"
                                aria-label="이미지 삭제"
                            >
                                {deleting.has(img.name) ? '·' : '×'}
                            </button>
                            {img.size != null && (
                                <span className={styles.orphanSize}>
                                    {img.size < 1024
                                        ? `${img.size}B`
                                        : img.size < 1048576
                                            ? `${Math.round(img.size / 1024)}KB`
                                            : `${(img.size / 1048576).toFixed(1)}MB`}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
