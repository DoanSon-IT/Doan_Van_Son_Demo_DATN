import axiosInstance from "./axiosConfig";
import { getCurrentUser as authGetCurrentUser } from "./apiAuth";

const apiUser = {
    getAllUsers: async () => {
        try {
            return await axiosInstance.get("/users").then((res) => res.data);
        } catch (error) {
            throw new Error(error.response?.data?.message || "Lỗi khi tải danh sách người dùng");
        }
    },

    getAllCustomers: async () => {
        try {
            return await axiosInstance.get("/users/customers").then((res) => res.data);
        } catch (error) {
            throw new Error(error.response?.data?.message || "Lỗi khi tải danh sách khách hàng");
        }
    },

    deleteUser: async (userId) => {
        try {
            await axiosInstance.delete(`/users/${userId}`);
            console.log("✅ Xóa người dùng thành công: userId=", userId);
        } catch (error) {
            throw new Error(error.response?.data?.message || "Lỗi khi xóa người dùng");
        }
    },

    uploadAvatar: async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        try {
            const response = await axiosInstance.post("/users/me/avatar", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true
            });
            return response.data; // Trả về URL
        } catch (error) {
            throw new Error(error.response?.data?.message || "Không thể upload ảnh đại diện");
        }
    },

    updateLoyaltyPoints: async (customerId, points) => {
        try {
            return await axiosInstance.put(`/users/customers/${customerId}/loyalty-points`, points, { withCredentials: true }).then((res) => res.data);
        } catch (error) {
            throw new Error(error.response?.data?.message || "Lỗi khi cập nhật điểm tích lũy");
        }
    },

    deleteCustomer: async (customerId) => {
        try {
            await axiosInstance.delete(`/users/customers/${customerId}`, { withCredentials: true });
            console.log("✅ Xóa khách hàng thành công: customerId=", customerId);
        } catch (error) {
            throw new Error(error.response?.data?.message || "Lỗi khi xóa khách hàng");
        }
    },

    // Sử dụng lại hàm từ apiAuth để tránh trùng lặp
    getCurrentUser: authGetCurrentUser,

    updateCurrentUser: async (userData) => {
        try {
            return await axiosInstance.put("/users/me", userData, { withCredentials: true }).then((res) => res.data);
        } catch (error) {
            throw {
                ...error.response?.data || { message: "Không thể cập nhật thông tin người dùng" },
                status: error.response?.status
            };
        }
    },
};

export default apiUser;