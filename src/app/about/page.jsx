import supabase from '/src/lib/supabase.js';
import AboutPageContent from '@/components/AboutPageContent';

export const revalidate = 60;

async function fetchAboutData() {
    try {
        const {data: aboutData, error: aboutError} = await supabase
            .from('about_info')
            .select('*')
            .eq('is_active', true)
            .single();

        if (aboutError) throw aboutError;

        const {data: timelineData, error: timelineError} = await supabase
            .from('work_timeline')
            .select('*')
            .eq('is_active', true)
            .order('display_order');

        if (timelineError) throw timelineError;

        const {data: categoriesData, error: categoriesError} = await supabase
            .from('tech_categories')
            .select(`
                *,
                tech_skills (
                    name,
                    icon_name,
                    display_order
                )
            `)
            .eq('is_active', true)
            .order('display_order');

        if (categoriesError) throw categoriesError;

        const techStackData = {};
        categoriesData.forEach(category => {
            const skills = category.tech_skills
                .filter(skill => skill.name)
                .sort((a, b) => a.display_order - b.display_order);

            techStackData[category.name] = {
                display_name: category.display_name,
                skills: skills
            };
        });

        const {data: servicesData, error: servicesError} = await supabase
            .from('services')
            .select('*')
            .eq('is_active', true)
            .order('display_order');

        if (servicesError) throw servicesError;

        const {data: certificationsData, error: certificationsError} = await supabase
            .from('certifications')
            .select('*')
            .eq('is_active', true)
            .order('display_order');

        if (certificationsError) throw certificationsError;

        return {
            aboutInfo: aboutData,
            workTimeline: timelineData || [],
            techStack: techStackData,
            services: servicesData || [],
            certifications: certificationsData || []
        };

    } catch (error) {
        console.error('About 페이지 데이터 로딩 실패:', error);
        throw error;
    }
}

export default async function AboutPage() {
    try {
        const data = await fetchAboutData();

        return (
            <AboutPageContent
                aboutInfo={data.aboutInfo}
                workTimeline={data.workTimeline}
                techStack={data.techStack}
                services={data.services}
                certifications={data.certifications}
            />
        );
    } catch (error) {
        return (
            <div style={{padding: '2rem', textAlign: 'center'}}>
                <h1>About</h1>
                <p>데이터를 불러오는 중 오류가 발생했습니다.</p>
                <p>잠시 후 다시 시도해주세요.</p>
            </div>
        );
    }
}
