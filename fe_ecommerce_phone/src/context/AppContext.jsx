import React, { createContext, useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    getCurrentUser,
    loginUser,
    logoutUser,
    refreshToken
} from "../api/apiAuth";
import { toast } from "react-toastify";

export const AppContext = createContext();

const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes
const USER_CACHE_DURATION = 60 * 1000; // Cache user for 60 seconds

// Hàm kiểm tra JWT token
const hasAuthToken = () => {
    const match = document.cookie.match(new RegExp("(^| )auth_token=([^;]+)"));
    return !!match;
};

export const AppProvider = ({ children }) => {
    const [auth, setAuth] = useState(() => {
        const storedAuth = sessionStorage.getItem("auth");
        return storedAuth ? JSON.parse(storedAuth) : null;
    });
    const [authLoading, setAuthLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [authError, setAuthError] = useState(null);
    const [cartItems, setCartItems] = useState(() => {
        const stored = sessionStorage.getItem("cartItems");
        return stored ? JSON.parse(stored) : [];
    });

    const navigate = useNavigate();
    const location = useLocation();
    const isVerifyingRef = useRef(false);
    const refreshTimerRef = useRef(null);
    const userCacheRef = useRef({ data: null, timestamp: 0 });

    const isPublicRoute = useCallback((pathname) => {
        const publicRoutes = [
            "/",
            "/auth/login",
            "/auth/register",
            "/auth/forgot-password",
            "/cart",
            "/products"
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
    }, []);

    const setupRefreshTimer = useCallback((expiresAt) => {
        if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
        if (!expiresAt) return;
        const expiryTime = new Date(expiresAt).getTime();
        const currentTime = new Date().getTime();
        const timeUntilRefresh = Math.max(0, expiryTime - currentTime - TOKEN_REFRESH_BUFFER);
        refreshTimerRef.current = setTimeout(async () => {
            try {
                await handleRefreshToken();
            } catch (err) {
                console.error("Refresh token error:", err);
                logout();
            }
        }, timeUntilRefresh);
    }, []);

    const handleRefreshToken = useCallback(async () => {
        // Kiểm tra có refresh_token không trước khi thực hiện
        const refreshTokenCookie = document.cookie.match(new RegExp("(^| )refresh_token=([^;]+)"));
        if (!refreshTokenCookie) {
            console.warn("No refresh token available, skipping refresh");
            return false;
        }

        let retryCount = 0;
        const maxRetries = 5;
        const baseDelay = 500; // ms
        while (retryCount < maxRetries) {
            try {
                const result = await refreshToken();
                const now = Date.now();

                // Kiểm tra cache trước
                if (
                    userCacheRef.current.data &&
                    now - userCacheRef.current.timestamp < USER_CACHE_DURATION
                ) {
                    setAuth(userCacheRef.current.data);
                    if (userCacheRef.current.data.expiresAt) setupRefreshTimer(userCacheRef.current.data.expiresAt);
                    return true;
                }

                // Chỉ gọi /me nếu có auth_token mới
                if (hasAuthToken()) {
                    const user = await getCurrentUser();
                    setAuth(user);
                    sessionStorage.setItem("auth", JSON.stringify(user));
                    userCacheRef.current = { data: user, timestamp: now };
                    if (user.expiresAt) setupRefreshTimer(user.expiresAt);
                }
                return true;
            } catch (error) {
                retryCount++;
                if (retryCount === maxRetries) {
                    console.error("Max retries reached for refresh token:", error);
                    setAuthError("Session expired. Please log in again.");
                    throw error;
                }
                // Exponential backoff + jitter
                const delay = baseDelay * Math.pow(2, retryCount) + Math.random() * 300;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }, [setupRefreshTimer]);

    const verifyAuth = useCallback(async () => {
        if (isVerifyingRef.current) return;
        isVerifyingRef.current = true;

        try {
            console.log("🔍 Verifying auth for path:", location.pathname);
            console.log("🔍 Is public route:", isPublicRoute(location.pathname));
            console.log("🔍 Has auth token:", hasAuthToken());
            console.log("🔍 Current auth state:", auth);

            // Xử lý route public
            if (isPublicRoute(location.pathname)) {
                console.log("📌 Handling public route");
                if (auth) {
                    console.log("✅ User is authenticated");
                    setAuthLoading(false);
                    return;
                }
                const storedAuth = sessionStorage.getItem("auth");
                if (storedAuth) {
                    console.log("📦 Found stored auth");
                    const parsedAuth = JSON.parse(storedAuth);
                    const now = Date.now();
                    if (parsedAuth.expiresAt && new Date(parsedAuth.expiresAt) > new Date(now + TOKEN_REFRESH_BUFFER)) {
                        console.log("✅ Stored auth is valid");
                        setAuth(parsedAuth);
                        userCacheRef.current = { data: parsedAuth, timestamp: now };
                        setupRefreshTimer(parsedAuth.expiresAt);
                    } else {
                        console.log("❌ Stored auth expired");
                        sessionStorage.removeItem("auth");
                    }
                }
                setAuthLoading(false);
                return;
            }

            // Xử lý route protected
            console.log("🔒 Handling protected route");
            const now = Date.now();

            // Ưu tiên kiểm tra auth hiện tại hợp lệ
            if (auth && auth.expiresAt && new Date(auth.expiresAt) > new Date(now + TOKEN_REFRESH_BUFFER)) {
                console.log("✅ Current auth is valid (skip token check)");
                userCacheRef.current = { data: auth, timestamp: now };
                setupRefreshTimer(auth.expiresAt);
                setAuthLoading(false);
                return;
            } else if (auth && (!auth.expiresAt || new Date(auth.expiresAt) <= new Date(now + TOKEN_REFRESH_BUFFER))) {
                // Nếu user hết hạn, xóa khỏi sessionStorage
                sessionStorage.removeItem("auth");
                setAuth(null);
            }

            // Kiểm tra cache trước
            if (
                userCacheRef.current.data &&
                now - userCacheRef.current.timestamp < USER_CACHE_DURATION
            ) {
                console.log("📦 Using cached user data");
                setAuth(userCacheRef.current.data);
                if (userCacheRef.current.data.expiresAt) setupRefreshTimer(userCacheRef.current.data.expiresAt);
                setAuthLoading(false);
                return;
            }

            // Nếu không có auth hợp lệ, kiểm tra token
            if (hasAuthToken()) {
                console.log("🔑 Calling /me API");
                const user = await getCurrentUser();
                console.log("✅ Got user data:", user);
                setAuth(user);
                sessionStorage.setItem("auth", JSON.stringify(user));
                userCacheRef.current = { data: user, timestamp: now };
                if (user.expiresAt) setupRefreshTimer(user.expiresAt);
                setAuthError(null);
                setAuthLoading(false);
                return;
            }

            // Nếu không có token, thử lấy từ sessionStorage
            const storedAuth = sessionStorage.getItem("auth");
            if (storedAuth) {
                const parsedAuth = JSON.parse(storedAuth);
                if (parsedAuth.expiresAt && new Date(parsedAuth.expiresAt) > new Date(now + TOKEN_REFRESH_BUFFER)) {
                    console.log("✅ Dùng lại user từ sessionStorage khi không có token");
                    setAuth(parsedAuth);
                    userCacheRef.current = { data: parsedAuth, timestamp: now };
                    setupRefreshTimer(parsedAuth.expiresAt);
                    setAuthLoading(false);
                    return;
                }
            }

            // Nếu không còn user hợp lệ ở cả context và sessionStorage
            console.log("❌ No valid auth or token found");
            setAuth(null);
            sessionStorage.removeItem("auth");
            setAuthError("Please log in to continue");
            setAuthLoading(false);
            return;
        } finally {
            isVerifyingRef.current = false;
        }
    }, [auth, isPublicRoute, location.pathname, setupRefreshTimer]);

    useEffect(() => {
        verifyAuth();
        return () => {
            if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
        };
    }, [verifyAuth]);

    useEffect(() => {
        if (authError && !isPublicRoute(location.pathname) && !auth) {
            toast.error(authError || "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
            const returnUrl = location.pathname;
            navigate("/auth/login", {
                state: { reason: authError || "session_expired", returnUrl }
            });
        }
    }, [authError, location.pathname, navigate, isPublicRoute, auth]);

    const login = useCallback(async (credentials) => {
        setLoading(true);
        try {
            const res = await loginUser(credentials);
            if (res.message === "Đăng nhập thành công") {
                const user = await getCurrentUser();
                setAuth(user);
                sessionStorage.setItem("auth", JSON.stringify(user));
                userCacheRef.current = { data: user, timestamp: Date.now() };
                if (user.expiresAt) setupRefreshTimer(user.expiresAt);
                setAuthError(null);
                return user;
            }
            throw new Error(res.message || "Login failed");
        } catch (err) {
            setAuth(null);
            sessionStorage.removeItem("auth");
            setAuthError(err.message || "Login failed");
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setupRefreshTimer]);

    const logout = useCallback(async () => {
        setLoading(true);
        try {
            await logoutUser();
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
            refreshTimerRef.current = null;
            setAuth(null);
            sessionStorage.removeItem("auth");
            setCartItems([]);
            sessionStorage.clear();
            userCacheRef.current = { data: null, timestamp: 0 };
            navigate("/", { replace: true });
            setLoading(false);
        }
    }, [navigate]);

    const addToCart = useCallback((item) => {
        setCartItems((prev) => {
            const found = prev.find((i) => i.id === item.id);
            return found
                ? prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
                : [...prev, { ...item, quantity: 1 }];
        });
    }, []);

    const removeFromCart = useCallback((itemId) => {
        setCartItems((prev) => prev.filter((i) => i.id !== itemId));
    }, []);

    const updateCartItemQuantity = useCallback((itemId, quantity) => {
        quantity <= 0
            ? removeFromCart(itemId)
            : setCartItems((prev) =>
                prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
            );
    }, [removeFromCart]);

    useEffect(() => {
        sessionStorage.setItem("cartItems", JSON.stringify(cartItems));
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