"use client";

import {useEffect, useRef, useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import supabase from "@/lib/supabase";
import styles from '@/styles/pages/BlogPage.module.css';
import Link from "next/link";
import SkeletonLoader from '@/components/SkeletonLoader';
import EmptyState from '@/components/EmptyState';

export default function BlogPage() {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const imgRefs = useRef({});

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
                console.error('카테고리 로딩 실패:', err);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // Only set loading to true on initial load, not when changing categories
                if (posts.length === 0) {
                    setLoading(true);
                }
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
                    .eq('status', 'published')
                    .order('created_at', {ascending: false});

                if (selectedCategory) {
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
                console.error('블로그 포스트 로딩 실패:', err);
                setError('게시물을 불러올 수 없습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [selectedCategory]);

    // Update isInitialLoad after tiles have rendered
    useEffect(() => {
        if (!loading && posts.length > 0 && isInitialLoad) {
            // Use RAF to ensure DOM has updated
            requestAnimationFrame(() => {
                setIsInitialLoad(false);
            });
        }
    }, [loading, posts, isInitialLoad]);


    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId);
    };

    return (
        <div className={styles.blogPage}>
            <h1 className="titleText">Blog</h1>

            <SkeletonLoader isLoading={loading} page="blogPage">
                {!loading && (
                    <div className={styles.categoryFilter}>
                        <button
                            className={`${styles.categoryBtn} ${selectedCategory === null ? styles.active : ''}`}
                            onClick={() => handleCategoryChange(null)}
                        >
                            전체
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
                )}

                {error ? (
                    <EmptyState type="error" message={error}/>
                ) : posts.length === 0 && !loading ? (
                    <EmptyState type="empty" message="게시물이 없습니다."/>
                ) : (
                    <div className={styles.postList}>
                        <AnimatePresence mode="popLayout" initial={false}>
                            {posts.map((post) => {
                                const handlePostClick = (e) => {
                                    e.preventDefault();

                                    const imgElement = imgRefs.current[post.id];
                                    if (post.thumbnail_url && imgElement && window.startBlogTransition) {
                                        const rect = imgElement.getBoundingClientRect();
                                        window.startBlogTransition(
                                            post.id,
                                            post.thumbnail_url,
                                            {
                                                top: rect.top,
                                                left: rect.left,
                                                width: rect.width,
                                                height: rect.height
                                            },
                                            {sourceElement: imgElement}
                                        );
                                    } else {
                                        window.location.href = `/blog/${post.id}`;
                                    }
                                };

                                const tileVariants = {
                                    hidden: {scale: 0.8, opacity: 0},
                                    visible: {scale: 1, opacity: 1}
                                };

                                return (
                                    <motion.div
                                        key={post.id}
                                        layout
                                        variants={tileVariants}
                                        initial={isInitialLoad ? false : "hidden"}
                                        animate={isInitialLoad ? false : "visible"}
                                        exit="hidden"
                                        transition={{duration: 0.3}}
                                    >
                                        <Link
                                            className={styles.postLink}
                                            href={`/blog/${post.id}`}
                                            onClick={handlePostClick}
                                        >
                                            <article className={styles.postTile}>
                                                {post.thumbnail_url && (
                                                    <img
                                                        ref={el => imgRefs.current[post.id] = el}
                                                        className={styles.postThumbnail}
                                                        src={post.thumbnail_url}
                                                        alt={post.title}
                                                    />
                                                )}
                                                <div className={styles.tileDescription}>
                                                    <div className={styles.tileHead}>
                                                        <h2 className={styles.postTitle}>{post.title}</h2>
                                                        <p className={styles.postSummary}>{post.summary}</p>
                                                    </div>
                                                    <p className={styles.postDate}>
                                                        {new Date(post.created_at).toLocaleDateString('ko-KR')}
                                                    </p>
                                                </div>
                                            </article>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </SkeletonLoader>
        </div>
    );
}
