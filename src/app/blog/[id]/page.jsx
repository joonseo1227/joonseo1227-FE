import {notFound} from 'next/navigation';
import supabase from "/src/lib/supabase.js";
import styles from '@/styles/pages/BlogPostPage.module.css';
import TableOfContents from '@/components/TableOfContents';
import PostNavigation from '@/components/PostNavigation';
import Comments from '@/components/Comments';
import MarkdownContent from '@/components/MarkdownContent';
import BlogPostTransitionWrapper from '@/components/BlogPostTransitionWrapper';

export const revalidate = 60;

export async function generateStaticParams() {
    const {data: posts} = await supabase
        .from('posts')
        .select('id')
        .eq('is_published', true);

    return posts?.map((post) => ({
        id: post.id,
    })) || [];
}

export default async function BlogPostPage({params}) {
    const postId = params?.id;

    const {data: post, error: postError} = await supabase
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
        .in('status', ['published', 'unlisted'])
        .single();

    if (postError || !post) {
        notFound();
    }

    const {data: prevPost} = await supabase
        .from('posts')
        .select('id, title, thumbnail_url, created_at')
        .eq('status', 'published')
        .lt('created_at', post.created_at)
        .order('created_at', {ascending: false})
        .limit(1)
        .single();

    const {data: nextPost} = await supabase
        .from('posts')
        .select('id, title, thumbnail_url, created_at')
        .eq('status', 'published')
        .gt('created_at', post.created_at)
        .order('created_at', {ascending: true})
        .limit(1)
        .single();

    return (
        <BlogPostTransitionWrapper>
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
                <div className={styles.mobileToc}>
                    <TableOfContents content={post.content}/>
                </div>

                <div className={styles.postContent} data-testid="post-content">
                    <MarkdownContent content={post.content}/>
                </div>

                <div className={styles.desktopToc}>
                    <TableOfContents content={post.content}/>
                </div>
            </div>

            <PostNavigation prevPost={prevPost} nextPost={nextPost}/>

            <Comments postId={postId}/>
        </BlogPostTransitionWrapper>
    );
}
