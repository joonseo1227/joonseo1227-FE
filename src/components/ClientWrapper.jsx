"use client";

import PageTransition from "@/components/PageTransition";

export default function ClientWrapper({children}) {
    return (
        <PageTransition>
            {children}
        </PageTransition>
    );
}
