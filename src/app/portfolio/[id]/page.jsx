'use client';

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import supabase from "@/lib/supabase";

export default function PortfolioProjectPage({params}) {
    const unwrappedParams = React.use(params);
    const slug = unwrappedParams?.id;
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                setLoading(true);
                const {data, error} = await supabase
                    .from('project')
                    .select('*, project_technologies(technologies(name))')
                    .eq('slug', slug)
                    .single();

                if (error) {
                    setError(error.message);
                    return;
                }

                setProject(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [slug]);

    const router = useRouter();

    if (loading) {
        return null; // or return a loading spinner
    }

    if (error || !project) {
        router.push('/404');
        return null;
    }

    return (
        <div>

        </div>
    );
}
