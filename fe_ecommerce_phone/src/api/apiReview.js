import axios from "./axiosConfig";

// Gửi đánh giá
export const addReview = async (data) => {
    const response = await axios.post("/reviews", data);
    return response.data;
};

export const getPagedReviews = async (
    productId,
    page = 0,
    size = 5,
    sortBy = "createdAt",
    direction = "desc"
) => {
    try {
        const response = await axios.get(`/reviews/product/${productId}`, {
            params: { page, size, sortBy, direction },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data || 'Lỗi khi lấy danh sách đánh giá');
    }
};

// Lấy điểm trung bình đánh giá của sản phẩm
export const getAverageRating = async (productId) => {
    const response = await axios.get(`/reviews/product/${productId}/average`);
    return response.data;
};

// Lấy tổng số lượt đánh giá của sản phẩm
export const getReviewCount = async (productId) => {
    const response = await axios.get(`/reviews/product/${productId}/count`);
    return response.data;
};