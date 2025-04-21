import axiosInstance from "./axiosConfig";

const apiPayment = {
    // Tạo thanh toán mới
    createPayment: async (orderId, paymentMethod) => {
        try {
            const paymentData = { orderId, method: paymentMethod };
            return await axiosInstance.post("/payments", paymentData, { withCredentials: true })
                .then((res) => res.data);
        } catch (error) {
            throw new Error(error.response?.data?.message || "Lỗi khi tạo thanh toán");
        }
    },

    // Lấy thông tin thanh toán theo orderId
    getPayment: async (orderId) => {
        try {
            return await axiosInstance.get(`/payments/${orderId}`, { withCredentials: true })
                .then((res) => res.data);
        } catch (error) {
            const message = error.response?.status === 401 ? "Vui lòng đăng nhập lại!" :
                error.response?.status === 403 ? "Bạn không có quyền truy cập!" :
                    error.response?.status === 404 ? "Không tìm thấy thông tin thanh toán!" :
                        error.response?.data?.message || "Lỗi khi tải thông tin thanh toán";
            throw new Error(message);
        }
    },

    // Lấy thông tin thanh toán theo mã giao dịch
    getPaymentByTransaction: async (txnRef) => {
        try {
            console.log("Fetching payment data for transaction:", txnRef);
            const response = await axiosInstance.get(`/payments/by-transaction/${txnRef}`, { withCredentials: true });
            console.log("Payment data response:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching payment:", error.response || error);
            const message = error.response?.status === 401 ? "Vui lòng đăng nhập lại!" :
                error.response?.status === 403 ? "Bạn không có quyền truy cập!" :
                    error.response?.status === 404 ? "Không tìm thấy thông tin thanh toán!" :
                        error.response?.data?.message || "Lỗi khi tải thông tin thanh toán";
            throw new Error(message);
        }
    },

    // Lấy URL thanh toán
    getPaymentUrl: async (orderId) => {
        try {
            return await axiosInstance.get(`/payments/url/${orderId}`, { withCredentials: true })
                .then((res) => res.data);
        } catch (error) {
            const message = error.response?.status === 401 ? "Vui lòng đăng nhập lại!" :
                error.response?.status === 403 ? "Bạn không có quyền truy cập!" :
                    error.response?.status === 404 ? "Không tìm thấy URL thanh toán hoặc đơn hàng!" :
                        error.response?.data?.message || "Lỗi khi lấy URL thanh toán";
            throw new Error(message);
        }
    },

    // Cập nhật trạng thái thanh toán (chỉ dành cho ADMIN)
    updatePaymentStatus: async (orderId, status, transactionId) => {
        try {
            const updateData = { status, transactionId };
            return await axiosInstance.put(`/payments/${orderId}`, updateData, { withCredentials: true })
                .then((res) => res.data);
        } catch (error) {
            const message = error.response?.status === 401 ? "Vui lòng đăng nhập lại!" :
                error.response?.status === 403 ? "Bạn không có quyền cập nhật!" :
                    error.response?.data?.message || "Lỗi khi cập nhật trạng thái thanh toán";
            throw new Error(message);
        }
    }
};

export default apiPayment;