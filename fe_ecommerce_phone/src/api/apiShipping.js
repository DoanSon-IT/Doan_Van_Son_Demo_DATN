import axiosInstance from "./axiosConfig";

const apiShipping = {
    estimateShipping: async (address, carrier) => {
        try {
            const response = await axiosInstance.post("/shipping/estimate", { address, carrier });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Lỗi khi tính phí giao hàng");
        }
    },
};

export default apiShipping;