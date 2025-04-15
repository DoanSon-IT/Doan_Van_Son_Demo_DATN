import axios from "axios";
import { refreshToken } from "./apiAuth";

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

axiosInstance.interceptors.response.use(
    response => response,
    error => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes("/auth/refresh-token")
        ) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        return axiosInstance(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            isRefreshing = true;

            return refreshToken()
                .then(res => {
                    const newToken = res.token;
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                    processQueue(null, newToken);
                    return axiosInstance(originalRequest);
                })
                .catch(refreshError => {
                    processQueue(refreshError, null);
                    return Promise.reject(refreshError); // Chỉ ném lỗi
                })
                .finally(() => {
                    isRefreshing = false;
                });
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
