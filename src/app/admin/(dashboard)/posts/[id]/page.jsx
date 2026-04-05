'use client';

import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import Link from 'next/link';
import supabase from '@/lib/supabase';
import ThumbnailUpload from '@/components/ThumbnailUpload';
import MarkdownContent from '@/components/MarkdownContent';
import OrphanImages from '@/components/OrphanImages';
import styles from '@/styles/pages/AdminPage.module.css';

// ── posts.status CHECK: 'private' | 'unlisted' | 'published'
const STATUS_OPTIONS = [
    {value: 'private', label: '비공개'},
    {value: 'unlisted', label: '일부공개'},
    {value: 'published', label: '게시됨'},
];

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

// ── HTML → Markdown converter ────────────────────────────────────────────────

const BLOCK_TAGS = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'pre', 'blockquote', 'table', 'div', 'figure', 'hr']);
const SKIP_TAGS = new Set(['head', 'script', 'style', 'meta', 'link', 'noscript']);

function convertNode(node) {
    if (node.nodeType === 3) return node.textContent;
    if (node.nodeType !== 1) return '';
    const tag = node.tagName.toLowerCase();
    if (SKIP_TAGS.has(tag)) return '';
    const children = () => Array.from(node.childNodes).map(convertNode).join('');

    switch (tag) {
        case 'h1':
            return `# ${children().trim()}\n\n`;
        case 'h2':
            return `## ${children().trim()}\n\n`;
        case 'h3':
            return `### ${children().trim()}\n\n`;
        case 'h4':
            return `#### ${children().trim()}\n\n`;
        case 'h5':
            return `##### ${children().trim()}\n\n`;
        case 'h6':
            return `###### ${children().trim()}\n\n`;
        case 'p': {
            const c = children().trim();
            return c ? `${c}\n\n` : '';
        }
        case 'br':
            return '\n';
        case 'hr':
            return '---\n\n';
        case 'strong':
        case 'b': {
            const c = children();
            return c.trim() ? `**${c}**` : '';
        }
        case 'em':
        case 'i': {
            const c = children();
            return c.trim() ? `*${c}*` : '';
        }
        case 's':
        case 'del':
        case 'strike': {
            const c = children();
            return c.trim() ? `~~${c}~~` : '';
        }
        case 'code': {
            if (node.parentElement?.tagName.toLowerCase() === 'pre') return children();
            const c = children();
            return c ? `\`${c}\`` : '';
        }
        case 'pre': {
            const lang = node.querySelector('code')?.className?.match(/language-(\w+)/)?.[1] || '';
            return `\`\`\`${lang}\n${children().trim()}\n\`\`\`\n\n`;
        }
        case 'blockquote': {
            const c = children().trim();
            return c ? c.split('\n').map(l => `> ${l}`).join('\n') + '\n\n' : '';
        }
        case 'a': {
            const href = node.getAttribute('href') || '';
            const text = children().trim();
            if (!text) return '';
            return (!href || href === '#') ? text : `[${text}](${href})`;
        }
        case 'img': {
            const src = node.getAttribute('src') || '';
            const alt = node.getAttribute('alt') || '';
            return src ? `![${alt}](${src})\n\n` : '';
        }
        case 'figure':
            return children();
        case 'figcaption': {
            const c = children().trim();
            return c ? `*${c}*\n\n` : '';
        }
        case 'ul': {
            const items = Array.from(node.children)
                .filter(el => el.tagName.toLowerCase() === 'li')
                .map(li => `- ${Array.from(li.childNodes).map(convertNode).join('').trim()}`)
                .join('\n');
            return items ? `${items}\n\n` : '';
        }
        case 'ol': {
            const items = Array.from(node.children)
                .filter(el => el.tagName.toLowerCase() === 'li')
                .map((li, i) => `${i + 1}. ${Array.from(li.childNodes).map(convertNode).join('').trim()}`)
                .join('\n');
            return items ? `${items}\n\n` : '';
        }
        case 'li':
            return children();
        case 'table': {
            const rows = Array.from(node.querySelectorAll('tr'));
            if (!rows.length) return '';
            const mdRows = rows.map(row =>
                '| ' + Array.from(row.querySelectorAll('th, td'))
                    .map(c => Array.from(c.childNodes).map(convertNode).join('').trim())
                    .join(' | ') + ' |'
            );
            if (rows[0].querySelector('th')) {
                const cols = rows[0].querySelectorAll('th').length;
                mdRows.splice(1, 0, '| ' + Array(cols).fill('---').join(' | ') + ' |');
            }
            return mdRows.join('\n') + '\n\n';
        }
        case 'span': {
            const style = node.getAttribute('style') || '';
            const isBold = /font-weight\s*:\s*(600|700|bold)/.test(style);
            const isItalic = /font-style\s*:\s*italic/.test(style);
            const isMono = /font-family[^;]*(mono|courier)/i.test(style);
            let c = children();
            if (!c.trim()) return c;
            if (isMono) return `\`${c}\``;
            if (isBold && isItalic) return `***${c}***`;
            if (isBold) return `**${c}**`;
            if (isItalic) return `*${c}*`;
            return c;
        }
        case 'div':
        case 'section':
        case 'article':
        case 'main': {
            const hasBlock = Array.from(node.children).some(el => BLOCK_TAGS.has(el.tagName.toLowerCase()));
            const c = children();
            if (hasBlock) return c;
            const t = c.trim();
            return t ? `${t}\n\n` : '';
        }
        default:
            return children();
    }
}

// Upload a File/Blob directly to Supabase via the API
async function uploadImageFile(file, folder) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    const res = await fetch('/api/admin/upload-image', {method: 'POST', body: formData});
    if (!res.ok) throw new Error('업로드 실패');
    return (await res.json()).url;
}

// folder: 'posts/{post-id}' — matches storage structure posts/{id}/*.ext
async function htmlToMarkdown(html, folder) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const imgs = Array.from(doc.querySelectorAll('img'));
    await Promise.all(imgs.map(async (img) => {
        const src = img.getAttribute('src');
        if (!src || src.startsWith('data:') || src.includes(SUPABASE_URL)) return;
        try {
            const res = await fetch('/api/admin/upload-image', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({url: src, folder}),
            });
            if (res.ok) img.setAttribute('src', (await res.json()).url);
        } catch { /* keep original */
        }
    }));
    return convertNode(doc.body).replace(/\n{3,}/g, '\n\n').trim();
}

// ── Component ────────────────────────────────────────────────────────────────

export default function AdminPostEditorPage() {
    const params = useParams();
    const router = useRouter();
    const isNew = params.id === 'new';
    const contentRef = useRef(null);
    const previewPaneRef = useRef(null);

    const [form, setForm] = useState(defaultForm);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null); // single category (post_id UNIQUE)
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [pasteLoading, setPasteLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [activeTab, setActiveTab] = useState('edit');
    const [message, setMessage] = useState(null);

    const handleSyncScroll = () => {
        const textarea = contentRef.current;
        const previewPane = previewPaneRef.current;
        if (!textarea || !previewPane) return;

        const cursorPosition = textarea.selectionStart;
        const textBeforeCursor = textarea.value.substring(0, cursorPosition);
        const currentLine = textBeforeCursor.split('\n').length;

        const elementsWithLine = Array.from(previewPane.querySelectorAll('[data-line]'));
        if (elementsWithLine.length === 0) return;

        let targetElement = null;
        let maxLine = -1;

        for (const el of elementsWithLine) {
            const line = parseInt(el.getAttribute('data-line'), 10);
            if (line <= currentLine && line > maxLine) {
                maxLine = line;
                targetElement = el;
            }
        }

        if (targetElement) {
            const paneRect = previewPane.getBoundingClientRect();
            const elRect = targetElement.getBoundingClientRect();
            const offset = elRect.top - paneRect.top + previewPane.scrollTop - 20; // 20px padding
            previewPane.scrollTo({ top: offset, behavior: 'smooth' });
        }
    };

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
                const cats = data.post_categories;
                // post_id UNIQUE → PostgREST returns single object, not array
                const catItem = Array.isArray(cats) ? cats[0] : cats;
                setSelectedCategory(catItem?.category_id ?? null);
            } catch {
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
            // 새 포스트 작성 중 제목 변경 시 id(슬러그) 자동 생성
            if (isNew && name === 'title' && !prev._idManuallyEdited) {
                return {...prev, title: value, id: toSlug(value)};
            }
            // id 직접 수정 시 자동생성 비활성화
            if (name === 'id') {
                return {...prev, id: value, _idManuallyEdited: true};
            }
            return {...prev, [name]: value};
        });
    };

    const handleContentPaste = async (e) => {
        const textarea = contentRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const folder = isNew ? 'posts/misc' : `posts/${params.id}`;

        // 1. 클립보드에 이미지 파일이 있으면 바로 업로드 (단일 이미지 복사 시)
        const imageItems = Array.from(e.clipboardData.items).filter(item => item.type.startsWith('image/'));
        if (imageItems.length > 0) {
            e.preventDefault();
            setPasteLoading(true);
            try {
                const urls = await Promise.all(imageItems.map(item => uploadImageFile(item.getAsFile(), folder)));
                const markdown = urls.map(url => `![](${url})\n\n`).join('');
                setForm(prev => ({
                    ...prev,
                    content: prev.content.slice(0, start) + markdown + prev.content.slice(end)
                }));
                setTimeout(() => {
                    textarea.selectionStart = textarea.selectionEnd = start + markdown.length;
                    textarea.focus();
                }, 0);
            } catch (err) {
                setMessage({type: 'error', text: `이미지 업로드 실패: ${err.message}`});
            } finally {
                setPasteLoading(false);
            }
            return;
        }

        // 2. HTML에 <img>가 포함된 경우
        const html = e.clipboardData.getData('text/html');
        if (!html || !html.includes('<img')) return;
        e.preventDefault();
        setPasteLoading(true);
        try {
            const markdown = await htmlToMarkdown(html, folder);
            setForm(prev => ({...prev, content: prev.content.slice(0, start) + markdown + prev.content.slice(end)}));
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + markdown.length;
                textarea.focus();
            }, 0);
        } catch {
            const plain = e.clipboardData.getData('text/plain');
            setForm(prev => ({...prev, content: prev.content.slice(0, start) + plain + prev.content.slice(end)}));
        } finally {
            setPasteLoading(false);
        }
    };

    const handleContentDragOver = (e) => {
        const hasImageFile = Array.from(e.dataTransfer.items).some(item => item.kind === 'file' && item.type.startsWith('image/'));
        const hasOrphanUrl = e.dataTransfer.types.includes('application/x-orphan-image-url');
        if (hasImageFile || hasOrphanUrl) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            setIsDragging(true);
        }
    };

    const handleContentDragLeave = (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false);
    };

    const handleContentDrop = async (e) => {
        setIsDragging(false);

        // Orphan image drag from the panel — insert as markdown without re-uploading
        const orphanUrl = e.dataTransfer.getData('application/x-orphan-image-url');
        if (orphanUrl) {
            e.preventDefault();
            const textarea = contentRef.current;
            const pos = textarea.selectionStart;
            const markdown = `![](${orphanUrl})\n\n`;
            setForm(prev => ({...prev, content: prev.content.slice(0, pos) + markdown + prev.content.slice(pos)}));
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = pos + markdown.length;
                textarea.focus();
            }, 0);
            return;
        }

        const imageFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        if (!imageFiles.length) return;
        e.preventDefault();
        setPasteLoading(true);
        const textarea = contentRef.current;
        const pos = textarea.selectionStart;
        const folder = isNew ? 'posts/misc' : `posts/${params.id}`;
        try {
            const urls = await Promise.all(imageFiles.map(f => uploadImageFile(f, folder)));
            const markdown = urls.map(url => `![](${url})\n\n`).join('');
            setForm(prev => ({...prev, content: prev.content.slice(0, pos) + markdown + prev.content.slice(pos)}));
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = pos + markdown.length;
                textarea.focus();
            }, 0);
        } catch (err) {
            setMessage({type: 'error', text: `이미지 업로드 실패: ${err.message}`});
        } finally {
            setPasteLoading(false);
        }
    };

    // Delete all remaining files in posts/misc (orphaned during creation)
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

    // Extract all misc URLs from thumbnail and content, move them to the slug folder,
    // and return updated { thumbnail_url, content } with new URLs substituted.
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
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            const {_idManuallyEdited, ...postData} = form;
            const body = {post: postData, categoryId: selectedCategory};
            let res;
            if (isNew) {
                res = await fetch('/api/admin/posts', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(body)
                });
            } else {
                res = await fetch(`/api/admin/posts/${params.id}`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(body)
                });
            }
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            // Move misc images to the slug folder for new posts
            if (isNew && data.id) {
                const migrated = await migrateMiscImages(data.id, postData.thumbnail_url, postData.content);
                if (migrated) {
                    // Update DB with new URLs
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
                // Clean up any leftover misc files (removed from content before save)
                await purgeMiscFolder();
            }

            setMessage({type: 'success', text: '저장되었습니다.'});
            if (isNew) router.replace(`/admin/posts/${data.id}`);
        } catch (err) {
            setMessage({type: 'error', text: `저장 실패: ${err.message}`});
        } finally {
            setSaving(false);
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
        <>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>{isNew ? '새 포스트' : '포스트 수정'}</h1>
                <Link href="/admin/posts" className={`${styles.btn} ${styles.btnSecondary}`}>목록으로</Link>
            </div>

            <form onSubmit={handleSave} className={`${styles.form} ${styles.formWide}`}>
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="title">제목</label>
                        <input id="title" name="title" type="text" value={form.title} onChange={handleChange}
                               className={styles.input} placeholder="포스트 제목" required/>
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="id">
                            ID (슬러그){isNew && <span style={{
                            color: 'var(--color-gray-60)',
                            fontWeight: 400,
                            marginLeft: 6
                        }}>제목 입력 시 자동 생성</span>}
                        </label>
                        <input id="id" name="id" type="text" value={form.id} onChange={handleChange}
                               className={styles.input} placeholder="my-post-slug" required
                               disabled={!isNew}
                               style={!isNew ? {opacity: 0.5} : {}}
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="summary">요약</label>
                    <textarea id="summary" name="summary" value={form.summary} onChange={handleChange}
                              className={styles.textarea} placeholder="포스트 요약 (목록에서 표시됨)" rows={3}/>
                </div>

                <div className={styles.formGroup}>
                    <div className={styles.editorLabelRow}>
                        <label className={styles.label} htmlFor="content">
                            본문 (Markdown)
                            {pasteLoading && <span
                                style={{marginLeft: 10, fontSize: 12, color: 'var(--color-gray-50)', fontWeight: 400}}>이미지 업로드 중...</span>}
                        </label>
                        <div className={styles.editorTabBar}>
                            <button type="button" onClick={() => setActiveTab('edit')}
                                    className={`${styles.editorTabBtn} ${activeTab === 'edit' ? styles.editorTabBtnActive : ''}`}>
                                편집
                            </button>
                            <button type="button" onClick={() => setActiveTab('preview')}
                                    className={`${styles.editorTabBtn} ${activeTab === 'preview' ? styles.editorTabBtnActive : ''}`}>
                                미리보기
                            </button>
                        </div>
                    </div>
                    <div className={styles.editorSplit}>
                        <div
                            className={`${styles.editorEditPane} ${activeTab === 'preview' ? styles.editorPaneHidden : ''}`}>
                            <textarea ref={contentRef} id="content" name="content"
                                      value={form.content}
                                      onChange={(e) => {
                                          handleChange(e);
                                          handleSyncScroll();
                                      }}
                                      onKeyUp={handleSyncScroll}
                                      onClick={handleSyncScroll}
                                      onPaste={handleContentPaste}
                                      onDragOver={handleContentDragOver} onDragLeave={handleContentDragLeave}
                                      onDrop={handleContentDrop}
                                      className={`${styles.textarea} ${styles.textareaSplit} ${styles.textareaCode} ${isDragging ? styles.textareaDragging : ''}`}
                                      placeholder={"마크다운으로 본문을 작성하세요."}
                                      disabled={pasteLoading}/>
                        </div>
                        <div
                            ref={previewPaneRef}
                            className={`${styles.editorPreviewPane} ${activeTab === 'edit' ? styles.editorPaneHidden : ''}`}>
                            {form.content
                                ? <div className={styles.previewBody}><MarkdownContent content={form.content}/></div>
                                : <p className={styles.previewEmpty}>미리보기할 내용이 없습니다.</p>
                            }
                        </div>
                    </div>
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>썸네일</label>
                        <ThumbnailUpload
                            value={form.thumbnail_url}
                            onChange={(url) => setForm(prev => ({...prev, thumbnail_url: url}))}
                            folder={isNew ? 'posts/misc' : `posts/${params.id}`}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="status">상태</label>
                        <select id="status" name="status" value={form.status} onChange={handleChange}
                                className={styles.select}>
                            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>
                </div>

                {categories.length > 0 && (
                    <div className={styles.formGroup}>
                        <label className={styles.label}>카테고리 (1개)</label>
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

                {!isNew && <OrphanImages folder={`posts/${params.id}`} referencedUrls={postReferencedUrls}/>}

                {message && (
                    <div
                        className={`${styles.alert} ${message.type === 'error' ? styles.alertError : styles.alertSuccess}`}>
                        {message.text}
                    </div>
                )}
                <div className={styles.formActions}>
                    <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}
                            disabled={saving || pasteLoading}>
                        {saving ? '저장 중...' : '저장'}
                    </button>
                    {!isNew && (
                        <Link href={`/blog/${params.id}`} target="_blank"
                              className={`${styles.btn} ${styles.btnSecondary}`}>
                            미리보기
                        </Link>
                    )}
                </div>
            </form>
        </>
    );
}
