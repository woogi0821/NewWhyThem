import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../layout/basic/basicLayout"; // 팀장님이 만든 뼈대
import { ReservationPage } from "../pages/reservation/ReservationPage";
// import { SearchPage } from "../pages/SearchPage";
import { ChargerMain } from "../pages/mock/Kioskmain";

export const AppRouter = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* 1. 일반 웹 서비스 (헤더/푸터가 있는 구역) */}
                <Route path="/" element={<MainLayout />}>
                    {/* '/' 주소일 때 나오는 메인 */}
                    <Route index element={
                        <div className="p-10 text-2xl font-bold">
                            여기는 일반 웹/앱 메인 화면입니다. 키오스크는 /kiosk 로 이동하세요!
                        </div>
                    } />
                    {/* '/search' 주소
                    <Route path="search" element={<SearchPage />} /> */}
                    {/* '/reservation' 주소 */}
                    <Route path="reservation" element={<ReservationPage />} />
                </Route>

                {/* 2. 키오스크 (헤더/푸터 없이 꽉 찬 화면) */}
                <Route path="/kiosk" element={<ChargerMain />} />
                
                {/* 3. 관리자 (필요시 추가) */}
                <Route path="/admin" element={<div>관리자 화면 (준비중)</div>} />
            </Routes>
        </BrowserRouter>
    );
};