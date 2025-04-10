import { Routes, Navigate, Route } from "react-router-dom";
import CustomerRoutes from "./routes/CustomerRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import AuthRoutes from "./routes/AuthRoutes";
import NotFoundPage from "./pages/NotFoundPage";

const App = () => {
    return (
        <Routes>
            <Route path="/auth/*" element={<AuthRoutes />} />
            <Route path="/admin/*" element={<AdminRoutes />} />
            <Route path="/*" element={<CustomerRoutes />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};

export default App;