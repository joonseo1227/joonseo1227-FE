import supabase from "@/lib/supabase";

export async function generateMetadata({params}) {
    const {id: projectSlug} = await params;

    if (!projectSlug) {
        return {
            title: "프로젝트 없음 | joonseo1227",
            description: "존재하지 않는 프로젝트입니다.",
        };
    }

    const {data: project, error} = await supabase
        .from("project")
        .select("*")
        .eq("slug", projectSlug)
        .single();

    if (error || !project) {
        return {
            title: "프로젝트 없음 | joonseo1227",
            description: "존재하지 않는 프로젝트입니다.",
        };
    }

    const description = project.description ?? "이 프로젝트에는 설명이 없습니다.";

    const metadata = {
        title: `${project.title} | joonseo1227`,
        description,
        openGraph: {
            siteName: "joonseo1227",
            title: `${project.title} | joonseo1227`,
            description,
            images: project.img_url ? [{url: project.img_url}] : [],
            publishedTime: project.start_date,
        },
        twitter: {
            card: "summary_large_image",
            title: `${project.title} | joonseo1227`,
            description,
            images: project.img_url ? [project.img_url] : [],
        },
    };

    return metadata;
}

export default function PortfolioProjectLayout({children}) {
    return <>{children}</>;
}