import { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import AppRoutes from "./routes.jsx";
import Headermain from "../header/Headermain.jsx";
import "./App.css";

/**
 * React 컴포넌트: ScrollToTop
 * - 페이지 이동 시 항상 스크롤을 상단으로 이동하도록 처리
 */
function ScrollToTop({ children }) {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return children;
}

/**
 * React 컴포넌트: App
 * - 애플리케이션의 루트 컴포넌트
 */
export default function App() {
    return (
        <Router basename={import.meta.env.VITE_PUBLIC_URL || "/"}>
            <ScrollToTop>
                <Headermain />
                <AppRoutes />
            </ScrollToTop>
        </Router>
    );
}