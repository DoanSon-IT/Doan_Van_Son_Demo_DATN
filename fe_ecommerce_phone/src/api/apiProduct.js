import axiosInstance from "./axiosConfig";
import apiInventory from "./apiInventory";

const apiProduct = {
    getAllProducts: async (searchKeyword = "", page = 0, size = 10) => {
        try {
            return await axiosInstance.get("/products", {
                params: { searchKeyword, page, size }
            }).then((res) => res.data);
        } catch (error) {
            throw new Error(error.response?.data?.message || "Lỗi khi lấy danh sách sản phẩm");
        }
    },

    getNewestProducts: async () =>
        axiosInstance.get("/products/newest").then((res) => res.data),

    getBestSellingProducts: async () =>
        axiosInstance.get("/products/bestselling").then((res) => res.data),

    getProductById: async (id) =>
        axiosInstance.get(`/products/${id}`).then((res) => res.data),

    getFeaturedProducts: async () => {
        return await axiosInstance.get("/products/featured").then((res) => res.data);
    },

    getFilteredProducts: async (
        filtersOrKeyword = "",
        minPrice = null,
        maxPrice = null,
        sortBy = "",
        page = 0,
        size = 10
    ) => {
        let params;

        if (typeof filtersOrKeyword === "object") {
            // Gọi từ admin (ProductManagement)
            const f = filtersOrKeyword;
            params = {
                searchKeyword: f.searchKeyword || "",
                minPrice: f.minPrice || null,
                maxPrice: f.maxPrice || null,
                sortBy: f.sortBy || "",
                page: f.page ?? 0,
                size: f.size ?? 10,
            };
        } else {
            // Gọi từ trang tìm kiếm khách hàng
            params = {
                searchKeyword: filtersOrKeyword || "",
                minPrice,
                maxPrice,
                sortBy,
                page,
                size,
            };
        }

        return await axiosInstance
            .get("/products/filtered", { params })
            .then((res) => res.data);
    },

    createProduct: async (productData) => {
        try {
            const response = await axiosInstance.post("/products", productData).then((res) => res.data);
            if (productData.stock !== undefined) {
                await apiInventory.updateInventory(response.id, productData.stock, "Khởi tạo sản phẩm");
            }
            return response;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Lỗi khi tạo sản phẩm");
        }
    },

    updateProduct: async (id, productData) => {
        try {
            console.log("Sending PUT request to:", `/products/${id}`, "with data:", productData);
            const response = await axiosInstance.put(`/products/${id}`, productData);
            console.log("Response from server:", response.data);
            if (productData.stock !== undefined) {
                // Lấy thông tin tồn kho hiện tại để tính quantityChange
                const currentInventory = await apiInventory.getInventoryByProduct(id);
                const currentStock = currentInventory.quantity || 0;
                const quantityChange = productData.stock - currentStock;
                if (quantityChange !== 0) { // Chỉ điều chỉnh nếu có thay đổi
                    await apiInventory.adjustInventory(id, quantityChange, "Cập nhật sản phẩm");
                }
            }
            return response.data;
        } catch (error) {
            console.log("Axios Error:", error);
            throw new Error(error.response?.data?.message || "Lỗi khi cập nhật sản phẩm");
        }
    },

    deleteProduct: async (id) => {
        try {
            return await axiosInstance.delete(`/products/${id}`).then((res) => res.data);
        } catch (error) {
            throw new Error(error.response?.data?.message || "Lỗi khi xóa sản phẩm");
        }
    },

    applyDiscountToAll: async ({ percentage, fixedAmount, startDateTime, endDateTime }) => {
        try {
            return await axiosInstance.post("/products/discount/all", null, {
                params: { percentage, fixedAmount, startDateTime, endDateTime },
            }).then((res) => res.data);
        } catch (error) {
            console.error("Error applying discount to all:", error);
            throw new Error(error.response?.data?.message || "Lỗi khi giảm giá tất cả sản phẩm");
        }
    },

    applyDiscountToSelected: async ({ productIds, percentage, fixedAmount, startDateTime, endDateTime }) => {
        try {
            return await axiosInstance.post("/products/discount/selected", productIds, {
                params: { percentage, fixedAmount, startDateTime, endDateTime },
            }).then((res) => res.data);
        } catch (error) {
            console.error("Error applying discount to selected:", error);
            throw new Error(error.response?.data?.message || "Lỗi khi giảm giá các sản phẩm đã chọn");
        }
    },
};

export default apiProduct;