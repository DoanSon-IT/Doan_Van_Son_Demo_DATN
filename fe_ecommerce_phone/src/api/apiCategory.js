import axiosInstance from "./axiosConfig";

const apiCategory = {
    getAllCategories: async () => {
        return axiosInstance
            .get("/categories", {
                withCredentials: true,
                headers: { "Cache-Control": "no-cache" }
            })
            .then((res) => res.data);
    },
    getProductsByCategoryId: async (id, params = {}) => {
        return axiosInstance
            .get(`/categories/${id}/products`, {
                withCredentials: true,
                headers: { "Cache-Control": "no-cache" },
                params: { ...params, t: Date.now() } // Anti-cache
            })
            .then((res) => res.data);
    },
    createCategory: async (name) => {
        return axiosInstance
            .post("/admin/categories", null, {
                params: { name },
                withCredentials: true,
                headers: { "Cache-Control": "no-cache" }
            })
            .then((res) => res.data);
    },
    updateCategory: async (id, name) => {
        return axiosInstance
            .put(`/admin/categories/${id}`, null, {
                params: { name },
                withCredentials: true,
                headers: { "Cache-Control": "no-cache" }
            })
            .then((res) => res.data);
    },
    deleteCategory: async (id) => {
        return axiosInstance
            .delete(`/admin/categories/${id}`, {
                withCredentials: true,
                headers: { "Cache-Control": "no-cache" }
            })
            .then((res) => res.data);
    },
};

export default apiCategory;