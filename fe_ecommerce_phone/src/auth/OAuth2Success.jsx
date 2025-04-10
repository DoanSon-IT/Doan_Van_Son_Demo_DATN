import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppContext from "../context/AppContext";
import { getCurrentUser } from "../api/apiAuth";

const OAuth2Success = () => {
    const { setAuth } = useContext(AppContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    // Hàm tạo seed ngẫu nhiên nếu user không có fullName/email (hiếm gặp)
    const generateRandomSeed = () => {
        return Math.random().toString(36).substring(2, 10);
    };

    useEffect(() => {
        const handleOAuth2Success = async () => {
            try {
                console.log("OAuth2 login successful, fetching user info...");
                const user = await getCurrentUser();

                // Nếu user không có avatar, gán random Dicebear avatar
                if (!user.avatarUrl) {
                    const baseSeed = user.fullName || user.email || generateRandomSeed();
                    const seed = encodeURIComponent(baseSeed.trim().toLowerCase());
                    user.avatarUrl = `https://api.dicebear.com/6.x/thumbs/svg?seed=${seed}`;
                }

                if (user) {
                    setAuth(user);
                    console.log("User info fetched and set:", user);

                    const redirectPath = sessionStorage.getItem("oauth2_redirect_path") || "/";
                    sessionStorage.removeItem("oauth2_redirect_path");
                    navigate(redirectPath, { replace: true });
                } else {
                    throw new Error("Không lấy được thông tin người dùng");
                }
            } catch (error) {
                console.error("Lỗi khi xử lý OAuth2 success:", error);
                navigate("/auth/login", { replace: true });
            } finally {
                setLoading(false);
            }
        };

        // Thêm timeout để tránh treo nếu backend không phản hồi
        const timeout = setTimeout(() => {
            if (loading) {
                console.error("Timeout khi lấy thông tin người dùng");
                navigate("/auth/login");
            }
        }, 10000); // 10 giây

        handleOAuth2Success();

        return () => clearTimeout(timeout);
    }, [setAuth, navigate, loading]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-xl">
                {loading ? "Đang xử lý đăng nhập..." : "Đăng nhập thành công, đang chuyển hướng..."}
            </p>
        </div>
    );
};

export default OAuth2Success;