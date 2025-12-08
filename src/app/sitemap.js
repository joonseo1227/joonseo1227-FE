import supabase from "@/lib/supabase";

export default async function sitemap() {
    // Base URL for the site
    const baseUrl = 'https://joonseo1227.com';

    // Static routes
    const staticRoutes = [
        {
            url: baseUrl,
            lastModified: new Date(),
        },
        {
            url: `${baseUrl}/portfolio`,
            lastModified: new Date(),
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
        },
    ];

    // Fetch blog posts
    const {data: posts} = await supabase
        .from('posts')
        .select('id, created_at, updated_at')
        .eq('status', 'published');

    const blogUrls = posts?.map(post => ({
        url: `${baseUrl}/blog/${post.id}`,
        lastModified: post.updated_at || post.created_at,
    })) || [];

    // Fetch portfolio projects
    const {data: projects} = await supabase
        .from('project')
        .select('id, start_date, updated_at');

    const portfolioUrls = projects?.map(project => ({
        url: `${baseUrl}/portfolio/${project.id}`,
        lastModified: project.updated_at || project.start_date,
    })) || [];

    return [...staticRoutes, ...blogUrls, ...portfolioUrls];
}