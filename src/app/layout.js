import "../styles/globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import ConditionalLayout from "@/components/ConditionalLayout";

export const metadata = {
    title: "joonseo1227",
    openGraph: {
        siteName: "joonseo1227",
        title: "joonseo1227",
        description: "정준서의 홈페이지",
        images: "https://avtqiifssheaiyrcujbi.supabase.co/storage/v1/object/public/images//thumbnail.webp",
    },
    twitter: {
        card: "summary_large_image",
        title: "joonseo1227",
        description: "정준서의 홈페이지",
        images: "https://avtqiifssheaiyrcujbi.supabase.co/storage/v1/object/public/images//thumbnail.webp",
    },
    icons: {
        shortcut: '/src/app/favicon.ico',
    },
};

export default function RootLayout({children}) {
    return (
        <html lang="ko">
        <body>
        <GoogleAnalytics ga_id={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}/>
        <ConditionalLayout>
            {children}
        </ConditionalLayout>
        </body>
        </html>
    );
}
