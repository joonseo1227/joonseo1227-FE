'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {Launch, TrashCan} from '@carbon/icons-react';
import supabase from '@/lib/supabase';
import styles from '@/styles/pages/AdminPage.module.css';

const statusLabels = {
    published: {label: '게시됨', className: styles.badgePublished},
    unlisted: {label: '일부공개', className: styles.badgeUnlisted},
    private: {label: '비공개', className: styles.badgeDraft},
};

export default function AdminPostsPage() {
    const router = useRouter();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        supabase
            .from('posts')
            .select('id, title, status, created_at, post_categories(categories(name))')
            .order('created_at', {ascending: false})
            .then(({data}) => {
                setPosts(data || []);
                setLoading(false);
            });
    }, []);

    const handleDelete = async (id, title) => {
        if (!confirm(`"${title}" 포스트를 삭제하시겠습니까?`)) return;
        setDeleting(id);
        try {
            const res = await fetch(`/api/admin/posts/${id}`, {method: 'DELETE'});
            if (!res.ok) throw new Error((await res.json()).error);
            setPosts(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            alert(`삭제 실패: ${err.message}`);
        } finally {
            setDeleting(null);
        }
    };

    const getCategoryName = (post) => {
        const cats = post.post_categories;
        if (!cats) return '-';
        // post_id has UNIQUE constraint → PostgREST returns single object, not array
        const cat = Array.isArray(cats) ? cats[0] : cats;
        return cat?.categories?.name || '-';
    };

    return (
        <>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>포스트</h1>
                <Link href="/admin/posts/new" className={`${styles.btn} ${styles.btnPrimary}`}>
                    새 포스트
                </Link>
            </div>

            {loading ? (
                <div className={styles.loading}>로딩 중...</div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>제목</th>
                            <th>카테고리</th>
                            <th>상태</th>
                            <th>작성일</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {posts.length === 0 ? (
                            <tr>
                                <td colSpan={5}>
                                    <div className={styles.emptyState}>포스트가 없습니다.</div>
                                </td>
                            </tr>
                        ) : posts.map((post) => {
                            const statusInfo = statusLabels[post.status] || statusLabels.private;
                            return (
                                <tr key={post.id}
                                    className={styles.trClickable}
                                    onClick={() => router.push(`/admin/posts/${post.id}`)}>
                                    <td className={styles.tdTitle} data-label="제목">
                                        <Link href={`/admin/posts/${post.id}`}
                                              className={styles.tdTitleLink}
                                              onClick={e => e.stopPropagation()}>{post.title}</Link>
                                    </td>
                                    <td className={styles.tdMuted} data-label="카테고리">{getCategoryName(post)}</td>
                                    <td data-label="상태">
                                            <span className={`${styles.badge} ${statusInfo.className}`}>
                                                {statusInfo.label}
                                            </span>
                                    </td>
                                    <td className={styles.tdMuted} data-label="작성일">
                                        {new Date(post.created_at).toLocaleDateString('ko-KR')}
                                    </td>
                                    <td>
                                        <div className={styles.tableActions}>
                                            <Link href={`/blog/${post.id}`}
                                                  className={styles.btnIcon}
                                                  target="_blank"
                                                  onClick={e => e.stopPropagation()}>
                                                <Launch size={16}/>
                                            </Link>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(post.id, post.title);
                                                }}
                                                className={`${styles.btnIcon} ${styles.btnIconDanger}`}
                                                disabled={deleting === post.id}
                                            >
                                                <TrashCan size={16}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
