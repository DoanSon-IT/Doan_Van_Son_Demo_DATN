import axiosInstance from "./axiosConfig";

const apiPayment = {
    createPayment: async (orderId, paymentMethod) => {
        try {
            const paymentData = { orderId, paymentMethod };
            return await axiosInstance.post("/payments", paymentData, { withCredentials: true }).then((res) => res.data);
        } catch (error) {
            throw new Error(error.response?.data?.message || "Lỗi khi tạo thanh toán");
        }
    },

    getPayment: async (orderId) => {
        try {
            return await axiosInstance.get(`/payments/${orderId}`, { withCredentials: true }).then((res) => res.data);
        } catch (error) {
            const message = error.response?.status === 401 ? "Vui lòng đăng nhập lại!" :
                error.response?.status === 403 ? "Bạn không có quyền truy cập!" :
                    error.response?.status === 404 ? "Không tìm thấy thông tin thanh toán!" :
                        error.response?.data?.message || "Lỗi khi tải thông tin thanh toán";
            throw new Error(message);
        }
    },

    getPaymentByTransaction: async (txnRef) => {
        try {
            return await axiosInstance.get(`/payments/by-transaction/${txnRef}`, { withCredentials: true }).then((res) => res.data);
        } catch (error) {
            const message = error.response?.status === 401 ? "Vui lòng đăng nhập lại!" :
                error.response?.status === 403 ? "Bạn không có quyền truy cập!" :
                    error.response?.status === 404 ? "Không tìm thấy thông tin thanh toán!" :
                        error.response?.data?.message || "Lỗi khi tải thông tin thanh toán";
            throw new Error(message);
        }
    },

    getPaymentUrl: async (orderId) => {
        try {
            return await axiosInstance.get(`/payments/url/${orderId}`, { withCredentials: true }).then((res) => res.data);
        } catch (error) {
            const message = error.response?.status === 401 ? "Vui lòng đăng nhập lại!" :
                error.response?.status === 403 ? "Bạn không có quyền truy cập!" :
                    error.response?.status === 404 ? "Không tìm thấy URL thanh toán hoặc đơn hàng!" :
                        error.response?.data?.message || "Lỗi khi lấy URL thanh toán";
            throw new Error(message);
        }
    },
};

export default apiPayment;