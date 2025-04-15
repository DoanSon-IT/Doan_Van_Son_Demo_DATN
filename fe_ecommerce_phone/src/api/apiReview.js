import axios from "./axiosConfig";

export const addReview = async (data) => {
    const response = await axios.post("/reviews", data);
    return response.data;
};

export const getPagedReviews = async (productId, page = 0, size = 5, sortBy = "createdAt", direction = "desc") => {
    const response = await axios.get(`/reviews/product/${productId}/paged`, {
        params: { page, size, sortBy, direction },
    });
    return response.data;
};
