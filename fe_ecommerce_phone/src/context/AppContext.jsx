import React, { createContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser, logoutUser, loginUser, refreshToken } from "../api/apiAuth";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [auth, setAuth] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [cartItems, setCartItems] = useState(() => {
        const storedCart = localStorage.getItem("cartItems");
        return storedCart ? JSON.parse(storedCart) : [];
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const publicRoutes = [
        "/", "/products", "/about", "/contact", "/category/:id",
        "/products/:id", "/cart", "/search",
        "/auth/login", "/auth/register", "/auth/forgot-password"
    ];

    const adminRoutes = [
        "/admin/dashboard", "/admin/products", "/admin/orders",
        "/admin/customers", "/admin/categories", "/admin/suppliers",
        "/admin/employees", "/admin/report", "/admin/inventory", "/admin/chat"
    ];

    const verifyAuth = async () => {
        const currentPath = location.pathname;

        const isPublic = publicRoutes.some(route =>
            currentPath === route || currentPath.startsWith(route.replace(":id", ""))
        );

        const isAdmin = adminRoutes.some(route =>
            currentPath.startsWith(route)
        );

        // Nếu là public route và không phải trang admin → bỏ qua xác thực
        if (isPublic && !isAdmin) {
            setAuthLoading(false);
            return;
        }

        // Đã ở trang đăng nhập, đăng ký → không cần gọi xác thực nữa
        if (["/auth/login", "/auth/register", "/auth/forgot-password"].includes(currentPath)) {
            setAuthLoading(false);
            return;
        }

        // Các route còn lại cần phải kiểm tra xác thực
        setAuthLoading(true);
        try {
            const user = await getCurrentUser();
            setAuth(user);
        } catch (error) {
            try {
                const refreshResult = await refreshToken();
                setAuth(refreshResult.user);
            } catch (refreshError) {
                console.error("Refresh thất bại:", refreshError);
                setAuth(null);
                navigate("/auth/login", { state: { reason: "token_expired" } });
            }
        } finally {
            setAuthLoading(false);
        }
    };

    useEffect(() => {
        verifyAuth();
    }, [location.pathname]); // Chạy lại khi thay đổi route

    const login = async (credentials) => {
        setLoading(true);
        try {
            const loginResponse = await loginUser(credentials);
            if (loginResponse.message === "Đăng nhập thành công") {
                const user = await getCurrentUser();
                if (user) {
                    setAuth(user);
                    return user;
                } else {
                    throw new Error("Không thể lấy thông tin người dùng sau khi đăng nhập!");
                }
            } else {
                throw new Error(loginResponse.message || "Đăng nhập thất bại!");
            }
        } catch (error) {
            console.error("Login error:", error);
            setAuth(null);
            throw error; // Ném lỗi ra ngoài để Login.jsx xử lý
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await logoutUser();
            setAuth(null);
            setCartItems([]);
            localStorage.clear();
            sessionStorage.clear();
            navigate("/", { replace: true });
        } catch (error) {
            console.error("Lỗi khi đăng xuất:", error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (item) => {
        setCartItems((prev) => {
            const existingItem = prev.find((i) => i.id === item.id);
            return existingItem
                ? prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
                : [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId) => {
        setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    };

    const updateCartItemQuantity = (itemId, quantity) => {
        quantity <= 0
            ? removeFromCart(itemId)
            : setCartItems((prev) =>
                prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
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
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export default AppContext;
