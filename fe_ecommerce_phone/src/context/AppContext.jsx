import React, { createContext, useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    getCurrentUser,
    loginUser,
    logoutUser,
    refreshToken
} from "../api/apiAuth";

export const AppContext = createContext();

const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes
const USER_CACHE_DURATION = 60 * 1000; // Cache user for 60 seconds

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
    const userCacheRef = useRef({ data: null, timestamp: 0 }); // Added to fix undefined error

    const isPublicRoute = useCallback((pathname) => {
        const publicRoutes = [
            "/",
            "/auth/login",
            "/auth/register",
            "/auth/forgot-password",
            "/cart",
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
        let retryCount = 0;
        const maxRetries = 3;
        while (retryCount < maxRetries) {
            try {
                const result = await refreshToken();
                const now = Date.now();
                if (
                    userCacheRef.current.data &&
                    now - userCacheRef.current.timestamp < USER_CACHE_DURATION
                ) {
                    setAuth(userCacheRef.current.data);
                    if (userCacheRef.current.data.expiresAt) setupRefreshTimer(userCacheRef.current.data.expiresAt);
                    return true;
                }
                const user = await getCurrentUser();
                setAuth(user);
                sessionStorage.setItem("auth", JSON.stringify(user));
                userCacheRef.current = { data: user, timestamp: now };
                if (user.expiresAt) setupRefreshTimer(user.expiresAt);
                return true;
            } catch (error) {
                retryCount++;
                if (retryCount === maxRetries) {
                    console.error("Max retries reached for refresh token:", error);
                    setAuthError("Session expired. Please log in again.");
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }, [setupRefreshTimer]);

    const verifyAuth = useCallback(async () => {
        if (isVerifyingRef.current) return;
        isVerifyingRef.current = true;

        try {
            if (isPublicRoute(location.pathname)) {
                if (auth) {
                    setAuthLoading(false);
                    return;
                }
                const storedAuth = sessionStorage.getItem("auth");
                if (storedAuth) {
                    const parsedAuth = JSON.parse(storedAuth);
                    const now = Date.now();
                    if (parsedAuth.expiresAt && new Date(parsedAuth.expiresAt) > new Date(now + TOKEN_REFRESH_BUFFER)) {
                        setAuth(parsedAuth);
                        userCacheRef.current = { data: parsedAuth, timestamp: now };
                        setupRefreshTimer(parsedAuth.expiresAt);
                    } else {
                        sessionStorage.removeItem("auth");
                    }
                }
                setAuthLoading(false);
                return;
            }

            const now = Date.now();
            if (
                userCacheRef.current.data &&
                now - userCacheRef.current.timestamp < USER_CACHE_DURATION
            ) {
                setAuth(userCacheRef.current.data);
                if (userCacheRef.current.data.expiresAt) setupRefreshTimer(userCacheRef.current.data.expiresAt);
                setAuthLoading(false);
                return;
            }

            if (auth && auth.expiresAt && new Date(auth.expiresAt) > new Date(now + TOKEN_REFRESH_BUFFER)) {
                userCacheRef.current = { data: auth, timestamp: now };
                setupRefreshTimer(auth.expiresAt);
                setAuthLoading(false);
                return;
            }

            const user = await getCurrentUser();
            setAuth(user);
            sessionStorage.setItem("auth", JSON.stringify(user));
            userCacheRef.current = { data: user, timestamp: now };
            if (user.expiresAt) setupRefreshTimer(user.expiresAt);
            setAuthError(null);
        } catch (error) {
            console.error("Verify auth error:", error);
            if (error.status === 401 || error.status === 403) {
                try {
                    await handleRefreshToken();
                    return;
                } catch (refreshError) {
                    setAuthError("Session expired. Please log in again.");
                    sessionStorage.removeItem("auth");
                    setAuth(null);
                }
            } else {
                setAuthError(error.message || "Session expired. Please log in again.");
            }
        } finally {
            isVerifyingRef.current = false;
            setAuthLoading(false);
        }
    }, [auth, location.pathname, isPublicRoute, setupRefreshTimer, handleRefreshToken]);

    useEffect(() => {
        verifyAuth();
        return () => {
            if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
        };
    }, [verifyAuth]);

    useEffect(() => {
        if (authError && !isPublicRoute(location.pathname)) {
            const returnUrl = location.pathname;
            navigate("/auth/login", {
                state: { reason: authError || "session_expired", returnUrl }
            });
        }
    }, [authError, location.pathname, navigate, isPublicRoute]);

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