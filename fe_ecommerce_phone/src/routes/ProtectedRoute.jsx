import { useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import AppContext from "../context/AppContext";
import { refreshToken, getCurrentUser } from "../api/apiAuth";

const ProtectedRoute = ({ children, roles = [] }) => {
    const { auth, setAuth, authLoading } = useContext(AppContext);
    const location = useLocation();
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [timeoutError, setTimeoutError] = useState(false);

    useEffect(() => {
        let timeoutId;
        const verifyAuth = async () => {
            try {
                // Nếu đã có auth và role hợp lệ, cho truy cập luôn
                if (auth && (roles.length === 0 || roles.some((role) => auth.roles?.includes(role)))) {
                    setCheckingAuth(false);
                    return;
                }
                // Nếu chưa có auth, thử refresh token và lấy user
                if (!auth) {
                    const refreshed = await refreshToken();
                    if (refreshed) {
                        const user = await getCurrentUser();
                        if (user) setAuth(user);
                    }
                }
            } catch (error) {
                console.error("Không thể xác thực người dùng:", error);
                setAuth(null);
            } finally {
                setCheckingAuth(false);
            }
        };
        verifyAuth();
        // Timeout sau 10s nếu vẫn chưa xác thực xong
        timeoutId = setTimeout(() => {
            if (checkingAuth) setTimeoutError(true);
        }, 10000);
        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Chỉ chạy một lần khi mount

    if (authLoading || checkingAuth) {
        return (
            <div className="text-center mt-10 text-gray-600 animate-pulse">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-300 rounded-full animate-pulse" />
                <div className="h-4 w-1/2 mx-auto bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="h-4 w-1/3 mx-auto bg-gray-200 rounded animate-pulse" />
                <div className="mt-4">⏳ Đang kiểm tra quyền truy cập...</div>
                {timeoutError && (
                    <div className="text-red-500 mt-4">Lỗi xác thực, vui lòng thử lại hoặc đăng nhập lại.</div>
                )}
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