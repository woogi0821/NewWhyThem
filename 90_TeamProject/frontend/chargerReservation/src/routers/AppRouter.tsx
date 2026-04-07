import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ChargerMain } from "../pages/mock/Kioskmain";
import AdminMemberPage from "../pages/admin/AdminMemberPage";
import AdminChargerPage from "../pages/admin/AdminChargerPage";
import AdminReservationPage from "../pages/admin/AdminReservationPage";
import AdminNoticePage from "../pages/admin/AdminNoticePage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import { PrivateRoute } from "../components/admin/PrivateRoute";
import AdminLoginPage from "../pages/admin/AdminLoginPage";
import AdminPenaltyPage from "../pages/admin/AdminPenaltyPage";
import AdminInquiryPage from "../pages/admin/AdminInquiryPage";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 일반 웹/앱 메인 */}
        <Route
          path="/"
          element={
            <div className="p-10 text-2xl font-bold">
              여기는 일반 웹/앱 메인 화면입니다. 키오스크는 /kiosk 로 이동하세요!
            </div>
          }
        />

        {/* 키오스크 */}
        <Route path="/kiosk" element={<ChargerMain />} />

        {/* 어드민 — PrivateRoute 로 감싸서 어드민만 접근 가능 */}
        <Route path="/admin" element={
          <PrivateRoute><AdminDashboardPage /></PrivateRoute>
        } />
        <Route path="/admin/member" element={
          <PrivateRoute><AdminMemberPage /></PrivateRoute>
        } />
        <Route path="/admin/charger" element={
          <PrivateRoute><AdminChargerPage /></PrivateRoute>
        } />
        <Route path="/admin/reservation" element={
          <PrivateRoute><AdminReservationPage /></PrivateRoute>
        } />
        <Route path="/admin/notice" element={
          <PrivateRoute><AdminNoticePage /></PrivateRoute>
        } />
        {/* 어드민 로그인 — PrivateRoute 밖에 있어야 함 */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/penalty" element={
        <PrivateRoute><AdminPenaltyPage /></PrivateRoute>} />
        <Route path="/admin/inquiry" element={
        <PrivateRoute><AdminInquiryPage /></PrivateRoute>} />

        {/* 테스트 페이지 — 배포 전 제거 */}
        {/* <Route path="/toast-test" element={<ToastTestPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
};