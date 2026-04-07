import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ChargerMain } from "../pages/mock/Kioskmain";
import ToastTestPage from "../pages/admin/ToastTestPage";
import AdminPage from "../pages/admin/Admin";
import AdminMemberPage from "../pages/admin/AdminMemberPage";
import AdminChargerPage from "../pages/admin/AdminChargerPage";
import AdminReservationPage from "../pages/admin/AdminReservationPage";
import AdminNoticePage from "../pages/admin/AdminNoticePage";

// 🎯 추가된 임포트 (레이아웃 및 페이지)
import MainLayout from "../layout/basic/basicLayout";
// import { SearchPage } from "../pages/SearchPage";
import { ReservationPage } from "../pages/reservation/ReservationPage";

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* ==========================================
                    1. 일반 사용자 영역 (MainLayout의 헤더/푸터가 적용됨)
                   ========================================== */}
                <Route path="/" element={<MainLayout />}>
                    {/* 메인 홈 (기존에 path="/"에 있던 div를 여기로 옮겼습니다) */}
                    <Route index element={
                        <div className="p-10 text-2xl font-bold">
                            여기는 일반 웹/앱 메인 화면입니다. 키오스크는 /kiosk 로 이동하세요!
                        </div>
                    } />
                    {/* 검색 페이지 연결
                    <Route path="search" element={<SearchPage />} /> */}
                    {/* 예약 페이지 연결 🎯 */}
                    <Route path="reservation" element={<ReservationPage />} />
                </Route>

                {/* ==========================================
                    2. 독립 영역 (키오스크 및 테스트/관리자)
                   ========================================== */}
                <Route path="kiosk" element={<ChargerMain/>}/>
                <Route path="/toast-test" element={<ToastTestPage />} />
                
                {/* 관리자 페이지들 (팀장님 기존 코드 유지) */}
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/member" element={<AdminMemberPage />} />
                <Route path="/admin/charger" element={<AdminChargerPage />} />
                <Route path="/admin/reservation" element={<AdminReservationPage />} />
                <Route path="/admin/notice" element={<AdminNoticePage />} />
            </Routes>
        </BrowserRouter>
    );
};