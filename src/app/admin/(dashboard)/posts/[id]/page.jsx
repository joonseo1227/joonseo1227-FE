'use client';

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import Link from 'next/link';
import {ArrowLeft, CloudUpload, Launch, Settings} from '@carbon/icons-react';
import supabase from '@/lib/supabase';
import AdminBlockEditor from '@/components/admin/AdminBlockEditor';
import AdminPostMetadataSidebar from '@/components/admin/AdminPostMetadataSidebar';
import styles from '@/styles/pages/AdminPage.module.css';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

const defaultForm = {
    id: '',
    title: '',
    summary: '',
    content: '',
    thumbnail_url: '',
    status: 'private',
};

const toSlug = (str) =>
    str.toLowerCase().trim()
        .replace(/[^a-z0-9가-힣\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 80);

export default function AdminPostEditorPage() {
    const params = useParams();
    const router = useRouter();
    const isNew = params.id === 'new';

    const editorRef = useRef(null);
    const titleRef = useRef(null);
    const [form, setForm] = useState(defaultForm);
    const [originalId, setOriginalId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [isDraggingOrphan, setIsDraggingOrphan] = useState(false);

    useEffect(() => {
        supabase.from('categories').select('*').order('name')
            .then(({data}) => setCategories(data || []));
    }, []);

    useEffect(() => {
        if (isNew) return;
        const fetchPost = async () => {
            try {
                const {data, error} = await supabase
                    .from('posts')
                    .select('*, post_categories(category_id)')
                    .eq('id', params.id)
                    .single();
                if (error) throw error;
                setForm({
                    id: data.id || '',
                    title: data.title || '',
                    summary: data.summary || '',
                    content: data.content || '',
                    thumbnail_url: data.thumbnail_url || '',
                    status: data.status || 'private',
                });
                setOriginalId(data.id || '');
                const cats = data.post_categories;
                const catItem = Array.isArray(cats) ? cats[0] : cats;
                setSelectedCategory(catItem?.category_id ?? null);
            } catch (err) {
                console.error(err);
                setMessage({type: 'error', text: '포스트를 불러올 수 없습니다.'});
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [params.id, isNew]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm(prev => {
            if (isNew && name === 'title' && !prev._idManuallyEdited) {
                return {...prev, title: value, id: toSlug(value)};
            }
            if (name === 'id') {
                return {...prev, id: value, _idManuallyEdited: true};
            }
            return {...prev, [name]: value};
        });
    };

    // 기존 포스트 슬러그 변경 처리
    const handleSlugRename = async (oldSlug, newSlug) => {
        const res = await fetch(`/api/admin/posts/${oldSlug}/rename-slug`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({newSlug}),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        return data;
    };

    // contentEditable title handlers
    const handleTitleInput = () => {
        const value = titleRef.current?.innerText ?? '';
        handleChange({target: {name: 'title', value}});
    };

    const handleTitleKeyDown = (e) => {
        if (e.key === 'Enter') e.preventDefault();
    };

    const handleTitlePaste = (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain').replace(/\n/g, ' ');
        document.execCommand('insertText', false, text);
    };

    // Sync contentEditable DOM when form.title changes from outside (e.g. data load)
    useEffect(() => {
        const el = titleRef.current;
        if (!el) return;
        if (el.innerText !== form.title) {
            el.innerText = form.title;
        }
    }, [form.title]);

    const handleContentChange = (markdown) => {
        setForm(prev => ({...prev, content: markdown}));
    };


    // Upload an image via BlockNote integration
    const handleImageUpload = useCallback(async (file) => {
        const folder = isNew ? 'posts/misc' : `posts/${form.id || params.id}`;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);
        const res = await fetch('/api/admin/upload-image', {method: 'POST', body: formData});
        if (!res.ok) throw new Error('업로드 실패');
        return (await res.json()).url;
    }, [isNew, params.id, form.id]);

    const purgeMiscFolder = async () => {
        try {
            const res = await fetch('/api/admin/orphan-images?folder=posts%2Fmisc');
            if (!res.ok) return;
            const {files} = await res.json();
            await Promise.all(files.map(f =>
                fetch('/api/admin/storage-image', {
                    method: 'DELETE',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({path: `posts/misc/${f.name}`}),
                })
            ));
        } catch { /* best-effort */
        }
    };

    const migrateMiscImages = async (slug, thumbnail_url, content) => {
        const miscPrefix = `${SUPABASE_URL}/storage/v1/object/public/images/posts/misc/`;
        const miscUrls = new Set();
        if (thumbnail_url?.startsWith(miscPrefix)) miscUrls.add(thumbnail_url);
        const contentMiscMatches = content?.match(/https?:\/\/[^\s)"\]]+\/posts\/misc\/[^\s)"\]]+/g) || [];
        contentMiscMatches.forEach(u => miscUrls.add(u));
        if (!miscUrls.size) return null;

        const res = await fetch('/api/admin/move-images', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({urls: [...miscUrls], targetFolder: `posts/${slug}`}),
        });
        if (!res.ok) return null;
        const {urlMap} = await res.json();
        if (!Object.keys(urlMap).length) return null;

        let newThumbnail = thumbnail_url;
        let newContent = content;
        for (const [oldUrl, newUrl] of Object.entries(urlMap)) {
            if (newThumbnail === oldUrl) newThumbnail = newUrl;
            newContent = newContent.replaceAll(oldUrl, newUrl);
        }
        return {thumbnail_url: newThumbnail, content: newContent};
    };

    const handleSave = async (e) => {
        e?.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            const {_idManuallyEdited, ...postData} = form;

            // 기존 포스트의 슬러그가 변경된 경우: rename-slug 먼저 처리
            if (!isNew && originalId && postData.id !== originalId) {
                const {urlMap} = await handleSlugRename(originalId, postData.id);
                // rename-slug가 스토리지 이동 + DB PK 변경까지 완료
                // 이후 PUT이 구 URL로 덮어쓰지 않도록 postData에도 URL 반영
                if (urlMap && Object.keys(urlMap).length > 0) {
                    for (const [oldUrl, newUrl] of Object.entries(urlMap)) {
                        if (postData.thumbnail_url === oldUrl) postData.thumbnail_url = newUrl;
                        if (postData.content) postData.content = postData.content.replaceAll(oldUrl, newUrl);
                    }
                    setForm(prev => ({...prev, content: postData.content, thumbnail_url: postData.thumbnail_url}));
                }
            }

            const body = {post: postData, categoryId: selectedCategory};
            let res;
            if (isNew) {
                res = await fetch('/api/admin/posts', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(body)
                });
            } else {
                res = await fetch(`/api/admin/posts/${postData.id}`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(body)
                });
            }
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            if (isNew && data.id) {
                const migrated = await migrateMiscImages(data.id, postData.thumbnail_url, postData.content);
                if (migrated) {
                    await fetch(`/api/admin/posts/${data.id}`, {
                        method: 'PUT',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            post: {...postData, id: data.id, ...migrated},
                            categoryId: selectedCategory
                        }),
                    });
                    setForm(prev => ({...prev, ...migrated}));
                }
                await purgeMiscFolder();
            }

            setMessage({type: 'success', text: '저장되었습니다.'});
            if (isNew) {
                router.replace(`/admin/posts/${data.id}`);
            } else if (!isNew && originalId && postData.id !== originalId) {
                setOriginalId(postData.id);
                router.replace(`/admin/posts/${postData.id}`);
            }
        } catch (err) {
            setMessage({type: 'error', text: `저장 실패: ${err.message}`});
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const postReferencedUrls = useMemo(() => {
        const urls = new Set();
        if (form.thumbnail_url) urls.add(form.thumbnail_url);
        (form.content?.match(/https?:\/\/[^\s)"\]]+/g) || []).forEach(u => urls.add(u));
        return [...urls];
    }, [form.thumbnail_url, form.content]);

    if (loading) return <div className={styles.loading}>로딩 중...</div>;

    return (
        <div className={styles.fullScreenEditorLayout}>
            {/* Toast notification */}
            {message && (
                <div
                    className={`${styles.editorToast} ${message.type === 'error' ? styles.editorToastError : styles.editorToastSuccess}`}>
                    {message.text}
                </div>
            )}

            {/* Top Toolbar */}
            <header className={styles.editorToolbar}>
                <div className={styles.toolbarLeft}>
                    <Link href="/admin/posts" className={styles.toolbarIconBtn} title="목록으로">
                        <ArrowLeft size={20}/>
                    </Link>
                </div>
                <div className={styles.toolbarRight}>
                    <div className={styles.statusDropdownWrapper}>
                        <button
                            type="button"
                            className={`${styles.toolbarStatusBadge} ${
                                form.status === 'published' ? styles.toolbarStatusPublished
                                    : form.status === 'unlisted' ? styles.toolbarStatusUnlisted
                                        : styles.toolbarStatusPrivate
                            }`}
                            onClick={() => setIsStatusDropdownOpen(v => !v)}
                        >
                            {form.status === 'published' ? '공개됨'
                                : form.status === 'unlisted' ? '일부공개'
                                    : '비공개'}
                        </button>
                        {isStatusDropdownOpen && (
                            <>
                                <div className={styles.statusDropdownOverlay}
                                     onClick={() => setIsStatusDropdownOpen(false)}/>
                                <div className={styles.statusDropdown}>
                                    {[
                                        {value: 'private', label: '비공개', cls: styles.toolbarStatusPrivate},
                                        {value: 'unlisted', label: '일부공개', cls: styles.toolbarStatusUnlisted},
                                        {value: 'published', label: '공개됨', cls: styles.toolbarStatusPublished},
                                    ].map(({value, label, cls}) => (
                                        <button
                                            key={value}
                                            type="button"
                                            className={`${styles.statusDropdownItem} ${cls} ${form.status === value ? styles.statusDropdownItemActive : ''}`}
                                            onClick={() => {
                                                handleChange({target: {name: 'status', value}});
                                                setIsStatusDropdownOpen(false);
                                            }}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                    <button type="button"
                            className={`${styles.toolbarIconBtn} ${isSidebarOpen ? styles.toolbarIconBtnActive : ''}`}
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            title="메타데이터">
                        <Settings size={20}/>
                    </button>
                    {!isNew && (
                        <Link href={`/blog/${params.id}`} target="_blank"
                              className={`${styles.toolbarIconBtn} ${styles.hideOnMobile}`}
                              title="미리보기">
                            <Launch size={20}/>
                        </Link>
                    )}
                    <button type="button" onClick={handleSave}
                            className={`${styles.toolbarIconBtn} ${styles.toolbarIconBtnPrimary}`}
                            disabled={saving}
                            title="저장">
                        <CloudUpload size={20}/>
                    </button>
                </div>
            </header>

            {/* Main Editing Area */}
            <main className={styles.editorMainArea}>
                <div className={styles.editorContainer}>
                    <div
                        ref={titleRef}
                        contentEditable
                        suppressContentEditableWarning
                        className={styles.editorTitleInput}
                        data-placeholder="제목을 입력하세요"
                        onInput={handleTitleInput}
                        onKeyDown={handleTitleKeyDown}
                        onPaste={handleTitlePaste}
                    />
                    <AdminBlockEditor
                        ref={editorRef}
                        initialContent={form.content}
                        onChange={handleContentChange}
                        onUploadImage={handleImageUpload}
                        theme="dark" // Dashboard defaults to dark mode natively
                    />
                </div>
            </main>

            {/* Sidebar Overlay structure */}
            <AdminPostMetadataSidebar
                isNew={isNew}
                form={form}
                originalId={originalId}
                categories={categories}
                selectedCategory={selectedCategory}
                handleChange={handleChange}
                setSelectedCategory={setSelectedCategory}
                postReferencedUrls={postReferencedUrls}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onInsertImage={(url) => editorRef.current?.insertImage(url)}
                isDraggingOrphan={isDraggingOrphan}
                onImageDragStart={() => setIsDraggingOrphan(true)}
                onImageDragEnd={() => setIsDraggingOrphan(false)}
            />
        </div>
    );
}
