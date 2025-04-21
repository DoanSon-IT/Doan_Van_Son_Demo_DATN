import axios from "axios";

const API_URL = import.meta.env.DEV
    ? "/api"
    : import.meta.env.VITE_API_URL ?? "https://backend.dsonmobile.shop/api";

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

const refreshAxios = axios.create({
    baseURL: API_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

const refreshTokenRequest = async () => {
    try {
        const response = await refreshAxios.post("/auth/refresh-token");
        return response.data;
    } catch (error) {
        console.error("Refresh token failed:", error);
        throw error;
    }
};

axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes("/auth/refresh-token")
        ) {
            console.log(`Interceptor triggered for 401 on URL: ${originalRequest.url}, Method: ${originalRequest.method}`);
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => axiosInstance(originalRequest))
                    .catch(err => Promise.reject(err));
            }

            isRefreshing = true;
            try {
                await refreshTokenRequest();
                processQueue(null);
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                console.log(`Interceptor refresh failed for URL: ${originalRequest.url}`);
                processQueue(refreshError);
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;