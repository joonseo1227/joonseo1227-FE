"use client";

import {use, useEffect, useState} from "react";
import supabase from "/src/lib/supabase.js";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import styles from '@/styles/pages/BlogPostPage.module.css';

export default function BlogPostPage({params}) {
    const unwrappedParams = use(params);
    const postId = unwrappedParams?.id;

    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const {data, error} = await supabase
                    .from('posts')
                    .select(`
                        *,
                        post_categories (
                            categories (
                                name
                            )
                        )
                    `)
                    .eq('id', postId)
                    .single();

                if (error) {
                    console.error('Supabase 에러:', error);
                    setError(error.message);
                    return;
                }

                setPost(data);
            } catch (err) {
                console.error('예외 발생:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPost();
    }, [postId]);

    if (isLoading) {
        return (
            <div className={styles.container}>
                <p>로딩 중...</p>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className={styles.container}>
                <h1 className={styles.titleText}>존재하지 않는 포스트입니다.</h1>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div
                className={styles.postHeader}
                style={{
                    backgroundImage: post.thumbnail_url ? `url(${post.thumbnail_url})` : 'none'
                }}
            >
                <h1 className={styles.titleText}>{post.title}</h1>
                <p className={styles.postDate}>
                    {new Date(post.created_at).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </p>
            </div>

            <div className={styles.postContent}>
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                >
                    {post.content || "내용이 없습니다."}
                </ReactMarkdown>
            </div>
        </div>
    );
}