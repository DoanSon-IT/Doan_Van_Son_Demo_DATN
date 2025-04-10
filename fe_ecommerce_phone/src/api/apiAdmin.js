import axiosInstance from "./axiosConfig";

export const fetchDashboardStats = async (days = 7) => {
    try {
        const response = await axiosInstance.get("/admin/stats", { params: { days } });
        console.log("Dashboard Stats:", response.data); // Debug
        return response.data;
    } catch (error) {
        console.error("🚨 Lỗi API Dashboard Stats:", error.response?.data || error.message);
        return {
            totalRevenue: 0,
            totalOrders: 0,
            topSellingProductsCount: 0,
            newUsersCount: 0,
            revenueByTime: {},
            ordersByTime: {},
        };
    }
};

export const fetchRecentOrders = async (limit = 5) => {
    try {
        const response = await axiosInstance.get("/admin/recent-orders", { params: { limit } });
        console.log("Recent Orders:", response.data); // Debug
        return response.data;
    } catch (error) {
        console.error("🚨 Lỗi API Recent Orders:", error.response?.data || error.message);
        return [];
    }
};

export const fetchTopSellingProducts = async (limit = 5) => {
    try {
        const response = await axiosInstance.get("/admin/top-products", { params: { limit } });
        console.log("Top Products:", response.data); // Debug
        return response.data;
    } catch (error) {
        console.error("🚨 Lỗi API Top Products:", error.response?.data || error.message);
        return [];
    }
};

export const fetchRecentUsers = async (limit = 5) => {
    try {
        const response = await axiosInstance.get("/admin/recent-users", { params: { limit } });
        console.log("Recent Users:", response.data); // Debug
        return response.data;
    } catch (error) {
        console.error("🚨 Lỗi API Recent Users:", error.response?.data || error.message);
        return [];
    }
};

export const fetchTopSellingProductsDTO = async (startDate, endDate, limit = 5) => {
    try {
        const response = await axiosInstance.get("/admin/top-products-dto", {
            params: { startDate, endDate, limit },
        });
        console.log("Top Products DTO:", response.data); // Debug
        return response.data;
    } catch (error) {
        console.error("🚨 Lỗi API Top Products DTO:", error.response?.data || error.message);
        return [];
    }
};

export const fetchOrderCountByStatus = async () => {
    try {
        const response = await axiosInstance.get("/admin/orders-by-status");
        console.log("Order Status:", response.data); // Debug
        return response.data;
    } catch (error) {
        console.error("🚨 Lỗi API Order Status:", error.response?.data || error.message);
        return {};
    }
};

export const fetchLowStockProducts = async (threshold = 5) => {
    try {
        const response = await axiosInstance.get("/admin/low-stock", { params: { threshold } });
        console.log("Low Stock Products:", response.data); // Debug
        return response.data;
    } catch (error) {
        console.error("🚨 Lỗi API Low Stock:", error.response?.data || error.message);
        return [];
    }
};

export const fetchTotalProfit = async (days = 7) => {
    try {
        const response = await axiosInstance.get("/admin/profit", { params: { days } });
        console.log("Lợi nhuận:", response.data);
        return response.data;
    } catch (error) {
        console.error("🚨 Lỗi API Profit:", error.response?.data || error.message);
        return 0;
    }
};

export const fetchUsersByRegion = async () => {
    try {
        const response = await axiosInstance.get("/admin/users-by-region");
        console.log("📊 Users by Region:", response.data); // Debug log
        return response.data;
    } catch (error) {
        console.error("🚨 Lỗi API Users By Region:", error.response?.data || error.message);
        return {
            north: 0,
            central: 0,
            south: 0,
            foreign: 0
        };
    }
};

