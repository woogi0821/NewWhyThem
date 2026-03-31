import{BrowserRouter,Routes,Route} from "react-router-dom";
import{ ChargerMain } from "../pages/mock/Kioskmain";
import ToastTestPage from "../pages/admin/ToastTestPage";
import AdminPage from "../pages/admin/Admin";
import AdminMemberPage from "../pages/admin/AdminMemberPage";
import AdminChargerPage from "../pages/admin/AdminChargerPage";
import AdminReservationPage from "../pages/admin/AdminReservationPage";
import AdminNoticePage from "../pages/admin/AdminNoticePage";


export const AppRouter = () => {
    return (
        <BrowserRouter>
        <Routes>
            <Route path="/" element={<div className="p-10 text-2xl font-bold">여기는 일반 웹/앱 메인 화면입니다. 키오스크는 /kiosk 로 이동하세요!</div>} />
            <Route path="kiosk" element={<ChargerMain/>}/>
            <Route path="/toast-test" element={<ToastTestPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/member" element={<AdminMemberPage />} />
            <Route path="/admin/charger" element={<AdminChargerPage />} />
            <Route path="/admin/reservation" element={<AdminReservationPage />} />
            <Route path="/admin/notice" element={<AdminNoticePage />} />
            </Routes></BrowserRouter>
    );
};