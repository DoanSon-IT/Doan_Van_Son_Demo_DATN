import axiosInstance from "./axiosConfig";

// Đăng nhập
export const loginUser = async (credentials) => {
    try {
        const response = await axiosInstance.post("/auth/login", credentials, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Đăng nhập thất bại!" };
    }
};

// Đăng ký
export const registerUser = async (userData) => {
    try {
        const response = await axiosInstance.post("/auth/register", userData, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Đăng ký thất bại!" };
    }
};

export const verifyUser = async (token) => {
    try {
        const response = await axiosInstance.get(`/auth/verify?token=${token}`);
        return response.data;
    } catch (err) {
        if (err.response?.data?.message?.includes("xác minh")) {
            return err.response.data;
        }
        throw err;
    }
};


// Gửi email khôi phục mật khẩu
export const forgotPassword = async (email) => {
    try {
        const response = await axiosInstance.post("/auth/forgot-password", { email }, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Không thể gửi email khôi phục!" };
    }
};

// Đặt lại mật khẩu
export const resetPassword = async (token, newPassword) => {
    try {
        const response = await axiosInstance.post("/auth/reset-password", { token, newPassword }, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Không thể đặt lại mật khẩu!" };
    }
};

// Gửi lại email xác thực
export const resendVerification = async (email) => {
    try {
        const response = await axiosInstance.post("/auth/resend-verification", { email }, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Không thể gửi lại email xác thực!" };
    }
};

// Làm mới token
export const refreshToken = async () => {
    try {
        const response = await axiosInstance.post("/auth/refresh-token", null, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Không thể làm mới token!" };
    }
};

// Đăng xuất
export const logoutUser = async () => {
    try {
        const response = await axiosInstance.post("/auth/logout", null, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Không thể đăng xuất!" };
    }
};

// Kiểm tra cookie JWT
export const checkCookie = async () => {
    try {
        const response = await axiosInstance.get("/auth/check-cookie", { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Không thể kiểm tra cookie!" };
    }
};

// Lấy thông tin người dùng hiện tại
export const getCurrentUser = async () => {
    try {
        const response = await axiosInstance.get("/users/me", { withCredentials: true });
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            try {
                await refreshToken();
                const retryResponse = await axiosInstance.get("/users/me", { withCredentials: true });
                return retryResponse.data;
            } catch (refreshError) {
                window.location.href = "/auth/login";
                throw new Error("Phiên đăng nhập hết hạn!");
            }
        }
        throw error.response?.data || { message: "Không thể lấy thông tin người dùng!" };
    }
};
