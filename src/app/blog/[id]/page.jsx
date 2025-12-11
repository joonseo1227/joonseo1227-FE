import {notFound} from 'next/navigation';
import supabase from "@/lib/supabase";
import styles from '@/styles/pages/BlogPostPage.module.css';
import TableOfContents from '@/components/TableOfContents';
import PostNavigation from '@/components/PostNavigation';
import Comments from '@/components/Comments';
import MarkdownContent from '@/components/MarkdownContent';
import BlogPostTransitionWrapper from '@/components/BlogPostTransitionWrapper';

export const revalidate = 60;

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export async function generateStaticParams() {
    const {data: posts} = await supabase
        .from('posts')
        .select('id')
        .eq('is_published', true);

    return posts?.map(({id}) => ({id})) || [];
}

export default async function BlogPostPage({params}) {
    const {id} = await params;
    const {data: post} = await supabase
        .from('posts')
        .select('*, post_categories(categories(name))')
        .eq('id', id)
        .in('status', ['published', 'unlisted'])
        .single();

    if (!post) notFound();

    const navigationPostFields = 'id, title, thumbnail_url, created_at';

    const [{data: prevPost}, {data: nextPost}] = await Promise.all([
        supabase
            .from('posts')
            .select(navigationPostFields)
            .eq('status', 'published')
            .lt('created_at', post.created_at)
            .order('created_at', {ascending: false})
            .limit(1)
            .single(),
        supabase
            .from('posts')
            .select(navigationPostFields)
            .eq('status', 'published')
            .gt('created_at', post.created_at)
            .order('created_at', {ascending: true})
            .limit(1)
            .single()
    ]);

    return (
        <>
            {post.thumbnail_url && (
                <div className={styles.thumbnailWrapper}>
                    <div className={styles.thumbnailInner}>
                        <img src={post.thumbnail_url} alt={post.title} className={styles.thumbnail}/>
                    </div>
                </div>
            )}

            <BlogPostTransitionWrapper>
                <div className={styles.container}>
                    <div className={styles.postHeader}>
                        <h1 className={styles.titleText}>{post.title}</h1>
                        <p className={styles.postDate}>{formatDate(post.created_at)}</p>
                    </div>
                </div>

                <div className={styles.contentWrapper}>
                    <div className={styles.blogPostWrapper}>
                        <div className={styles.postContent} data-testid="post-content">
                            <MarkdownContent content={post.content}/>
                        </div>

                        <div className={styles.desktopToc}>
                            <TableOfContents content={post.content}/>
                        </div>
                    </div>
                </div>

                <div className={styles.container}>
                    <PostNavigation prevPost={prevPost} nextPost={nextPost}/>

                    <Comments postId={id}/>
                </div>
            </BlogPostTransitionWrapper>
        </>
    );
}
