import "../styles/globals.css";
import Header from "@/components/Header";
import {SocialIcons} from "@/components/SocialIcons";

export const metadata = {
    title: "joonseo1227",
    openGraph: {
        siteName: "joonseo1227",
        title: "joonseo1227",
        description: "정준서의 홈페이지",
        images: "https://avtqiifssheaiyrcujbi.supabase.co/storage/v1/object/sign/images/thumbnail.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJpbWFnZXMvdGh1bWJuYWlsLmpwZyIsImlhdCI6MTc0MDkyOTc3MywiZXhwIjozMzI0NTM5Mzc3M30.Zg43Io1d1YbvvOZ42m3CQKbwhPT-u62Bz8T_yYsqDus",
    },
    twitter: {
        card: "summary_large_image",
        title: "joonseo1227",
        description: "정준서의 홈페이지",
        images: "https://avtqiifssheaiyrcujbi.supabase.co/storage/v1/object/sign/images/thumbnail.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJpbWFnZXMvdGh1bWJuYWlsLmpwZyIsImlhdCI6MTc0MDkyOTc3MywiZXhwIjozMzI0NTM5Mzc3M30.Zg43Io1d1YbvvOZ42m3CQKbwhPT-u62Bz8T_yYsqDus",
    },
    icons: {
        shortcut: '/src/app/favicon.ico',
    },
};

export default function RootLayout({children}) {
    return (
        <html lang="ko">
        <body>
        <Header/>
        {children}
        <SocialIcons/>
        </body>
        </html>
    );
}
