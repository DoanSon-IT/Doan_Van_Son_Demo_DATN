// 📁 src/api/apiDiscount.js
import axios from "./axiosConfig";

// 🟢 Lấy toàn bộ mã giảm giá
export const getAllDiscounts = () => {
    return axios.get("/discounts");
};

// 🟢 Tạo mã mới
export const createDiscount = (data) => {
    return axios.post("/discounts", data);
};

// 🟢 Tìm theo mã code cụ thể
export const getDiscountByCode = (code) => {
    return axios.get(`/discounts/${code}`);
};

// 🟢 Xoá theo id
export const deleteDiscount = (id) => {
    return axios.delete(`/discounts/${id}`);
};

// 🟡 Cập nhật mã giảm giá theo ID
export const updateDiscount = (id, data) => {
    return axios.put(`/discounts/${id}`, data);
};

export const spinDiscount = () => {
    return axios.get("/discounts/spin");
};

export const getActiveDiscounts = (minPercentage = 0) => {
    return axios.get(`/discounts/active?minPercentage=${minPercentage}`);
};

export const applyDiscount = (payload) => {
    return axios.post("/discounts/apply-discount", payload);
};

