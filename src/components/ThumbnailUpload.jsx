'use client';

import {useRef, useState} from 'react';
import styles from '@/styles/pages/AdminPage.module.css';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

export default function ThumbnailUpload({value, onChange, folder}) {
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef(null);

    const isSupabaseUrl = (url) => url && url.includes(SUPABASE_URL);

    const uploadViaUrl = async (url) => {
        setUploading(true);
        setUploadError('');
        try {
            const res = await fetch('/api/admin/upload-image', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({url, folder: folder || 'posts/misc'}),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            onChange(data.url);
        } catch (err) {
            setUploadError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const uploadViaFile = async (file) => {
        setUploading(true);
        setUploadError('');
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', folder || 'posts/misc');
            const res = await fetch('/api/admin/upload-image', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            onChange(data.url);
        } catch (err) {
            setUploadError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleUrlBlur = (e) => {
        const url = e.target.value.trim();
        if (!url || isSupabaseUrl(url)) return;
        uploadViaUrl(url);
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        uploadViaFile(file);
        e.target.value = '';
    };

    const [removing, setRemoving] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const handleRemove = async () => {
        const prefix = `${SUPABASE_URL}/storage/v1/object/public/images/`;
        if (value.startsWith(prefix)) {
            setRemoving(true);
            const path = value.slice(prefix.length).split('?')[0];
            try {
                await fetch('/api/admin/storage-image', {
                    method: 'DELETE',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({path}),
                });
            } finally {
                setRemoving(false);
            }
        }
        onChange('');
    };

    const handleDragOver = (e) => {
        if (Array.from(e.dataTransfer.items).some(item => item.kind === 'file' && item.type.startsWith('image/'))) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false);
    };

    const handleDrop = (e) => {
        setIsDragging(false);
        const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'));
        if (!file) return;
        e.preventDefault();
        uploadViaFile(file);
    };

    return (
        <div>
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                    display: 'flex', gap: 8,
                    padding: 8,
                    borderRadius: 6,
                    border: isDragging ? '1.5px dashed var(--color-gray-40)' : '1.5px dashed transparent',
                    background: isDragging ? 'rgba(255,255,255,0.04)' : 'transparent',
                    transition: 'border-color 0.15s, background 0.15s',
                    marginBottom: isDragging ? 0 : 0,
                }}
            >
                <input
                    type="url"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={handleUrlBlur}
                    className={styles.input}
                    placeholder={isDragging ? '여기에 놓으세요' : 'URL 입력 시 자동 업로드 / 파일 선택 또는 드래그'}
                    disabled={uploading}
                />
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{display: 'none'}}
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    disabled={uploading}
                    style={{whiteSpace: 'nowrap', flexShrink: 0}}
                >
                    {uploading ? '업로드 중...' : '파일 선택'}
                </button>
            </div>

            {uploadError && (
                <p style={{color: 'var(--color-red-50)', fontSize: 12, marginTop: 6}}>
                    {uploadError}
                </p>
            )}

            {value && isSupabaseUrl(value) && (
                <div style={{marginTop: 10, position: 'relative', display: 'inline-block'}}>
                    <img
                        src={value}
                        alt="thumbnail preview"
                        style={{height: 80, objectFit: 'cover', borderRadius: 4, display: 'block'}}
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        disabled={removing}
                        style={{
                            position: 'absolute', top: -6, right: -6,
                            width: 20, height: 20, borderRadius: '50%',
                            background: 'var(--color-gray-70)', border: 'none',
                            color: 'var(--color-gray-10)', fontSize: 11,
                            cursor: removing ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            opacity: removing ? 0.5 : 1,
                        }}
                        title="제거"
                    >
                        {removing ? '·' : '✕'}
                    </button>
                </div>
            )}
        </div>
    );
}
