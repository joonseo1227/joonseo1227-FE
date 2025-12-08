import supabase from "@/lib/supabase";

export async function generateMetadata({params}) {
    const {id: postId} = await params;

    if (!postId) {
        return {
            title: "게시글 없음 | joonseo1227",
            description: "존재하지 않는 게시글입니다.",
        };
    }

    const {data: post, error} = await supabase
        .from("posts")
        .select(`
            *,
            post_categories (
                categories (
                    name
                )
            )
        `)
        .eq("id", postId)
        .in("status", ["published", "unlisted"])
        .single();

    if (error || !post) {
        return {
            title: "게시글 없음 | joonseo1227",
            description: "존재하지 않는 게시글입니다.",
        };
    }

    const description = post.summary ?? "";

    const metadata = {
        title: `${post.title} | joonseo1227`,
        description,
        openGraph: {
            siteName: "joonseo1227",
            title: `${post.title} | joonseo1227`,
            description,
            images: post.thumbnail_url ? [{url: post.thumbnail_url}] : [],
            type: "article",
            publishedTime: post.created_at,
        },
        twitter: {
            card: "summary_large_image",
            title: `${post.title} | joonseo1227`,
            description,
            images: post.thumbnail_url ? [post.thumbnail_url] : [],
        },
    };

    return metadata;
}

export default function BlogPostLayout({children}) {
    return <>{children}</>;
}