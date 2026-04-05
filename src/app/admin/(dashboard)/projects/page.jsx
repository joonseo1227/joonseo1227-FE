'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {Launch, TrashCan} from '@carbon/icons-react';
import supabase from '@/lib/supabase';
import styles from '@/styles/pages/AdminPage.module.css';

export default function AdminProjectsPage() {
    const router = useRouter();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        supabase
            .from('project')
            .select('id, slug, title, category, start_date, end_date, sort_order')
            .order('sort_order', {ascending: true, nullsFirst: false})
            .then(({data}) => {
                setProjects(data || []);
                setLoading(false);
            });
    }, []);

    const handleDelete = async (id, title) => {
        if (!confirm(`"${title}" 프로젝트를 삭제하시겠습니까?`)) return;
        setDeleting(id);
        try {
            const res = await fetch(`/api/admin/projects/${id}`, {method: 'DELETE'});
            if (!res.ok) throw new Error((await res.json()).error);
            setProjects(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            alert(`삭제 실패: ${err.message}`);
        } finally {
            setDeleting(null);
        }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short'
    }) : 'Present';

    return (
        <>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>프로젝트</h1>
                <Link href="/admin/projects/new" className={`${styles.btn} ${styles.btnPrimary}`}>
                    새 프로젝트
                </Link>
            </div>

            {loading ? (
                <div className={styles.loading}>로딩 중...</div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>순서</th>
                            <th>제목</th>
                            <th>슬러그</th>
                            <th>카테고리</th>
                            <th>기간</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {projects.length === 0 ? (
                            <tr>
                                <td colSpan={6}>
                                    <div className={styles.emptyState}>프로젝트가 없습니다.</div>
                                </td>
                            </tr>
                        ) : projects.map((project) => (
                            <tr key={project.id}
                                className={styles.trClickable}
                                onClick={() => router.push(`/admin/projects/${project.id}`)}>
                                <td className={styles.tdMuted} data-label="순서">{project.sort_order ?? '-'}</td>
                                <td className={styles.tdTitle} data-label="제목">
                                    <Link href={`/admin/projects/${project.id}`}
                                          className={styles.tdTitleLink}
                                          onClick={e => e.stopPropagation()}>{project.title}</Link>
                                </td>
                                <td className={`${styles.tdMuted} ${styles.tdTruncate}`} data-label="슬러그"><span
                                    className={styles.tdTruncateValue}>{project.slug}</span></td>
                                <td className={styles.tdMuted} data-label="카테고리">{project.category || '-'}</td>
                                <td className={styles.tdMuted}
                                    data-label="기간">{formatDate(project.start_date)} ~ {formatDate(project.end_date)}</td>
                                <td>
                                    <div className={styles.tableActions}>
                                        <Link href={`/portfolio/${project.id}`}
                                              className={styles.btnIcon}
                                              target="_blank"
                                              onClick={e => e.stopPropagation()}>
                                            <Launch size={16}/>
                                        </Link>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(project.id, project.title);
                                            }}
                                            className={`${styles.btnIcon} ${styles.btnIconDanger}`}
                                            disabled={deleting === project.id}
                                        >
                                            <TrashCan size={16}/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
