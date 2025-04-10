import { useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import AppContext from "../context/AppContext";
import { refreshToken, getCurrentUser } from "../api/apiAuth";

const ProtectedRoute = ({ children, roles = [] }) => {
    const { auth, setAuth, authLoading } = useContext(AppContext);
    const location = useLocation();
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            if (!auth) {
                try {
                    await refreshToken();
                    const user = await getCurrentUser();
                    setAuth(user);
                } catch (error) {
                    console.error("Không thể xác thực người dùng:", error);
                    setAuth(null);
                }
            }
            setCheckingAuth(false);
        };
        verifyAuth();
    }, [auth, setAuth]);

    if (authLoading || checkingAuth) {
        return (
            <div className="text-center mt-10 text-gray-600">
                ⏳ Đang kiểm tra quyền truy cập...
            </div>
        );
    }

    if (!auth) {
        return (
            <Navigate
                to="/auth/login"
                replace
                state={{ from: location, reason: "unauthenticated" }}
            />
        );
    }

    if (roles.length > 0 && !roles.some((role) => auth.roles?.includes(role))) {
        return (
            <div className="text-center mt-10 text-red-500 font-semibold">
                🚫 Bạn không có quyền truy cập trang này.
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
