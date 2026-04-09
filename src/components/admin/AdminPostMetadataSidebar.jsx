'use client';

import React from 'react';
import ThumbnailUpload from '@/components/ThumbnailUpload';
import OrphansImages from '@/components/OrphanImages';
import styles from '@/styles/pages/AdminPage.module.css';

// ── posts.status CHECK: 'private' | 'unlisted' | 'published'
const STATUS_OPTIONS = [
    {value: 'private', label: '비공개'},
    {value: 'unlisted', label: '일부공개'},
    {value: 'published', label: '게시됨'},
];

export default function AdminPostMetadataSidebar({
                                                     isNew,
                                                     form,
                                                     originalId,
                                                     categories,
                                                     selectedCategory,
                                                     handleChange,
                                                     setSelectedCategory,
                                                     postReferencedUrls,
                                                     isOpen,
                                                     onClose,
                                                     onInsertImage,
                                                     isDraggingOrphan,
                                                     onImageDragStart,
                                                     onImageDragEnd,
                                                 }) {
    const slugChanged = !isNew && originalId && form.id !== originalId;
    // When NOT dragging an orphan image, the overlay intercepts drops as a fallback.
    const handleOverlayDragOver = (e) => {
        if (e.dataTransfer.types.includes('application/x-orphan-image-url')) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        }
    };

    const handleOverlayDrop = (e) => {
        const url = e.dataTransfer.getData('application/x-orphan-image-url');
        if (!url) return;
        e.preventDefault();
        onInsertImage?.(url);
    };

    return (
        <div className={`${styles.metadataSidebarWrapper} ${isOpen ? styles.metadataSidebarOpen : ''}`}>
            {/* Overlay: transparent to drag events while dragging so editor can receive drops */}
            {isOpen && (
                <div
                    className={styles.metadataSidebarOverlay}
                    style={isDraggingOrphan ? {pointerEvents: 'none'} : undefined}
                    onClick={onClose}
                    onDragOver={handleOverlayDragOver}
                    onDrop={handleOverlayDrop}
                />
            )}

            <div className={styles.metadataSidebar}>
                <div className={styles.metadataSidebarHeader}>
                    <h2 className={styles.metadataSidebarTitle}>포스트 메타데이터</h2>
                    <button className={styles.metadataSidebarCloseBtn} onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className={styles.metadataSidebarContent}>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="id">
                            ID (슬러그){isNew && <span style={{
                            color: 'var(--color-gray-60)',
                            fontWeight: 400,
                            marginLeft: 6
                        }}>자동 생성</span>}
                        </label>
                        <input id="id" name="id" type="text" value={form.id} onChange={handleChange}
                               className={styles.input} placeholder="my-post-slug" required
                        />
                        {slugChanged && (
                            <p style={{
                                marginTop: 6,
                                fontSize: '0.75rem',
                                color: 'var(--color-warning, #f59e0b)',
                                lineHeight: 1.4,
                            }}>
                                저장 시 슬러그가 <strong>{originalId}</strong> → <strong>{form.id}</strong>로 변경되며,
                                본문 이미지 경로도 함께 이동됩니다.
                            </p>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="summary">요약</label>
                        <textarea id="summary" name="summary" value={form.summary} onChange={handleChange}
                                  className={styles.textarea} placeholder="포스트 요약 (목록에서 표시됨)" rows={3}/>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>썸네일</label>
                        <ThumbnailUpload
                            value={form.thumbnail_url}
                            onChange={(url) => handleChange({target: {name: 'thumbnail_url', value: url}})}
                            folder={isNew ? 'posts/misc' : `posts/${form.id || 'misc'}`}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="status">상태</label>
                        <select id="status" name="status" value={form.status} onChange={handleChange}
                                className={styles.select}>
                            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>

                    {categories.length > 0 && (
                        <div className={styles.formGroup}>
                            <label className={styles.label}>카테고리</label>
                            <div className={styles.checkboxGroup}>
                                <button type="button"
                                        onClick={() => setSelectedCategory(null)}
                                        className={`${styles.checkboxChip} ${selectedCategory === null ? styles.checkboxChipActive : ''}`}>
                                    없음
                                </button>
                                {categories.map((cat) => (
                                    <button key={cat.id} type="button"
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className={`${styles.checkboxChip} ${selectedCategory === cat.id ? styles.checkboxChipActive : ''}`}>
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {!isNew && form.id && (
                        <OrphansImages
                            folder={`posts/${form.id}`}
                            referencedUrls={postReferencedUrls}
                            onImageDragStart={onImageDragStart}
                            onImageDragEnd={onImageDragEnd}
                            onInsertImage={onInsertImage}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
