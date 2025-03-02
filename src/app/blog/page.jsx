"use client";

import {useEffect, useState} from "react";
import supabase from "/src/lib/supabase.js";
import styles from '@/styles/pages/BlogPage.module.css';
import Link from "next/link";

export default function BlogPage() {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 카테고리 목록 가져오기
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const {data, error} = await supabase
                    .from('categories')
                    .select('*')
                    .order('name');

                if (error) throw error;
                setCategories(data || []);
            } catch (err) {
                console.error('카테고리를 불러오는데 실패했습니다:', err);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                let query = supabase
                    .from('posts')
                    .select(`
                    *,
                    post_categories (
                        categories (
                            id,
                            name
                        )
                    )
                `)
                    .order('created_at', {ascending: false});

                if (selectedCategory) {
                    // 선택된 카테고리의 포스트만 필터링
                    const {data: postIds} = await supabase
                        .from('post_categories')
                        .select('post_id')
                        .eq('category_id', selectedCategory);

                    if (postIds) {
                        query = query.in('id', postIds.map(item => item.post_id));
                    }
                }

                const {data, error} = await query;

                if (error) throw error;
                setPosts(data || []);
            } catch (err) {
                setError('포스트를 불러오는데 실패했습니다.');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [selectedCategory]);

    // 카테고리 변경 핸들러
    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId);
    };

    return (
        <div className={styles.blogPage}>
            <h1 className="titleText">Blog</h1>

            {/* 카테고리 필터 */}
            <div className={styles.categoryFilter}>
                <button
                    className={`${styles.categoryBtn} ${selectedCategory === null ? styles.active : ''}`}
                    onClick={() => handleCategoryChange(null)}
                >
                    전체보기
                </button>
                {categories.map((category) => (
                    <button
                        key={category.id}
                        className={`${styles.categoryBtn} ${selectedCategory === category.id ? styles.active : ''}`}
                        onClick={() => handleCategoryChange(category.id)}
                    >
                        {category.name}
                    </button>
                ))}
            </div>

            {loading ? (
                <p>로딩 중...</p>
            ) : error ? (
                <p className={styles.errorMessage}>{error}</p>
            ) : posts.length === 0 ? (
                <p className={styles.noPosts}>게시물이 없습니다.</p>
            ) : (
                <div className={styles.postList}>
                    {posts.map((post) => (
                        <Link key={post.id} className={styles.postLink} href={`/blog/${post.id}`}>
                            <article className={styles.postTile}>
                                {post.thumbnail_url && (
                                    <img
                                        className={styles.postThumbnail}
                                        src={post.thumbnail_url}
                                        alt={post.title}
                                    />
                                )}
                                <div className={styles.postInfo}>
                                    <h2>{post.title}</h2>
                                    <p>{post.summary}</p>
                                    <p className="post-date">
                                        {new Date(post.created_at).toLocaleDateString('ko-KR')}
                                    </p>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
