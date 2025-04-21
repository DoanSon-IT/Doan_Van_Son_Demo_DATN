import axiosInstance from "./axiosConfig";
import { getCurrentUser as authGetCurrentUser } from "./apiAuth";

const apiUser = {

    getUsersPaged: async ({ keyword = "", page = 0, size = 10, sortBy = "id", sortDir = "asc" }) => {
        try {
            const res = await axiosInstance.get("/users", {
                params: { keyword, page, size, sortBy, sortDir },
                withCredentials: true,
            });
            return res.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Lỗi khi tải danh sách người dùng");
        }
    },

    getCustomersPaged: async ({ keyword = "", page = 0, size = 10, sortBy = "id", sortDir = "asc" }) => {
        try {
            const res = await axiosInstance.get("/users/customers", {
                params: { keyword, page, size, sortBy, sortDir },
                withCredentials: true,
            });
            return res.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Lỗi khi tải danh sách khách hàng");
        }
    },

    deleteUser: async (userId) => {
        try {
            await axiosInstance.delete(`/users/${userId}`);
        } catch (error) {
            throw new Error(error.response?.data?.message || "Lỗi khi xóa người dùng");
        }
    },

    deleteCustomer: async (customerId) => {
        try {
            await axiosInstance.delete(`/users/customers/${customerId}`);
        } catch (error) {
            throw new Error(error.response?.data?.message || "Lỗi khi xóa khách hàng");
        }
    },

    updateLoyaltyPoints: async (customerId, points) => {
        try {
            const res = await axiosInstance.put(
                `/users/customers/${customerId}/loyalty-points`,
                points,
                { withCredentials: true }
            );
            return res.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Lỗi khi cập nhật điểm tích lũy");
        }
    },

    uploadAvatar: async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await axiosInstance.post("/users/me/avatar", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            });
            return res.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Không thể upload ảnh đại diện");
        }
    },

    getCurrentUser: authGetCurrentUser,

    updateCurrentUser: async (userData) => {
        try {
            const res = await axiosInstance.put("/users/me", userData, {
                withCredentials: true,
            });
            return res.data;
        } catch (error) {
            throw {
                ...error.response?.data || { message: "Không thể cập nhật thông tin người dùng" },
                status: error.response?.status
            };
        }
    },
};

export default apiUser;
