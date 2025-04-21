import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, MessageCircle, Send, X, ExternalLink, User, MessageSquare, Headphones } from "lucide-react";
import apiChat from "../../api/apiChat";
import apiProduct from "../../api/apiProduct";
import parse from "html-react-parser";

const SmartChatCenter = ({ userId }) => {
    const navigate = useNavigate();
    const [mode, setMode] = useState("ai");
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [productsCache, setProductsCache] = useState({});
    const [loadingProductIds, setLoadingProductIds] = useState(new Set());
    const [error, setError] = useState(null);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    const isGuest = userId === -1;

    const formatCurrency = (amount) => {
        if (!amount) return "N/A";
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const fetchProductDetails = useCallback(async (productId) => {
        if (productsCache[productId] || loadingProductIds.has(productId)) return;
        setLoadingProductIds((prev) => new Set(prev).add(productId));
        try {
            const data = await apiProduct.getProductById(productId);
            setProductsCache((prev) => ({ ...prev, [productId]: data }));
        } catch (err) {
            setError(err.response?.data?.message || "Không tìm thấy sản phẩm");
        } finally {
            setLoadingProductIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(productId);
                return newSet;
            });
        }
    }, [productsCache, loadingProductIds]);

    useEffect(() => {
        if (!isOpen) return;

        if (mode === "ai") {
            const aiHistoryKey = userId === -1 ? "chatbot_guest_history" : `chatbot_history_${userId}`;
            const history = JSON.parse(localStorage.getItem(aiHistoryKey)) || [];
            const filteredHistory = history.filter(msg => {
                if (msg.productId && !/^\d+$/.test(String(msg.productId))) {
                    console.log("Lọc bỏ tin nhắn với productId không hợp lệ:", msg);
                    return false;
                }
                if (msg.productIds && !msg.productIds.every(id => /^\d+$/.test(String(id)))) {
                    console.log("Lọc bỏ tin nhắn với productIds không hợp lệ:", msg);
                    return false;
                }
                return true;
            });
            if (filteredHistory.length === 0) {
                const welcome = {
                    sender: "bot",
                    content: "🌟 Em là trợ lý AI tại DsonStore. Anh/chị đang tìm dòng điện thoại nào ạ?"
                };
                setMessages([welcome]);
                localStorage.setItem(aiHistoryKey, JSON.stringify([welcome]));
            } else {
                setMessages(filteredHistory);
            }
        } else {
            if (isGuest) {
                setMessages([{ sender: "agent", content: "🔒 Vui lòng đăng nhập để chat với nhân viên." }]);
            } else {
                apiChat.getMyChatHistory().then(data => {
                    const mapped = data.map(msg => ({
                        sender: msg.senderId === 0 ? "agent" : "user",
                        content: msg.content,
                        timestamp: msg.timestamp,
                        productIds: msg.productIds
                    }));
                    setMessages(mapped);
                }).catch(() => {
                    setMessages([{ sender: "agent", content: "❌ Lỗi khi tải lịch sử chat. Vui lòng thử lại." }]);
                });
            }
        }

        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    }, [isOpen, mode, isGuest, userId]);

    useEffect(() => {
        const productIds = messages
            .flatMap(msg => msg.productIds || (msg.productId ? [msg.productId] : []))
            .filter(id => {
                const idStr = String(id);
                return (
                    !productsCache[id] &&
                    !loadingProductIds.has(id) &&
                    /^\d+$/.test(idStr)
                );
            });
        productIds.forEach(fetchProductDetails);
    }, [messages, productsCache, loadingProductIds, fetchProductDetails]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const renderProductCard = (productId) => {
        const productDetails = productsCache[productId];
        if (loadingProductIds.has(productId)) return <div className="text-gray-500">Đang tải sản phẩm...</div>;
        if (error && !productDetails) return <div className="text-red-500">Lỗi: {error}</div>;
        if (!productDetails) return null;

        const currentPrice = productDetails.discountedPrice || productDetails.sellingPrice;
        const discount = productDetails.discountedPrice && productDetails.sellingPrice
            ? `${Math.round(((productDetails.sellingPrice - productDetails.discountedPrice) / productDetails.sellingPrice) * 100)}%`
            : null;
        const hasRating = productDetails.ratingCount && productDetails.ratingCount > 0;

        return (
            <div className="mt-3 bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div
                    onClick={() => navigate(`/products/${productId}`)}
                    className="flex items-center p-2 gap-3 cursor-pointer"
                >
                    <div className="w-20 h-20 flex-shrink-0 bg-gray-50 rounded-md overflow-hidden">
                        <img
                            src={productDetails.images?.[0]?.imageUrl || "/api/placeholder/150/150"}
                            alt={productDetails.name}
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate hover:text-blue-600 transition-colors">
                            {productDetails.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-red-600 font-semibold">{formatCurrency(currentPrice)}</span>
                            {discount && (
                                <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                                    -{discount}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center text-xs text-amber-500 mt-1">
                            <span className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <svg
                                        key={i}
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`h-3 w-3 ${i < Math.floor(productDetails.rating || 0) ? "fill-current" : "fill-gray-300"}`}
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </span>
                            <span className="ml-1 text-gray-600">
                                {hasRating ? `${productDetails.rating.toFixed(1)} (${productDetails.ratingCount})` : "Chưa có đánh giá"}
                            </span>
                        </div>
                    </div>
                    <ExternalLink size={16} className="text-blue-500 flex-shrink-0" />
                </div>
            </div>
        );
    };

    const renderWithMultipleProducts = (content, productIds = []) => (
        <div>
            <div className="mb-1">{parse(content)}</div>
            {productIds.map(pid => (
                <div key={pid}>{renderProductCard(pid)}</div>
            ))}
        </div>
    );

    const parseChatMessage = (message) => {
        if (message.productIds && message.productIds.length > 0) {
            return renderWithMultipleProducts(message.content, message.productIds);
        } else if (message.productId) {
            return renderWithMultipleProducts(message.content, [message.productId]);
        }

        return parse(message.content);
    };

    const sendMessage = async () => {
        if (!input.trim()) return;
        const userMsg = { sender: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        if (mode === "ai") {
            try {
                const res = await apiChat.askBot(userId, input);
                const botMsg = {
                    sender: "bot",
                    content: res.reply,
                    productIds: Array.isArray(res.productIds)
                        ? res.productIds.filter(id => /^\d+$/.test(String(id)))
                        : res.productId && /^\d+$/.test(String(res.productId))
                            ? [res.productId]
                            : []
                };

                setMessages(prev => [...prev, botMsg]);

                const aiHistoryKey = userId === -1 ? "chatbot_guest_history" : `chatbot_history_${userId}`;
                const updated = [...messages, userMsg, botMsg];
                localStorage.setItem(aiHistoryKey, JSON.stringify(updated));
            } catch (e) {
                setMessages(prev => [...prev, {
                    sender: "bot",
                    content: "❌ Lỗi khi gọi trợ lý. Vui lòng thử lại."
                }]);
            } finally {
                setLoading(false);
            }
        } else {
            if (isGuest) {
                setMessages(prev => [...prev, {
                    sender: "agent",
                    content: "🔒 Vui lòng đăng nhập để chat với nhân viên."
                }]);
                setLoading(false);
            } else {
                try {
                    const res = await apiChat.sendMessageToAgent(input);
                    setMessages(prev => [...prev, {
                        sender: "user",
                        content: res.content,
                        timestamp: res.timestamp
                    }]);
                    const history = await apiChat.getMyChatHistory();
                    const mapped = history.map(msg => ({
                        sender: msg.senderId === 0 ? "agent" : "user",
                        content: msg.content,
                        timestamp: msg.timestamp,
                        productIds: msg.productIds
                    }));
                    setMessages(mapped);
                } catch (e) {
                    setMessages(prev => [...prev, {
                        sender: "agent",
                        content: "❌ Lỗi khi gửi tin nhắn. Vui lòng thử lại."
                    }]);
                } finally {
                    setLoading(false);
                }
            }
        }
    };

    const getMessageTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-24 right-5 p-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-blue-200 transition-all hover:scale-105 z-[101]"
                    aria-label="Mở hộp chat"
                >
                    <MessageCircle size={24} className="drop-shadow-sm" />
                </button>
            )}

            {isOpen && (
                <div className="fixed bottom-5 right-5 w-[525px] sm:w-[570px] md:w-[630px] max-h-[90vh] bg-white rounded-2xl border border-gray-200 shadow-2xl flex flex-col z-[101] animate-slide-up overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <div className="font-semibold flex items-center gap-2">
                            <span>💬 Chat với DsonStore</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setMode("ai")}
                                className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${mode === "ai"
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "bg-blue-600/30 text-white hover:bg-blue-500/50"}`}
                                aria-label="Chat với AI"
                            >
                                <div className="flex items-center gap-1">
                                    <MessageSquare size={14} />
                                    <span>AI</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setMode("agent")}
                                className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${mode === "agent"
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "bg-blue-600/30 text-white hover:bg-blue-500/50"}`}
                                aria-label="Chat với nhân viên"
                            >
                                <div className="flex items-center gap-1">
                                    <Headphones size={14} />
                                    <span>Nhân viên</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/90 hover:text-white p-1 rounded-full hover:bg-blue-500/40 transition-colors"
                                aria-label="Đóng hộp chat"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 text-sm bg-gradient-to-b from-blue-50 to-white">
                        {messages.map((msg, idx) => {
                            const isUser = msg.sender === "user";
                            const isAgent = msg.sender === "agent";
                            const isBot = msg.sender === "bot";

                            return (
                                <div
                                    key={idx}
                                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                                >
                                    {!isUser && (
                                        <div className="flex items-center justify-center h-8 w-8 rounded-full mr-2 flex-shrink-0">
                                            {isBot ? (
                                                <div className="bg-blue-100 rounded-full p-1.5">
                                                    <MessageSquare size={18} className="text-blue-600" />
                                                </div>
                                            ) : (
                                                <div className="bg-green-100 rounded-full p-1.5">
                                                    <Headphones size={18} className="text-green-600" />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                                        <div
                                            className={`chat-message [&_a]:text-blue-600 [&_a]:hover:underline [&_img]:!max-w-[150px] [&_img]:!max-h-[150px] [&_img]:!object-contain [&_img]:!rounded-md [&_img]:!border [&_img]:!border-gray-200 [&_img]:!shadow-sm px-4 py-3 rounded-2xl max-w-[85%] whitespace-pre-line ${isUser
                                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-tr-none shadow-sm"
                                                : isAgent
                                                    ? "bg-gradient-to-r from-green-50 to-green-100 text-gray-800 rounded-tl-none border border-green-200"
                                                    : "bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-sm"
                                                }`}
                                        >
                                            {parseChatMessage(msg)}
                                        </div>

                                        {msg.timestamp && (
                                            <span className="text-xs text-gray-500 mt-1 mx-2">
                                                {getMessageTime(msg.timestamp)}
                                            </span>
                                        )}
                                    </div>

                                    {isUser && (
                                        <div className="flex items-center justify-center h-8 w-8 rounded-full ml-2 bg-gray-100 flex-shrink-0">
                                            <User size={16} className="text-gray-500" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {loading && (
                            <div className="flex justify-start items-center gap-2">
                                <div className="flex items-center justify-center h-8 w-8 rounded-full mr-2">
                                    {mode === "ai" ? (
                                        <div className="bg-blue-100 rounded-full p-1.5">
                                            <MessageSquare size={18} className="text-blue-600" />
                                        </div>
                                    ) : (
                                        <div className="bg-green-100 rounded-full p-1.5">
                                            <Headphones size={18} className="text-green-600" />
                                        </div>
                                    )}
                                </div>
                                <div className="bg-white px-4 py-3 rounded-2xl text-gray-500 border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                                        </div>
                                        <span className="text-xs">Đang trả lời...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    <div className="border-t bg-white p-3 flex items-center gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            className="flex-1 border border-gray-200 bg-gray-50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder={`${mode === "ai" ? "Hỏi trợ lý AI..." : "Nhắn tin cho nhân viên..."}`}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        />
                        <button
                            onClick={sendMessage}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-2.5 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
                            disabled={loading}
                            aria-label="Gửi tin nhắn"
                        >
                            {loading ?
                                <Loader2 className="animate-spin" size={20} /> :
                                <Send size={20} className="transform translate-x-0.5" />
                            }
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default SmartChatCenter;