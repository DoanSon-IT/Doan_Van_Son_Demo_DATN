import axiosInstance from "./axiosConfig";

/**
 * Enhanced Report API Service using const-based object
 * Provides unified access to all reporting endpoints with improved error handling
 */
const apiReport = {
    async fetch(endpoint, params, responseType = "json") {
        try {
            const response = await axiosInstance.get(`/reports/${endpoint}`, {
                params,
                responseType,
            });
            console.log(`[apiReport] Response from ${endpoint}:`, response.data); // 🔍 log tại đây
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to fetch report data";
            console.error(`Report API Error (${endpoint}):`, error);
            throw new Error(errorMessage);
        }
    },

    getProfitStats(timeFrame, startDate, endDate) {
        return this.fetch("profit", { type: timeFrame, start: startDate, end: endDate });
    },

    getRevenue(startDateTime, endDateTime) {
        return this.fetch("revenue", { start: startDateTime, end: endDateTime });
    },

    getDailyRevenue(startDate, endDate) {
        return this.fetch("daily-revenue-optimized", { start: startDate, end: endDate });
    },

    getTopProducts(startDateTime, endDateTime, limit = 5) {
        return this.fetch("top-products", { start: startDateTime, end: endDateTime, limit });
    },

    getOrdersByStatus(startDateTime, endDateTime) {
        return this.fetch("orders-by-status", { start: startDateTime, end: endDateTime });
    },

    getLowStockProducts(threshold = 5) {
        return this.fetch("low-stock", { threshold });
    },

    getRevenueByCategory(startDate, endDate) {
        return this.fetch("revenue-by-category", { start: startDate, end: endDate });
    },

    exportPdf(startDateTime, endDateTime) {
        return this.fetch("export/pdf", { start: startDateTime, end: endDateTime }, "blob");
    },

    exportExcel(startDateTime, endDateTime) {
        return this.fetch("export/excel", { start: startDateTime, end: endDateTime }, "blob");
    },

    exportWord(startDateTime, endDateTime) {
        return this.fetch("export/word", { start: startDateTime, end: endDateTime }, "blob");
    }
};

export default apiReport;