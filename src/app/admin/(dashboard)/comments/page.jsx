'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';
import {TrashCan} from '@carbon/icons-react';
import supabase from '@/lib/supabase';
import styles from '@/styles/pages/AdminPage.module.css';

export default function AdminCommentsPage() {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        supabase
            .from('comments')
            .select('*, posts(title)')
            .order('created_at', {ascending: false})
            .then(({data}) => {
                setComments(data || []);
                setLoading(false);
            });
    }, []);

    const handleDelete = async (id) => {
        if (!confirm('이 댓글을 삭제하시겠습니까?')) return;
        setDeleting(id);
        try {
            const res = await fetch(`/api/admin/comments/${id}`, {method: 'DELETE'});
            if (!res.ok) throw new Error((await res.json()).error);
            setComments(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            alert(`삭제 실패: ${err.message}`);
        } finally {
            setDeleting(null);
        }
    };

    return (
        <>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>댓글</h1>
            </div>

            {loading ? (
                <div className={styles.loading}>로딩 중...</div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>닉네임</th>
                            <th>내용</th>
                            <th>포스트</th>
                            <th>작성일</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {comments.length === 0 ? (
                            <tr>
                                <td colSpan={5}>
                                    <div className={styles.emptyState}>댓글이 없습니다.</div>
                                </td>
                            </tr>
                        ) : comments.map((comment) => (
                            <tr key={comment.id}>
                                <td className={styles.tdStrong} data-label="닉네임">{comment.nickname}</td>
                                <td data-label="내용">
                                    <div className={styles.commentContent}>{comment.content}</div>
                                </td>
                                <td className={styles.tdMuted} data-label="포스트">
                                    <Link href={`/admin/posts/${comment.post_id}`} className={styles.tdTitleLink}>
                                        {comment.posts?.title || `Post #${comment.post_id}`}
                                    </Link>
                                </td>
                                <td className={styles.tdMuted} data-label="작성일">
                                    {new Date(comment.created_at).toLocaleDateString('ko-KR')}
                                </td>
                                <td>
                                    <div className={styles.tableActions}>
                                        <button onClick={() => handleDelete(comment.id)}
                                                className={`${styles.btnIcon} ${styles.btnIconDanger}`}
                                                disabled={deleting === comment.id}>
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
