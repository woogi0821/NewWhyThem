import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ChargerMain } from "../pages/mock/Kioskmain";
import ToastTestPage from "../pages/admin/ToastTestPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminMemberPage from "../pages/admin/AdminMemberPage";
import AdminChargerPage from "../pages/admin/AdminChargerPage";
import AdminReservationPage from "../pages/admin/AdminReservationPage";
import AdminNoticePage from "../pages/admin/AdminNoticePage";
import AdminPenaltyPage from "../pages/admin/AdminPenaltyPage";
import AdminInquiryPage from "../pages/admin/AdminInquiryPage";
import AdminLoginPage from "../pages/admin/AdminLoginPage";

// 🎯 추가된 임포트 (레이아웃 및 페이지)
import MainLayout from "../layout/basic/basicLayout";
import { ReservationPage } from "../pages/reservation/ReservationPage";

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* ==========================================
                    1. 일반 사용자 영역 (MainLayout의 헤더/푸터가 적용됨)
                   ========================================== */}
                <Route path="/" element={<MainLayout />}>
                    <Route index element={
                        <div className="p-10 text-2xl font-bold">
                            여기는 일반 웹/앱 메인 화면입니다. 키오스크는 /kiosk 로 이동하세요!
                        </div>
                    } />
                    <Route path="reservation" element={<ReservationPage />} />
                </Route>

                {/* ==========================================
                    2. 독립 영역 (키오스크 및 테스트/관리자)
                   ========================================== */}
                <Route path="kiosk" element={<ChargerMain/>}/>
                <Route path="/toast-test" element={<ToastTestPage />} />

                {/* 관리자 로그인 */}
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* 관리자 페이지들 */}
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/member" element={<AdminMemberPage />} />
                <Route path="/admin/charger" element={<AdminChargerPage />} />
                <Route path="/admin/reservation" element={<AdminReservationPage />} />
                <Route path="/admin/notice" element={<AdminNoticePage />} />
                <Route path="/admin/penalty" element={<AdminPenaltyPage />} />
                <Route path="/admin/inquiry" element={<AdminInquiryPage />} />
            </Routes>
        </BrowserRouter>
    );
};