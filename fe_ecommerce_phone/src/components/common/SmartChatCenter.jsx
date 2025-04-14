import { useEffect, useRef, useState } from "react";
import { Loader2, MessageCircle, Send } from "lucide-react";
import apiChat from "../../api/apiChat";
import parse from "html-react-parser"; // Thêm import

const SmartChatCenter = ({ userId }) => {
    const [mode, setMode] = useState("ai"); // ai | agent
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    const isGuest = userId === -1;

    useEffect(() => {
        if (!isOpen) return;

        if (mode === "ai") {
            const aiHistoryKey = userId === -1 ? "chatbot_guest_history" : `chatbot_history_${userId}`;
            const history = JSON.parse(localStorage.getItem(aiHistoryKey)) || [];
            console.log(`📜 Lịch sử tin nhắn (AI) từ localStorage (${aiHistoryKey}):`, history);
            if (history.length === 0) {
                const welcome = { sender: "bot", content: "🌟 Em là trợ lý AI tại DsonStore. Anh/chị đang tìm dòng điện thoại nào ạ?" };
                setMessages([welcome]);
                localStorage.setItem(aiHistoryKey, JSON.stringify([welcome]));
            } else {
                setMessages(history);
            }
        } else {
            if (isGuest) {
                setMessages([{ sender: "agent", content: "🔒 Vui lòng đăng nhập để chat với nhân viên." }]);
            } else {
                apiChat.getMyChatHistory().then(data => {
                    const mapped = data.map(msg => ({
                        sender: msg.senderId === 0 ? "agent" : "user",
                        content: msg.content,
                        timestamp: msg.timestamp
                    }));
                    console.log("📜 Lịch sử tin nhắn (Agent) từ API:", mapped);
                    setMessages(mapped);
                });
            }
        }
    }, [isOpen, mode, isGuest, userId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMsg = { sender: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        if (mode === "ai") {
            console.log("📤 Gửi tin nhắn đến AI:", input);
            try {
                const res = await apiChat.askBot(userId, input);
                console.log("📥 Phản hồi từ AI:", res);
                const botMsg = { sender: "bot", content: res.reply };
                setMessages(prev => [...prev, botMsg]);
                const aiHistoryKey = userId === -1 ? "chatbot_guest_history" : `chatbot_history_${userId}`;
                const updated = [...messages, userMsg, botMsg];
                localStorage.setItem(aiHistoryKey, JSON.stringify(updated));
                console.log(`💾 Lưu lịch sử tin nhắn (AI) vào localStorage (${aiHistoryKey}):`, updated);
            } catch (e) {
                setMessages(prev => [...prev, { sender: "bot", content: "❌ Lỗi khi gọi trợ lý. Vui lòng thử lại." }]);
            } finally {
                setLoading(false);
            }
        } else {
            if (isGuest) {
                setMessages(prev => [...prev, { sender: "agent", content: "🔒 Vui lòng đăng nhập để chat với nhân viên." }]);
                setLoading(false);
            } else {
                try {
                    const res = await apiChat.sendMessageToAgent(input);
                    setMessages(prev => [...prev, { sender: "user", content: res.content, timestamp: res.timestamp }]);
                    const history = await apiChat.getMyChatHistory();
                    const mapped = history.map(msg => ({
                        sender: msg.senderId === 0 ? "agent" : "user",
                        content: msg.content,
                        timestamp: msg.timestamp
                    }));
                    setMessages(mapped);
                } catch (e) {
                    setMessages(prev => [...prev, { sender: "agent", content: "❌ Lỗi khi gửi tin nhắn. Vui lòng thử lại." }]);
                } finally {
                    setLoading(false);
                }
            }
        }
    };

    const parseProductLink = (reply) => {
        const regex = /\(ID: (\d+)\)/;
        const match = reply.match(regex);
        if (match) {
            const productId = match[1];
            const contentWithoutLink = reply.replace(regex, ""); // Loại bỏ phần (ID: xxx)
            return (
                <div>
                    {parse(contentWithoutLink)} {/* Render nội dung HTML còn lại */}
                    <a
                        href={`/products/${productId}`}
                        className="text-blue-600 hover:underline mt-1 block"
                        onClick={(e) => {
                            e.preventDefault();
                            window.location.href = `/products/${productId}`; // Điều hướng
                        }}
                    >
                        Xem chi tiết sản phẩm
                    </a>
                </div>
            );
        }
        return parse(reply); // Render HTML nếu không có link
    };

    return (
        <>
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-24 right-5 p-4 rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 transition-colors z-[101]"
                >
                    <MessageCircle size={24} />
                </button>
            )}

            {isOpen && (
                <div className="w-[400px] md:w-[420px] max-h-[80vh] bg-white rounded-xl border border-gray-200 shadow-2xl flex flex-col z-[101] animate-slide-up">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
                        <div className="font-semibold text-gray-800 flex items-center gap-2">
                            <span>💬 Chat với DsonStore</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setMode("ai")}
                                className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${mode === "ai" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                            >
                                AI
                            </button>
                            <button
                                onClick={() => setMode("agent")}
                                className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${mode === "agent" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                            >
                                Nhân viên
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Khu vực tin nhắn */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm bg-gradient-to-b from-blue-50 to-gray-50">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`chat-message [&_img]:!max-w-[150px] [&_img]:!max-h-[150px] [&_img]:!object-contain [&_img]:!rounded-md [&_img]:!border [&_img]:!border-gray-200 [&_img]:!shadow-sm px-3 py-2 rounded-2xl max-w-[80%] whitespace-pre-line ${msg.sender === "user"
                                        ? "bg-blue-500 text-white rounded-tr-none"
                                        : msg.sender === "agent"
                                            ? "bg-green-100 text-gray-800 rounded-tl-none"
                                            : "bg-gray-100 text-gray-800 rounded-tl-none"
                                        }`}
                                >
                                    {parseProductLink(msg.content)}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 px-3 py-2 rounded-2xl text-gray-500 italic flex items-center gap-1">
                                    <Loader2 className="animate-spin" size={16} />
                                    Đang xử lý...
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Thanh nhập tin nhắn */}
                    <div className="border-t bg-white p-3 flex items-center gap-2">
                        <input
                            type="text"
                            className="flex-1 border-0 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập tin nhắn..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        />
                        <button
                            onClick={sendMessage}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors disabled:bg-gray-300"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default SmartChatCenter;