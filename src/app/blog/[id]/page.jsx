"use client";

import {use, useEffect, useRef, useState} from "react";
import supabase from "/src/lib/supabase.js";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import styles from '@/styles/pages/BlogPostPage.module.css';
import TableOfContents from '@/components/TableOfContents';
import SkeletonLoader from '@/components/SkeletonLoader';
import PostNavigation from '@/components/PostNavigation';

export default function BlogPostPage({params}) {
    const unwrappedParams = use(params);
    const postId = unwrappedParams?.id;

    const [post, setPost] = useState(null);
    const [prevPost, setPrevPost] = useState(null);
    const [nextPost, setNextPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Create refs for heading counters
    const headingCounterRef = useRef(0);

    // Reset heading counter when post changes
    useEffect(() => {
        if (post) {
            headingCounterRef.current = 0;
        }
    }, [post]);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                // Fetch the current post
                const {data: currentPost, error: currentPostError} = await supabase
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

                if (currentPostError) {
                    console.error('Supabase 에러:', currentPostError);
                    setError(currentPostError.message);
                    return;
                }

                setPost(currentPost);

                // Fetch the previous post (older post - created before the current post)
                const {data: prevPostData, error: prevPostError} = await supabase
                    .from('posts')
                    .select('id, title, thumbnail_url, created_at')
                    .lt('created_at', currentPost.created_at)
                    .order('created_at', {ascending: false})
                    .limit(1)
                    .single();

                if (!prevPostError) {
                    setPrevPost(prevPostData);
                }

                // Fetch the next post (newer post - created after the current post)
                const {data: nextPostData, error: nextPostError} = await supabase
                    .from('posts')
                    .select('id, title, thumbnail_url, created_at')
                    .gt('created_at', currentPost.created_at)
                    .order('created_at', {ascending: true})
                    .limit(1)
                    .single();

                if (!nextPostError) {
                    setNextPost(nextPostData);
                }
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
                <SkeletonLoader page="blogDetail"/>
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

            <div className={styles.blogPostWrapper}>
                {/* Mobile TOC - shown only on mobile */}
                <div className={styles.mobileToc}>
                    <TableOfContents content={post.content}/>
                </div>

                <div className={styles.postContent} data-testid="post-content">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                            h1: ({node, ...props}) => {
                                const id = `heading-${headingCounterRef.current++}`;
                                return <h1 id={id} {...props} />;
                            },
                            h2: ({node, ...props}) => {
                                const id = `heading-${headingCounterRef.current++}`;
                                return <h2 id={id} {...props} />;
                            },
                            h3: ({node, ...props}) => {
                                const id = `heading-${headingCounterRef.current++}`;
                                return <h3 id={id} {...props} />;
                            },
                            h4: ({node, ...props}) => {
                                const id = `heading-${headingCounterRef.current++}`;
                                return <h4 id={id} {...props} />;
                            },
                            h5: ({node, ...props}) => {
                                const id = `heading-${headingCounterRef.current++}`;
                                return <h5 id={id} {...props} />;
                            },
                            h6: ({node, ...props}) => {
                                const id = `heading-${headingCounterRef.current++}`;
                                return <h6 id={id} {...props} />;
                            }
                        }}
                    >
                        {post.content || "내용이 없습니다."}
                    </ReactMarkdown>

                    {/* Add extra padding at the bottom to ensure last heading can be scrolled to top */}
                    <div className={styles.bottomPadding}></div>
                </div>

                {/* Desktop TOC - shown only on desktop */}
                <div className={styles.desktopToc}>
                    <TableOfContents content={post.content}/>
                </div>
            </div>

            {/* Post navigation - previous and next posts */}
            <PostNavigation prevPost={prevPost} nextPost={nextPost}/>
        </div>
    );
}
