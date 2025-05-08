import {notFound} from 'next/navigation';
import supabase from "/src/lib/supabase.js";
import styles from '@/styles/pages/BlogPostPage.module.css';
import TableOfContents from '@/components/TableOfContents';
import PostNavigation from '@/components/PostNavigation';
import Comments from '@/components/Comments';
import MarkdownContent from '@/components/MarkdownContent';

// Generate static paths at build time
export async function generateStaticParams() {
    const {data: posts} = await supabase
        .from('posts')
        .select('id');

    return posts?.map((post) => ({
        id: post.id,
    })) || [];
}

export default async function BlogPostPage({params}) {
    const postId = params?.id;

    // Fetch the current post
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
        .single();

    if (postError || !post) {
        notFound();
    }

    // Fetch the previous post (older post - created before the current post)
    const {data: prevPost} = await supabase
        .from('posts')
        .select('id, title, thumbnail_url, created_at')
        .lt('created_at', post.created_at)
        .order('created_at', {ascending: false})
        .limit(1)
        .single();

    // Fetch the next post (newer post - created after the current post)
    const {data: nextPost} = await supabase
        .from('posts')
        .select('id, title, thumbnail_url, created_at')
        .gt('created_at', post.created_at)
        .order('created_at', {ascending: true})
        .limit(1)
        .single();

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
                    <MarkdownContent content={post.content}/>

                </div>

                {/* Desktop TOC - shown only on desktop */}
                <div className={styles.desktopToc}>
                    <TableOfContents content={post.content}/>
                </div>
            </div>

            {/* Post navigation - previous and next posts */}
            <PostNavigation prevPost={prevPost} nextPost={nextPost}/>

            {/* Comments section */}
            <Comments postId={postId}/>

            <div className={styles.bottomPadding}></div>

        </div>
    );
}
