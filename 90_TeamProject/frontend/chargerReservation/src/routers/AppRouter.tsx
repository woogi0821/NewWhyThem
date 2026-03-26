import{BrowserRouter,Routes,Route} from "react-router-dom";
import{ ChargerMain } from "../pages/mock/Kioskmain";
import { Home } from "../pages/Home";

export const AppRouter = () => {
    return (
        <BrowserRouter>
        <Routes>
            <Route path="/" element={<div className="p-10 text-2xl font-bold">여기는 일반 웹/앱 메인 화면입니다. 키오스크는 /kiosk 로 이동하세요!</div>} />
            <Route path="kiosk" element={<ChargerMain/>}/>
            <Route path="test-modal" element={<Home />} />
            </Routes></BrowserRouter>
    );
};