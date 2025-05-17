import axiosInstance, { publicAxiosInstance } from "./axiosConfig";
import apiInventory from "./apiInventory";

const apiProduct = {
    getAllProducts: async (searchKeyword = "", page = 0, size = 10) => {
        const response = await publicAxiosInstance.get("/products", {
            params: { searchKeyword, page, size }
        });
        return response.data;
    },

    getNewestProducts: async (limit = 5) => {
        const response = await publicAxiosInstance.get("/products/newest", {
            params: { limit }
        });
        return response.data;
    },

    getBestSellingProducts: async (limit = 5) => {
        const response = await publicAxiosInstance.get("/products/bestselling", {
            params: { limit }
        });
        return response.data;
    },

    getProductById: async (id) => {
        const response = await publicAxiosInstance.get(`/products/${id}`);
        return response.data;
    },

    getFeaturedProducts: async (limit = 5) => {
        const response = await publicAxiosInstance.get("/products/featured", {
            params: { limit }
        });
        return response.data;
    },

    getRelatedProducts: async (id, limit = 5) => {
        const response = await publicAxiosInstance.get(`/products/${id}/related`, {
            params: { limit }
        });
        return response.data;
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
            const f = filtersOrKeyword;
            params = {
                searchKeyword: f.searchKeyword || "",
                sortBy: f.sortBy || "",
                page: f.page ?? 0,
                size: f.size ?? 10,
            };

            if (f.minPrice !== "" && f.minPrice !== null && !isNaN(f.minPrice)) {
                params.minPrice = Number(f.minPrice);
            }

            if (f.maxPrice !== "" && f.maxPrice !== null && !isNaN(f.maxPrice)) {
                params.maxPrice = Number(f.maxPrice);
            }
        } else {
            params = {
                searchKeyword: filtersOrKeyword || "",
                sortBy,
                page,
                size,
            };

            if (minPrice !== "" && minPrice !== null && !isNaN(minPrice)) {
                params.minPrice = Number(minPrice);
            }

            if (maxPrice !== "" && maxPrice !== null && !isNaN(maxPrice)) {
                params.maxPrice = Number(maxPrice);
            }
        }

        const response = await publicAxiosInstance.get("/products/filtered", { params });
        return response.data;
    },

    createProduct: async (productData) => {
        const response = await axiosInstance.post("/products", productData);
        return response.data;
    },

    updateProduct: async (id, productData) => {
        const response = await axiosInstance.put(`/products/${id}`, productData);

        if (productData.stock !== undefined) {
            const currentInventory = await apiInventory.getInventoryByProduct(id);
            const currentStock = currentInventory.quantity || 0;
            const quantityChange = productData.stock - currentStock;
            if (quantityChange !== 0) {
                await apiInventory.adjustInventory(id, quantityChange, "Cập nhật sản phẩm");
            }
        }

        return response.data;
    },

    deleteProduct: async (id) => {
        const response = await axiosInstance.delete(`/products/${id}`);
        return response.status === 204;
    },

    uploadProductImage: async (productId, files) => {
        const formData = new FormData();

        files.forEach((file) => {
            formData.append("files", file);
        });

        const response = await axiosInstance.post(`/products/${productId}/images`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        return response.data;
    },

    deleteProductImage: async (imageId) => {
        const response = await axiosInstance.delete(`/products/images/${imageId}`);
        return response.status === 204;
    },

    applyDiscountToAll: async ({ percentage, fixedAmount, startDateTime, endDateTime }) => {
        const response = await axiosInstance.post("/products/discount/all", null, {
            params: { percentage, fixedAmount, startDateTime, endDateTime }
        });
        return response.data;
    },

    applyDiscountToSelected: async ({ productIds, percentage, fixedAmount, startDateTime, endDateTime }) => {
        const response = await axiosInstance.post("/products/discount/selected", productIds, {
            params: { percentage, fixedAmount, startDateTime, endDateTime }
        });
        return response.data;
    },
};

export default apiProduct;