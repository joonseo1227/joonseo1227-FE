'use client';

import {usePathname} from 'next/navigation';
import Header from '@/components/Header';
import {SocialIcons} from '@/components/SocialIcons';
import Footer from '@/components/Footer';
import ClientWrapper from '@/components/ClientWrapper';

export default function ConditionalLayout({children}) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    if (isAdmin) {
        return children;
    }

    return (
        <>
            <Header/>
            <ClientWrapper>
                {children}
            </ClientWrapper>
            <SocialIcons/>
            <Footer/>
        </>
    );
}
