import axiosInstance from "./axiosConfig";

const apiChat = {
    // 💬 Lấy lịch sử giữa khách hàng và hệ thống (cho admin xem)
    getChatHistory: async (customerId) => {
        try {
            const res = await axiosInstance.get("/chat/history", { params: { customerId } });
            return res.data;
        } catch {
            return [];
        }
    },

    // 💬 Lấy lịch sử chat của user đang đăng nhập
    getMyChatHistory: async () => {
        try {
            const res = await axiosInstance.get("/chat/my-history");
            return res.data;
        } catch {
            return [];
        }
    },

    // ✅ Đánh dấu 1 tin nhắn là đã đọc
    markAsRead: async (messageId) => {
        try {
            await axiosInstance.post("/chat/mark-as-read", null, { params: { messageId } });
            console.log(`✅ Tin nhắn ${messageId} đã được đánh dấu đã đọc.`);
        } catch (error) {
            console.error("❌ Lỗi khi đánh dấu tin nhắn:", error);
        }
    },

    // 🤖 Gửi câu hỏi tới chatbot AI
    askBot: async (userId, message) => {
        try {
            const res = await axiosInstance.post("/chatbot/ask", { userId, message });
            return res.data;
        } catch (error) {
            console.error("❌ Lỗi khi gọi chatbot:", error);
            return { reply: "Em xin lỗi, hiện tại đang lỗi kết nối đến trợ lý ảo." };
        }
    },

    // 📋 Lấy tất cả người dùng có lịch sử chat (admin)
    getAllChatUsers: async () => {
        try {
            const res = await axiosInstance.get("/chat/users");
            return res.data;
        } catch (err) {
            console.error("❌ Lỗi khi lấy danh sách người dùng chat:", err);
            return [];
        }
    },

    // 📤 Gửi tin nhắn từ admin/staff đến 1 khách hàng cụ thể
    sendMessageToCustomer: async (receiverId, message) => {
        try {
            const res = await axiosInstance.post("/chat/send-to-customer", null, {
                params: { receiverId, message }
            });
            return res.data;
        } catch (err) {
            console.error("❌ Lỗi khi gửi tin nhắn đến khách:", err);
            throw err;
        }
    },

    // 📤 Gửi tin nhắn từ khách hàng đến admin/staff
    sendMessageToAgent: async (message) => {
        try {
            const res = await axiosInstance.post("/chat/send-to-agent", null, {
                params: { message }
            });
            return res.data;
        } catch (err) {
            console.error("❌ Lỗi khi gửi tin nhắn đến nhân viên:", err);
            throw err;
        }
    },

    // 📊 Lấy số lượng tin nhắn chưa đọc (admin)
    getUnreadMessageCount: async () => {
        try {
            const res = await axiosInstance.get("/chat/unread-count");
            return res.data;
        } catch (err) {
            console.error("❌ Lỗi khi lấy số lượng tin nhắn chưa đọc:", err);
            return {};
        }
    },

    // 📸 Upload ảnh lên ô chat
    uploadImage: async (file) => {
        try {
            const formData = new FormData();
            formData.append("image", file);
            const res = await axiosInstance.post("/chat/upload-image", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            return res.data;
        } catch (err) {
            console.error("❌ Lỗi khi upload ảnh:", err);
            throw err;
        }
    }
};

export default apiChat;