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

export default function AdminDashboardPage() {
    const router = useRouter();
    const [recentPosts, setRecentPosts] = useState([]);
    const [recentComments, setRecentComments] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deletingPost, setDeletingPost] = useState(null);
    const [deletingComment, setDeletingComment] = useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [
                    recentPostsResult,
                    recentCommentsResult,
                    allPostsResult,
                    commentsCountResult,
                    projectsResult,
                    techSkillsResult,
                ] = await Promise.all([
                    supabase
                        .from('posts')
                        .select('id, title, status, created_at, post_categories(categories(name))')
                        .order('created_at', {ascending: false})
                        .limit(5),
                    supabase
                        .from('comments')
                        .select('*, posts(title)')
                        .order('created_at', {ascending: false})
                        .limit(5),
                    supabase
                        .from('posts')
                        .select('id, status'),
                    supabase
                        .from('comments')
                        .select('id', {count: 'exact', head: true}),
                    supabase
                        .from('project')
                        .select('id, category'),
                    supabase
                        .from('tech_skills')
                        .select('id', {count: 'exact', head: true}),
                ]);

                setRecentPosts(recentPostsResult.data || []);
                setRecentComments(recentCommentsResult.data || []);

                const allPosts = allPostsResult.data || [];
                const publishedCount = allPosts.filter(p => p.status === 'published').length;
                const unlistedCount = allPosts.filter(p => p.status === 'unlisted').length;
                const privateCount = allPosts.filter(p => p.status === 'private').length;

                const allProjects = projectsResult.data || [];
                const projectByCategory = allProjects.reduce((acc, p) => {
                    const cat = p.category || '기타';
                    acc[cat] = (acc[cat] || 0) + 1;
                    return acc;
                }, {});

                setStats({
                    totalPosts: allPosts.length,
                    publishedPosts: publishedCount,
                    unlistedPosts: unlistedCount,
                    privatePosts: privateCount,
                    totalComments: commentsCountResult.count || 0,
                    totalProjects: allProjects.length,
                    totalSkills: techSkillsResult.count || 0,
                    projectByCategory,
                });
            } catch (err) {
                console.error('대시보드 로딩 실패:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

    const handleDeletePost = async (id, title) => {
        if (!confirm(`"${title}" 포스트를 삭제하시겠습니까?`)) return;
        setDeletingPost(id);
        try {
            const res = await fetch(`/api/admin/posts/${id}`, {method: 'DELETE'});
            if (!res.ok) throw new Error((await res.json()).error);
            setRecentPosts(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            alert(`삭제 실패: ${err.message}`);
        } finally {
            setDeletingPost(null);
        }
    };

    const handleDeleteComment = async (id) => {
        if (!confirm('이 댓글을 삭제하시겠습니까?')) return;
        setDeletingComment(id);
        try {
            const res = await fetch(`/api/admin/comments/${id}`, {method: 'DELETE'});
            if (!res.ok) throw new Error((await res.json()).error);
            setRecentComments(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            alert(`삭제 실패: ${err.message}`);
        } finally {
            setDeletingComment(null);
        }
    };

    const getCategoryName = (post) => {
        const cats = post.post_categories;
        if (!cats) return '-';
        const cat = Array.isArray(cats) ? cats[0] : cats;
        return cat?.categories?.name || '-';
    };

    return (
        <>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>대시보드</h1>
                <div className={styles.pageHeaderActions}>
                    <Link href="/admin/posts/new" className={`${styles.btn} ${styles.btnPrimary}`}>
                        새 포스트
                    </Link>
                    <Link href="/admin/projects/new" className={`${styles.btn} ${styles.btnSecondary}`}>
                        새 프로젝트
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className={styles.loading}>로딩 중...</div>
            ) : (
                <>
                    {/* ── 통계 카드 ── */}
                    <div className={styles.statsGrid}>
                        <Link href="/admin/posts" className={styles.statCard}>
                            <div className={styles.statLabel}>총 포스트</div>
                            <div className={styles.statValue}>{stats?.totalPosts ?? 0}</div>
                            <div className={styles.statSub}>
                                <span className={styles.statSubItem} style={{color: '#42be65'}}>
                                    게시됨 {stats?.publishedPosts ?? 0}
                                </span>
                                {stats?.unlistedPosts > 0 && (
                                    <span className={styles.statSubItem} style={{color: 'var(--color-red-50)'}}>
                                        일부공개 {stats.unlistedPosts}
                                    </span>
                                )}
                                {stats?.privatePosts > 0 && (
                                    <span className={styles.statSubItem} style={{color: 'var(--color-gray-50)'}}>
                                        비공개 {stats.privatePosts}
                                    </span>
                                )}
                            </div>
                        </Link>

                        <Link href="/admin/comments" className={styles.statCard}>
                            <div className={styles.statLabel}>총 댓글</div>
                            <div className={styles.statValue}>{stats?.totalComments ?? 0}</div>
                            <div className={styles.statSub}>
                                <span className={styles.statSubItem} style={{color: 'var(--color-gray-60)'}}>
                                    {recentComments.length > 0 ? `최근 ${recentComments.length}개` : '댓글 없음'}
                                </span>
                            </div>
                        </Link>

                        <Link href="/admin/projects" className={styles.statCard}>
                            <div className={styles.statLabel}>총 프로젝트</div>
                            <div className={styles.statValue}>{stats?.totalProjects ?? 0}</div>
                            <div className={styles.statSub}>
                                {stats?.projectByCategory &&
                                    Object.entries(stats.projectByCategory).map(([cat, cnt]) => (
                                        <span key={cat} className={styles.statSubItem}
                                              style={{color: 'var(--color-gray-50)'}}>
                                            {cat} {cnt}
                                        </span>
                                    ))}
                            </div>
                        </Link>

                        <div className={`${styles.statCard} ${styles.statCardStatic}`}>
                            <div className={styles.statLabel}>기술 스택</div>
                            <div className={styles.statValue}>{stats?.totalSkills ?? 0}</div>
                            <div className={styles.statSub}>
                                <span className={styles.statSubItem} style={{color: 'var(--color-gray-60)'}}>
                                    등록된 스킬
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── 포스트 상태 분포 바 ── */}
                    {stats && stats.totalPosts > 0 && (
                        <div className={styles.sectionGroup}>
                            <div className={styles.dashboardSectionHeader}>
                                <div className={styles.sectionGroupTitle}>포스트 상태</div>
                            </div>
                            <div className={styles.statusBarWrapper}>
                                <div className={styles.statusBar}>
                                    {stats.publishedPosts > 0 && (
                                        <div
                                            className={styles.statusBarSegmentPublished}
                                            style={{flex: stats.publishedPosts}}
                                            title={`게시됨 ${stats.publishedPosts}개`}
                                        />
                                    )}
                                    {stats.unlistedPosts > 0 && (
                                        <div
                                            className={styles.statusBarSegmentUnlisted}
                                            style={{flex: stats.unlistedPosts}}
                                            title={`일부공개 ${stats.unlistedPosts}개`}
                                        />
                                    )}
                                    {stats.privatePosts > 0 && (
                                        <div
                                            className={styles.statusBarSegmentPrivate}
                                            style={{flex: stats.privatePosts}}
                                            title={`비공개 ${stats.privatePosts}개`}
                                        />
                                    )}
                                </div>
                                <div className={styles.statusBarLegend}>
                                    <span className={styles.legendItem}>
                                        <span className={styles.legendDotPublished}/>
                                        게시됨 {stats.publishedPosts}
                                    </span>
                                    {stats.unlistedPosts > 0 && (
                                        <span className={styles.legendItem}>
                                            <span className={styles.legendDotUnlisted}/>
                                            일부공개 {stats.unlistedPosts}
                                        </span>
                                    )}
                                    {stats.privatePosts > 0 && (
                                        <span className={styles.legendItem}>
                                            <span className={styles.legendDotPrivate}/>
                                            비공개 {stats.privatePosts}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── 최근 포스트 ── */}
                    <div className={styles.sectionGroup}>
                        <div className={styles.dashboardSectionHeader}>
                            <div className={styles.sectionGroupTitle}>최근 포스트</div>
                            <Link href="/admin/posts" className={styles.sectionMoreLink}>전체 보기</Link>
                        </div>
                        <div className={styles.tableWrapper}>
                            {recentPosts.length === 0 ? (
                                <div className={styles.emptyState}>포스트가 없습니다.</div>
                            ) : (
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
                                    {recentPosts.map((post) => {
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
                                                <td className={styles.tdMuted}
                                                    data-label="카테고리">{getCategoryName(post)}</td>
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
                                                                handleDeletePost(post.id, post.title);
                                                            }}
                                                            className={`${styles.btnIcon} ${styles.btnIconDanger}`}
                                                            disabled={deletingPost === post.id}
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
                            )}
                        </div>
                    </div>

                    {/* ── 최근 댓글 ── */}
                    <div className={styles.sectionGroup}>
                        <div className={styles.dashboardSectionHeader}>
                            <div className={styles.sectionGroupTitle}>최근 댓글</div>
                            <Link href="/admin/comments" className={styles.sectionMoreLink}>전체 보기</Link>
                        </div>
                        <div className={styles.tableWrapper}>
                            {recentComments.length === 0 ? (
                                <div className={styles.emptyState}>댓글이 없습니다.</div>
                            ) : (
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
                                    {recentComments.map((comment) => (
                                        <tr key={comment.id}>
                                            <td className={styles.tdStrong} data-label="닉네임">{comment.nickname}</td>
                                            <td data-label="내용">
                                                <div className={styles.commentContent}>{comment.content}</div>
                                            </td>
                                            <td className={styles.tdMuted} data-label="포스트">
                                                <Link href={`/admin/posts/${comment.post_id}`}
                                                      className={styles.tdTitleLink}>
                                                    {comment.posts?.title || `Post #${comment.post_id}`}
                                                </Link>
                                            </td>
                                            <td className={styles.tdMuted} data-label="작성일">
                                                {new Date(comment.created_at).toLocaleDateString('ko-KR')}
                                            </td>
                                            <td>
                                                <div className={styles.tableActions}>
                                                    <button
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        className={`${styles.btnIcon} ${styles.btnIconDanger}`}
                                                        disabled={deletingComment === comment.id}
                                                    >
                                                        <TrashCan size={16}/>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
