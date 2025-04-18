import React, { createContext, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    getCurrentUser,
    loginUser,
    logoutUser,
    refreshToken
} from "../api/apiAuth";

export const AppContext = createContext();

const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000; // 5 phút
const USER_CACHE_DURATION = 30 * 1000; // Cache user trong 30 giây

export const AppProvider = ({ children }) => {
    const [auth, setAuth] = useState(() => {
        const storedAuth = localStorage.getItem("auth");
        return storedAuth ? JSON.parse(storedAuth) : null;
    });
    const [authLoading, setAuthLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState(null);
    const [cartItems, setCartItems] = useState(() => {
        const stored = localStorage.getItem("cartItems");
        return stored ? JSON.parse(stored) : [];
    });

    const navigate = useNavigate();
    const location = useLocation();
    const isVerifyingRef = useRef(false);
    const refreshTimerRef = useRef(null);
    const userCacheRef = useRef({ data: null, timestamp: 0 });

    const isPublicRoute = (pathname) => {
        console.log("Checking route pattern:", pathname);
        const publicRoutes = [
            "/",
            "/auth/login",
            "/auth/register",
            "/auth/forgot-password",
        ];
        if (publicRoutes.includes(pathname)) return true;
        const isProductDetail = !!pathname.match(/\/products?\/\d+/);
        return (
            isProductDetail ||
            pathname.startsWith("/products/") ||
            pathname.startsWith("/categories/") ||
            pathname.startsWith("/search") ||
            pathname.startsWith("/about") ||
            pathname.startsWith("/contact")
        );
    };

    const setupRefreshTimer = (expiresAt) => {
        if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
        if (!expiresAt) return;
        const expiryTime = new Date(expiresAt).getTime();
        const currentTime = new Date().getTime();
        const timeUntilRefresh = Math.max(0, expiryTime - currentTime - TOKEN_REFRESH_BUFFER);
        console.log(`Token sẽ được refresh sau ${timeUntilRefresh / 1000} giây`);
        refreshTimerRef.current = setTimeout(async () => {
            console.log("Đang refresh token...");
            try {
                await handleRefreshToken();
            } catch (err) {
                console.error("Lỗi refresh token:", err);
                logout();
            }
        }, timeUntilRefresh);
    };

    const handleRefreshToken = async () => {
        try {
            const result = await refreshToken();
            console.log("Refresh token thành công:", result);
            const now = Date.now();
            // Kiểm tra cache
            if (
                userCacheRef.current.data &&
                now - userCacheRef.current.timestamp < USER_CACHE_DURATION
            ) {
                console.log("Sử dụng user từ cache trong handleRefreshToken:", userCacheRef.current.data);
                setAuth(userCacheRef.current.data);
                if (userCacheRef.current.data.expiresAt) setupRefreshTimer(userCacheRef.current.data.expiresAt);
                return true;
            }
            // Gọi getCurrentUser nếu cache không hợp lệ
            const user = await getCurrentUser();
            setAuth(user);
            localStorage.setItem("auth", JSON.stringify(user));
            userCacheRef.current = { data: user, timestamp: now };
            if (user.expiresAt) setupRefreshTimer(user.expiresAt);
            return true;
        } catch (error) {
            console.error("Lỗi khi refresh token:", error);
            setAuthError("Phiên đăng nhập hết hạn");
            throw error;
        }
    };

    const verifyAuth = async () => {
        if (isVerifyingRef.current) {
            console.log("Đang xác thực, bỏ qua verifyAuth");
            return;
        }
        isVerifyingRef.current = true;

        try {
            console.log("verifyAuth triggered for route:", location.pathname, "Is public?", isPublicRoute(location.pathname));

            // Route công khai
            if (isPublicRoute(location.pathname)) {
                if (auth) {
                    setAuthLoading(false);
                    return;
                }
                const storedAuth = localStorage.getItem("auth");
                if (storedAuth) {
                    const parsedAuth = JSON.parse(storedAuth);
                    setAuth(parsedAuth);
                    userCacheRef.current = { data: parsedAuth, timestamp: Date.now() };
                    if (parsedAuth.expiresAt) setupRefreshTimer(parsedAuth.expiresAt);
                }
                setAuthLoading(false);
                return;
            }

            // Route riêng tư: Kiểm tra cache
            const now = Date.now();
            if (
                userCacheRef.current.data &&
                now - userCacheRef.current.timestamp < USER_CACHE_DURATION
            ) {
                console.log("Sử dụng user từ cache:", userCacheRef.current.data);
                setAuth(userCacheRef.current.data);
                if (userCacheRef.current.data.expiresAt) setupRefreshTimer(userCacheRef.current.data.expiresAt);
                setAuthLoading(false);
                return;
            }

            // Kiểm tra auth hiện tại
            if (auth && auth.expiresAt && new Date(auth.expiresAt) > new Date(now + TOKEN_REFRESH_BUFFER)) {
                console.log("Token còn hợp lệ, không gọi getCurrentUser");
                userCacheRef.current = { data: auth, timestamp: now };
                setupRefreshTimer(auth.expiresAt);
                setAuthLoading(false);
                return;
            }

            // Gọi getCurrentUser
            console.log("Calling getCurrentUser with HTTP-only cookie");
            const user = await getCurrentUser();
            console.log("getCurrentUser response:", user);
            setAuth(user);
            localStorage.setItem("auth", JSON.stringify(user));
            userCacheRef.current = { data: user, timestamp: now };
            if (user.expiresAt) setupRefreshTimer(user.expiresAt);
            setAuthError(null);
        } catch (error) {
            console.error("verifyAuth error:", error);
            if (error.status === 401 || error.status === 403) {
                try {
                    await handleRefreshToken();
                    return;
                } catch (refreshError) {
                    setAuthError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
                    localStorage.removeItem("auth");
                    setAuth(null);
                }
            } else {
                setAuthError(error.message || "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
            }
        } finally {
            isVerifyingRef.current = false;
            setAuthLoading(false);
        }
    };

    useEffect(() => {
        verifyAuth();
        return () => {
            if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
        };
    }, [location.pathname]);

    useEffect(() => {
        if (authError && !isPublicRoute(location.pathname)) {
            console.log("Redirecting to login due to authError:", authError);
            const returnUrl = location.pathname;
            navigate("/auth/login", {
                state: { reason: authError || "session_expired", returnUrl }
            });
        }
    }, [authError, location.pathname, navigate]);

    const login = async (credentials) => {
        setLoading(true);
        try {
            const res = await loginUser(credentials);
            if (res.message === "Đăng nhập thành công") {
                const user = await getCurrentUser();
                setAuth(user);
                localStorage.setItem("auth", JSON.stringify(user));
                userCacheRef.current = { data: user, timestamp: Date.now() };
                if (user.expiresAt) setupRefreshTimer(user.expiresAt);
                setAuthError(null);
                return user;
            }
            throw new Error(res.message || "Đăng nhập thất bại");
        } catch (err) {
            setAuth(null);
            localStorage.removeItem("auth");
            setAuthError(err.message || "Đăng nhập thất bại");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await logoutUser();
        } catch (err) {
            console.error("Đăng xuất lỗi:", err);
        } finally {
            if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
            refreshTimerRef.current = null;
            setAuth(null);
            localStorage.removeItem("auth");
            setCartItems([]);
            localStorage.clear();
            sessionStorage.clear();
            userCacheRef.current = { data: null, timestamp: 0 };
            navigate("/", { replace: true });
            setLoading(false);
        }
    };

    const addToCart = (item) => {
        setCartItems((prev) => {
            const found = prev.find((i) => i.id === item.id);
            return found
                ? prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
                : [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId) => {
        setCartItems((prev) => prev.filter((i) => i.id !== itemId));
    };

    const updateCartItemQuantity = (itemId, quantity) => {
        quantity <= 0
            ? removeFromCart(itemId)
            : setCartItems((prev) =>
                prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
            );
    };

    useEffect(() => {
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }, [cartItems]);

    return (
        <AppContext.Provider
            value={{
                auth,
                setAuth,
                authLoading,
                login,
                logout,
                cartItems,
                addToCart,
                removeFromCart,
                updateCartItemQuantity,
                loading,
                refreshAuth: handleRefreshToken,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export default AppContext;