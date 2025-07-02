import supabase from "/src/lib/supabase.js";

export async function generateMetadata({params}) {
    const postId = params?.id;

    if (!postId) {
        return {
            title: "게시글 없음 | joonseo1227",
            description: "존재하지 않는 게시글입니다.",
        };
    }

    // Supabase에서 게시글 정보 가져오기
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

    // 게시글이 없거나 에러 발생 시 기본값 반환
    if (error || !post) {
        return {
            title: "게시글 없음 | joonseo1227",
            description: "존재하지 않는 게시글입니다.",
        };
    }

    // 설명 부분 (summary가 없으면 기본값)
    const description = post.summary ?? "이 게시글에는 내용이 없습니다.";

    // Open Graph 및 Twitter 메타데이터 설정
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

// 레이아웃 컴포넌트
export default function BlogPostLayout({children}) {
    return <>{children}</>;
}