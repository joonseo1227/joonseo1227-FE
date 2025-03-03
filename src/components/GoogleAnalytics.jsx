"use client";

import Script from 'next/script';
import {usePathname, useSearchParams} from 'next/navigation';
import {Suspense, useEffect} from 'react';

const GoogleAnalytics = ({ga_id}) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (ga_id && pathname) {
            const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

            window.gtag('config', ga_id, {
                page_path: url,
            });
        }
    }, [ga_id, pathname, searchParams]);

    return (
        <>
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${ga_id}`}
            />
            <Script
                id="gtag-init"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${ga_id}', {
                            page_path: window.location.pathname,
                        });
                    `,
                }}
            />
        </>
    );
};

export default function GoogleAnalyticsWithSuspense({ga_id}) {
    return (
        <Suspense fallback={null}>
            <GoogleAnalytics ga_id={ga_id}/>
        </Suspense>
    );
}