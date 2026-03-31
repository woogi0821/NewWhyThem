import{BrowserRouter,Routes,Route} from "react-router-dom";
import{ ChargerMain } from "../pages/mock/Kioskmain";
import { Home } from "../pages/Home";

export const AppRouter = () => {
    return (
        <BrowserRouter>
        <Routes>
            <Route path="kiosk" element={<ChargerMain/>}/>
            <Route path="test-modal" element={<Home />} />
            </Routes></BrowserRouter>
    );
};