'use client';

import React, {useEffect, useMemo, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import Link from 'next/link';
import supabase from '@/lib/supabase';
import ThumbnailUpload from '@/components/ThumbnailUpload';
import OrphanImages from '@/components/OrphanImages';
import styles from '@/styles/pages/AdminPage.module.css';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

const defaultForm = {
    slug: '',
    title: '',
    summary: '',
    thumbnail_url: '',
    category: '',
    role: '',
    start_date: '',
    end_date: '',
    sort_order: '',
};

const defaultJsonFields = {
    content_sections: '[]',
    gallery: '[]',
    links: '[]',
};

export default function AdminProjectEditorPage() {
    const params = useParams();
    const router = useRouter();
    const isNew = params.id === 'new';

    const [form, setForm] = useState(defaultForm);
    const [keyFeatures, setKeyFeatures] = useState(''); // one per line → text[]
    const [jsonFields, setJsonFields] = useState(defaultJsonFields);
    const [allTechnologies, setAllTechnologies] = useState([]);
    const [selectedTechIds, setSelectedTechIds] = useState([]);
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    // Fetch all available technologies
    useEffect(() => {
        supabase.from('technologies').select('id, name, category').order('category').order('name')
            .then(({data}) => setAllTechnologies(data || []));
    }, []);

    useEffect(() => {
        if (isNew) return;
        const fetchProject = async () => {
            try {
                const {data, error} = await supabase
                    .from('project')
                    .select('*, project_technologies(tech_id)')
                    .eq('id', params.id)
                    .single();
                if (error) throw error;

                setForm({
                    slug: data.slug || '',
                    title: data.title || '',
                    summary: data.summary || '',
                    thumbnail_url: data.thumbnail_url || '',
                    category: data.category || '',
                    role: data.role || '',
                    start_date: data.start_date || '',
                    end_date: data.end_date || '',
                    sort_order: data.sort_order ?? '',
                });

                // key_features is text[] — display one per line
                const kf = data.key_features;
                setKeyFeatures(Array.isArray(kf) ? kf.join('\n') : '');

                setJsonFields({
                    content_sections: JSON.stringify(data.content_sections || [], null, 2),
                    gallery: JSON.stringify(data.gallery || [], null, 2),
                    links: JSON.stringify(data.links || [], null, 2),
                });

                const techs = data.project_technologies;
                setSelectedTechIds(Array.isArray(techs) ? techs.map(t => t.tech_id) : []);
            } catch (err) {
                setMessage({type: 'error', text: '프로젝트를 불러올 수 없습니다.'});
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [params.id, isNew]);

    const handleChange = (e) => setForm(prev => ({...prev, [e.target.name]: e.target.value}));

    const toggleTech = (techId) => {
        setSelectedTechIds(prev =>
            prev.includes(techId) ? prev.filter(id => id !== techId) : [...prev, techId]
        );
    };

    const parseJson = (str, field) => {
        try {
            return JSON.parse(str);
        } catch {
            throw new Error(`${field} JSON 형식 오류`);
        }
    };

    const purgeMiscFolder = async () => {
        try {
            const res = await fetch('/api/admin/orphan-images?folder=projects%2Fmisc');
            if (!res.ok) return;
            const {files} = await res.json();
            await Promise.all(files.map(f =>
                fetch('/api/admin/storage-image', {
                    method: 'DELETE',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({path: `projects/misc/${f.name}`}),
                })
            ));
        } catch { /* best-effort */
        }
    };

    const migrateMiscImages = async (slug, thumbnail_url) => {
        const miscPrefix = `${SUPABASE_URL}/storage/v1/object/public/images/projects/misc/`;
        if (!thumbnail_url?.startsWith(miscPrefix)) return null;

        const res = await fetch('/api/admin/move-images', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({urls: [thumbnail_url], targetFolder: `projects/${slug}`}),
        });
        if (!res.ok) return null;
        const {urlMap} = await res.json();
        return urlMap[thumbnail_url] || null;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            const content_sections = parseJson(jsonFields.content_sections, 'content_sections');
            const gallery = parseJson(jsonFields.gallery, 'gallery');
            const links = parseJson(jsonFields.links, 'links');

            // key_features: split by newline, filter empty → text[]
            const key_features = keyFeatures.split('\n').map(s => s.trim()).filter(Boolean);

            const project = {
                ...form,
                sort_order: form.sort_order !== '' ? parseInt(form.sort_order, 10) : null,
                end_date: form.end_date || null,
                key_features,
                content_sections,
                gallery,
                links,
            };

            const body = {project, techIds: selectedTechIds};
            let res;
            if (isNew) {
                res = await fetch('/api/admin/projects', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(body)
                });
            } else {
                res = await fetch(`/api/admin/projects/${params.id}`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(body)
                });
            }
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            // Move misc thumbnail to the slug folder for new projects
            if (isNew && data.id) {
                const newThumbnail = await migrateMiscImages(form.slug, form.thumbnail_url);
                if (newThumbnail) {
                    await fetch(`/api/admin/projects/${data.id}`, {
                        method: 'PUT',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            project: {...project, thumbnail_url: newThumbnail},
                            techIds: selectedTechIds
                        }),
                    });
                    setForm(prev => ({...prev, thumbnail_url: newThumbnail}));
                }
                // Clean up any leftover misc files
                await purgeMiscFolder();
            }

            setMessage({type: 'success', text: '저장되었습니다.'});
            if (isNew) router.replace(`/admin/projects/${data.id}`);
        } catch (err) {
            setMessage({type: 'error', text: err.message || '저장 실패'});
        } finally {
            setSaving(false);
        }
    };

    const projectReferencedUrls = useMemo(() => {
        const urls = new Set();
        if (form.thumbnail_url) urls.add(form.thumbnail_url);
        try {
            JSON.parse(jsonFields.gallery).forEach(g => g.url && urls.add(g.url));
        } catch {
        }
        try {
            JSON.parse(jsonFields.content_sections).forEach(s => s.url && urls.add(s.url));
        } catch {
        }
        return [...urls];
    }, [form.thumbnail_url, jsonFields.gallery, jsonFields.content_sections]);

    if (loading) return <div className={styles.loading}>로딩 중...</div>;

    // Group technologies by category for display
    const techByCategory = allTechnologies.reduce((acc, t) => {
        const cat = t.category || '기타';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(t);
        return acc;
    }, {});

    return (
        <>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>{isNew ? '새 프로젝트' : '프로젝트 수정'}</h1>
                <Link href="/admin/projects" className={`${styles.btn} ${styles.btnSecondary}`}>목록으로</Link>
            </div>

            <form onSubmit={handleSave} className={styles.form}>
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="title">제목</label>
                        <input id="title" name="title" type="text" value={form.title} onChange={handleChange}
                               className={styles.input} placeholder="프로젝트 제목" required/>
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="slug">슬러그 (URL)</label>
                        <input id="slug" name="slug" type="text" value={form.slug} onChange={handleChange}
                               className={styles.input} placeholder="my-project" required/>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="summary">요약</label>
                    <textarea id="summary" name="summary" value={form.summary} onChange={handleChange}
                              className={styles.textarea} placeholder="프로젝트 요약" rows={3}/>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>썸네일</label>
                    <ThumbnailUpload
                        value={form.thumbnail_url}
                        onChange={(url) => setForm(prev => ({...prev, thumbnail_url: url}))}
                        folder={!form.slug ? 'projects/misc' : `projects/${form.slug}`}
                    />
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="category">카테고리</label>
                        <input id="category" name="category" type="text" value={form.category} onChange={handleChange}
                               className={styles.input} placeholder="App, Web, Design..."/>
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="role">역할</label>
                        <input id="role" name="role" type="text" value={form.role} onChange={handleChange}
                               className={styles.input} placeholder="Full-stack Developer"/>
                    </div>
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="start_date">시작일</label>
                        <input id="start_date" name="start_date" type="date" value={form.start_date}
                               onChange={handleChange} className={styles.input}/>
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="end_date">종료일 (미입력 시 Present)</label>
                        <input id="end_date" name="end_date" type="date" value={form.end_date}
                               onChange={handleChange} className={styles.input}/>
                    </div>
                </div>

                <div className={styles.formGroup} style={{maxWidth: 200}}>
                    <label className={styles.label} htmlFor="sort_order">정렬 순서</label>
                    <input id="sort_order" name="sort_order" type="number" value={form.sort_order}
                           onChange={handleChange} className={styles.input} placeholder="1"/>
                </div>

                {/* Technologies */}
                {allTechnologies.length > 0 && (
                    <div className={styles.formGroup}>
                        <label className={styles.label}>기술 스택</label>
                        {Object.entries(techByCategory).map(([cat, techs]) => (
                            <div key={cat} style={{marginBottom: 10}}>
                                <div style={{
                                    fontSize: 11,
                                    color: 'var(--color-gray-60)',
                                    marginBottom: 6,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.3px'
                                }}>{cat}</div>
                                <div className={styles.checkboxGroup}>
                                    {techs.map(t => (
                                        <button key={t.id} type="button" onClick={() => toggleTech(t.id)}
                                                className={`${styles.checkboxChip} ${selectedTechIds.includes(t.id) ? styles.checkboxChipActive : ''}`}>
                                            {t.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className={styles.divider}/>

                <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="key_features">주요 기능 (한 줄에 하나)</label>
                    <textarea id="key_features" value={keyFeatures}
                              onChange={(e) => setKeyFeatures(e.target.value)}
                              className={`${styles.textarea} ${styles.textareaCode}`}
                              placeholder={"사용자 인증 및 권한 관리\n실시간 알림 기능\n반응형 UI"}
                              rows={5}/>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="content_sections">콘텐츠 섹션 (JSON)</label>
                    <p className={styles.formHint}>{'[{"type":"text"|"quote"|"image","title":"","content":"","url":"","caption":""}]'}</p>
                    <textarea id="content_sections" value={jsonFields.content_sections}
                              onChange={(e) => setJsonFields(prev => ({...prev, content_sections: e.target.value}))}
                              className={`${styles.textarea} ${styles.textareaMd} ${styles.textareaCode}`}/>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="gallery">갤러리 (JSON)</label>
                    <p className={styles.formHint}>{'[{"url":"https://..."}]'}</p>
                    <textarea id="gallery" value={jsonFields.gallery}
                              onChange={(e) => setJsonFields(prev => ({...prev, gallery: e.target.value}))}
                              className={`${styles.textarea} ${styles.textareaCode}`} rows={5}/>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="links">링크 (JSON)</label>
                    <p className={styles.formHint}>{'[{"title":"GitHub","url":"https://github.com/..."}]'}</p>
                    <textarea id="links" value={jsonFields.links}
                              onChange={(e) => setJsonFields(prev => ({...prev, links: e.target.value}))}
                              className={`${styles.textarea} ${styles.textareaCode}`} rows={5}/>
                </div>

                {!isNew && form.slug && (
                    <OrphanImages folder={`projects/${form.slug}`} referencedUrls={projectReferencedUrls}/>
                )}

                {message && (
                    <div
                        className={`${styles.alert} ${message.type === 'error' ? styles.alertError : styles.alertSuccess}`}>
                        {message.text}
                    </div>
                )}
                <div className={styles.formActions}>
                    <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={saving}>
                        {saving ? '저장 중...' : '저장'}
                    </button>
                    {!isNew && (
                        <Link href={`/portfolio/${form.slug}`} target="_blank"
                              className={`${styles.btn} ${styles.btnSecondary}`}>
                            미리보기
                        </Link>
                    )}
                </div>
            </form>
        </>
    );
}
