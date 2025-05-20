import axios from "axios";

// Base URL config
const API_URL = import.meta.env.DEV
    ? "http://localhost:8080/api"
    : "https://backend.dsonmobile.shop/api";

console.log("🌐 API URL:", API_URL);
console.log("🌍 Environment:", import.meta.env.MODE);

// Create axios instance with default config
const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Create public axios instance for endpoints that don't require authentication
const publicAxiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Log request
axiosInstance.interceptors.request.use(
    config => {
        // Thêm timestamp để tránh cache
        if (config.method === 'get') {
            config.params = {
                ...config.params,
                _t: Date.now()
            };
        }

        // Log cookies for debugging
        console.log("🍪 Current cookies:", document.cookie);

        console.log("🚀 Request:", {
            url: config.url,
            method: config.method,
            headers: config.headers,
            withCredentials: config.withCredentials,
            cookies: document.cookie,
            baseURL: config.baseURL,
            fullURL: `${config.baseURL}${config.url}`
        });
        return config;
    },
    error => {
        console.error("❌ Request error:", error);
        return Promise.reject(error);
    }
);

// Queue và biến trạng thái refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

// Axios dùng để refresh token
const refreshAxios = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true
});

// Hàm gọi refresh token
const refreshTokenRequest = async () => {
    try {
        const refreshToken = document.cookie.split('; ').find(row => row.startsWith('refresh_token='))?.split('=')[1];
        if (!refreshToken) {
            console.warn("⚠️ Không có refresh_token, bỏ qua gọi refresh-token");
            throw new Error("No refresh token available");
        }

        console.log("🔄 Attempting to refresh token");
        const response = await refreshAxios.post("/auth/refresh-token");
        console.log("✅ Refresh token response:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Refresh token failed:", error);
        throw error;
    }
};

// Interceptor for handling responses
axiosInstance.interceptors.response.use(
    response => {
        // Log cookies after response
        console.log("🍪 Cookies after response:", document.cookie);

        console.log("✅ Response:", {
            url: response.config.url,
            status: response.status,
            headers: response.headers,
            data: response.data
        });
        return response;
    },
    async error => {
        console.error("❌ Response error:", {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers,
            message: error.message
        });

        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes("/auth/refresh-token") &&
            !originalRequest.url.includes("/products/featured") &&
            !originalRequest.url.includes("/products/filtered") &&
            !originalRequest.url.includes("/products/newest") &&
            !originalRequest.url.includes("/products/bestselling")
        ) {
            console.log(`🔄 Interceptor triggered for 401 on URL: ${originalRequest.url}`);
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => axiosInstance(originalRequest));
            }

            isRefreshing = true;
            try {
                await refreshTokenRequest();
                processQueue(null);
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                console.log(`❌ Refresh token failed for URL: ${originalRequest.url}`);
                processQueue(refreshError);
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// Add response interceptor for publicAxiosInstance
publicAxiosInstance.interceptors.response.use(
    response => {
        // Log cookies after response
        console.log("🍪 Cookies after public response:", document.cookie);

        console.log("✅ Public Response:", {
            url: response.config.url,
            status: response.status,
            headers: response.headers,
            data: response.data
        });
        return response;
    },
    error => {
        console.error("❌ Public Response error:", {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers,
            message: error.message
        });
        return Promise.reject(error);
    }
);

export { axiosInstance, publicAxiosInstance };
export default axiosInstance;