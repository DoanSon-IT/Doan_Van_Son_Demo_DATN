import { useEffect, useState, useRef } from "react";
import apiChat from "../../api/apiChat";
import { Send, Smile, Image, Phone, Video, MoreHorizontal, Search, ArrowLeft, Paperclip, Mic, ThumbsUp, X, Check, CheckCheck } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { format } from "date-fns";
import vi from "date-fns/locale/vi";

const AdminChat = () => {
    const [customers, setCustomers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [unreadCount, setUnreadCount] = useState({});
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [hoveredMessageId, setHoveredMessageId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [typing, setTyping] = useState(false);
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [showUserInfo, setShowUserInfo] = useState(false);
    const [groupedMessages, setGroupedMessages] = useState([]);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const chatContainerRef = useRef(null);

    // Lấy danh sách khách hàng khi component mount
    useEffect(() => {
        const fetchCustomerList = async () => {
            try {
                const res = await apiChat.getAllChatUsers();
                setCustomers(res);
                const unread = await apiChat.getUnreadMessageCount();
                setUnreadCount(unread);
            } catch (error) {
                console.error("❌ Lỗi khi lấy danh sách khách hàng:", error);
            }
        };
        fetchCustomerList();

        // Giả lập thông báo tin nhắn mới
        const interval = setInterval(() => {
            setUnreadCount(prev => {
                const newUnread = { ...prev };
                const randomId = Math.floor(Math.random() * 5) + 1;
                if (randomId !== selectedUserId) {
                    newUnread[randomId] = (newUnread[randomId] || 0) + 1;
                }
                return newUnread;
            });
        }, 60000); // Mỗi 1 phút

        return () => clearInterval(interval);
    }, [selectedUserId]);

    // Lấy lịch sử chat khi chọn người dùng
    useEffect(() => {
        if (!selectedUserId) return;

        const fetchChatHistory = async () => {
            try {
                const res = await apiChat.getChatHistory(selectedUserId);
                setMessages(res);

                // Đánh dấu là đã đọc
                setUnreadCount(prev => ({
                    ...prev,
                    [selectedUserId]: 0
                }));

            } catch (error) {
                console.error("❌ Lỗi khi lấy lịch sử chat:", error);
            }
        };

        fetchChatHistory();
        setShowUserInfo(false);
    }, [selectedUserId]);

    // Cuộn xuống dưới khi có tin nhắn mới
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Nhóm tin nhắn theo ngày và người gửi
    useEffect(() => {
        const grouped = [];
        let currentDate = null;
        let currentSender = null;
        let currentGroup = [];

        messages.forEach((msg, index) => {
            const messageDate = msg.timestamp ? new Date(msg.timestamp).toDateString() : 'Unknown';

            // Nếu ngày thay đổi, thêm divider
            if (messageDate !== currentDate) {
                if (currentGroup.length > 0) {
                    grouped.push({
                        type: 'messages',
                        senderId: currentSender,
                        messages: currentGroup
                    });
                    currentGroup = [];
                }

                grouped.push({
                    type: 'date',
                    date: msg.timestamp ? new Date(msg.timestamp) : null
                });

                currentDate = messageDate;
                currentSender = msg.senderId;
            }

            // Nếu người gửi thay đổi, tạo nhóm mới
            if (msg.senderId !== currentSender) {
                if (currentGroup.length > 0) {
                    grouped.push({
                        type: 'messages',
                        senderId: currentSender,
                        messages: currentGroup
                    });
                    currentGroup = [];
                }
                currentSender = msg.senderId;
            }

            currentGroup.push(msg);

            // Nếu là tin nhắn cuối cùng
            if (index === messages.length - 1) {
                grouped.push({
                    type: 'messages',
                    senderId: currentSender,
                    messages: currentGroup
                });
            }
        });

        setGroupedMessages(grouped);
    }, [messages]);

    // Giả lập hiệu ứng typing
    useEffect(() => {
        if (selectedUserId) {
            const typingTimeout = setTimeout(() => {
                setTyping(false);
            }, 3000);

            return () => clearTimeout(typingTimeout);
        }
    }, [typing, selectedUserId]);

    const sendMessage = async () => {
        if (!input.trim() || !selectedUserId) return;

        try {
            const newMessage = await apiChat.sendMessageToCustomer(selectedUserId, input);
            setMessages(prev => [...prev, newMessage]);
            setInput("");
            setShowEmojiPicker(false);
            setShowAttachMenu(false);

            // Giả lập phản hồi từ người dùng
            setTimeout(() => {
                setTyping(true);

                setTimeout(() => {
                    const randomReplies = [
                        "Cảm ơn bạn đã phản hồi!",
                        "Tôi hiểu rồi, cảm ơn nhiều!",
                        "Vâng, tôi sẽ chờ thông tin từ bạn.",
                        "Tôi có thêm một câu hỏi nữa...",
                        "Chắc chắn rồi, tôi sẽ làm theo hướng dẫn của bạn."
                    ];

                    const replyMessage = {
                        id: Date.now(),
                        content: randomReplies[Math.floor(Math.random() * randomReplies.length)],
                        senderId: selectedUserId,
                        timestamp: new Date().toISOString(),
                        isRead: false,
                        senderAvatarUrl: customers.find(c => c.id === selectedUserId)?.avatarUrl
                    };

                    setMessages(prev => [...prev, replyMessage]);
                    setTyping(false);
                }, 2000 + Math.random() * 3000);
            }, 1000 + Math.random() * 2000);

        } catch (error) {
            console.error("❌ Lỗi khi gửi tin nhắn:", error);
        }
    };

    const handleEmojiClick = (emojiObject) => {
        setInput(prev => prev + emojiObject.emoji);
        setShowEmojiPicker(false);
        inputRef.current?.focus();
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const imageUrl = await apiChat.uploadImage(file);
            const newMessage = await apiChat.sendMessageToCustomer(
                selectedUserId,
                `<img src="${imageUrl}" alt="Uploaded image" class="max-w-[150px] max-h-[150px] object-contain rounded-md border border-gray-200 shadow-sm" />`
            );
            setMessages(prev => [...prev, newMessage]);
            setShowAttachMenu(false);
        } catch (error) {
            console.error("❌ Lỗi khi gửi ảnh:", error);
        }
    };

    const sendThumbsUp = async () => {
        try {
            const thumbsUpContent = `<div class="text-4xl">👍</div>`;
            const newMessage = await apiChat.sendMessageToCustomer(selectedUserId, thumbsUpContent);
            setMessages(prev => [...prev, newMessage]);
        } catch (error) {
            console.error("❌ Lỗi khi gửi biểu tượng cảm xúc:", error);
        }
    };

    const getMessageStatus = (message) => {
        if (message.senderId === 0) {
            if (message.isRead) {
                return <CheckCheck size={16} className="text-blue-500" />;
            } else {
                return <Check size={16} className="text-gray-400" />;
            }
        }
        return null;
    };

    const getFilteredCustomers = () => {
        return customers.filter(c =>
            (c.fullName && c.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    };

    const getSelectedCustomer = () => {
        return customers.find(c => c.id === selectedUserId) || {};
    };

    const formatMessageTimestamp = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return format(date, "HH:mm", { locale: vi });
        } else {
            return format(date, "HH:mm - dd/MM", { locale: vi });
        }
    };

    const formatDateDivider = (date) => {
        if (!date) return "Không xác định";

        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === now.toDateString()) {
            return "Hôm nay";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Hôm qua";
        } else {
            return format(date, "dd 'tháng' MM, yyyy", { locale: vi });
        }
    };

    const getTotalUnread = () => {
        return Object.values(unreadCount).reduce((sum, count) => sum + count, 0);
    };

    return (
        <div className="flex flex-col w-full h-[calc(100vh-80px)] bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200">
            {/* Header */}
            <div className="flex bg-white border-b border-gray-200 py-3 px-4 h-16">
                <div className="flex items-center gap-3 flex-1">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Trò Chuyện {getTotalUnread() > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 ml-2">{getTotalUnread()}</span>}
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowSearch(!showSearch)}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                    >
                        <Search size={20} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar: Danh sách khách hàng */}
                <div className={`bg-white border-r border-gray-200 ${selectedUserId && window.innerWidth < 768 ? 'hidden' : 'block'} w-full md:w-80`}>
                    {showSearch && (
                        <div className="sticky top-0 p-2 bg-white z-10 border-b">
                            <div className="relative">
                                <input
                                    type="text"
                                    className="w-full py-2 pl-9 pr-4 bg-gray-100 rounded-full text-sm focus:outline-none"
                                    placeholder="Tìm kiếm trò chuyện..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                                {searchTerm && (
                                    <button
                                        className="absolute right-3 top-2.5 text-gray-500"
                                        onClick={() => setSearchTerm("")}
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="overflow-y-auto h-full pb-2">
                        {getFilteredCustomers().map(c => (
                            <button
                                key={c.id}
                                onClick={() => setSelectedUserId(c.id)}
                                className={`block w-full text-left px-3 py-3 hover:bg-gray-50 transition-colors ${selectedUserId === c.id ? "bg-blue-50" : ""}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img
                                            src={c.avatarUrl || "https://www.gravatar.com/avatar/00000000000000000000000000000000?s=40&d=identicon"}
                                            alt="Avatar"
                                            className="w-12 h-12 rounded-full object-cover border border-gray-200"
                                            onError={(e) => {
                                                e.target.src = "https://www.gravatar.com/avatar/00000000000000000000000000000000?s=40&d=identicon";
                                            }}
                                        />
                                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${c.online ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1">
                                            <span className="text-sm font-semibold text-gray-800 truncate">
                                                {c.fullName || `Khách hàng ${c.id}`}
                                            </span>
                                            <span className="text-xs text-gray-500 whitespace-nowrap">
                                                {c.lastMessage?.timestamp ? formatMessageTimestamp(c.lastMessage.timestamp) : ""}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-gray-500 truncate max-w-[180px]">
                                                {c.lastMessage?.content?.replace(/<[^>]*>/g, '') || c.email || "Chưa có tin nhắn"}
                                            </p>
                                            {unreadCount[c.id] > 0 && (
                                                <span className="bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ml-1">
                                                    {unreadCount[c.id]}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Khu vực chat */}
                {selectedUserId ? (
                    <div className="flex-1 flex flex-col h-full">
                        {/* Header cuộc trò chuyện */}
                        <div className="px-4 py-2 bg-white border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedUserId(null)}
                                    className="md:hidden p-1 rounded-full hover:bg-gray-100"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <div className="relative cursor-pointer" onClick={() => setShowUserInfo(!showUserInfo)}>
                                    <img
                                        src={getSelectedCustomer().avatarUrl || "https://www.gravatar.com/avatar/00000000000000000000000000000000?s=40&d=identicon"}
                                        alt="Avatar"
                                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                    />
                                    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${true ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="font-medium text-gray-800">
                                        {getSelectedCustomer().fullName || `Khách hàng ${selectedUserId}`}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        {getSelectedCustomer().online ? "Đang hoạt động" : "Hoạt động 5 phút trước"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
                                    <Phone size={18} />
                                </button>
                                <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
                                    <Video size={18} />
                                </button>
                                <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Thông tin người dùng (hiển thị khi click vào avatar) */}
                        {showUserInfo && (
                            <div className="absolute right-0 top-16 w-80 bg-white shadow-lg rounded-lg border border-gray-200 z-20 p-4">
                                <div className="flex flex-col items-center">
                                    <img
                                        src={getSelectedCustomer().avatarUrl || "https://www.gravatar.com/avatar/00000000000000000000000000000000?s=200&d=identicon"}
                                        alt="Avatar"
                                        className="w-24 h-24 rounded-full object-cover border border-gray-200"
                                    />
                                    <h3 className="font-semibold text-lg mt-3">
                                        {getSelectedCustomer().fullName || `Khách hàng ${selectedUserId}`}
                                    </h3>
                                    <p className="text-gray-500">{getSelectedCustomer().email}</p>
                                    <div className="mt-4 flex gap-2">
                                        <button className="bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium">
                                            Xem hồ sơ
                                        </button>
                                        <button className="bg-gray-100 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium" onClick={() => setShowUserInfo(false)}>
                                            Đóng
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Vùng hiển thị tin nhắn */}
                        <div
                            ref={chatContainerRef}
                            className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-blue-50 to-gray-50"
                        >
                            {groupedMessages.map((group, i) => (
                                <div key={i}>
                                    {group.type === 'date' && (
                                        <div className="flex justify-center my-4">
                                            <div className="bg-gray-200 text-gray-600 text-xs py-1 px-3 rounded-full">
                                                {formatDateDivider(group.date)}
                                            </div>
                                        </div>
                                    )}

                                    {group.type === 'messages' && (
                                        <div className={`flex mb-4 ${group.senderId === 0 ? 'justify-end' : 'justify-start'}`}>
                                            {group.senderId !== 0 && (
                                                <div className="flex-shrink-0 mr-2">
                                                    <img
                                                        src={group.messages[0].senderAvatarUrl || "https://www.gravatar.com/avatar/00000000000000000000000000000000?s=40&d=identicon"}
                                                        alt="Avatar"
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                </div>
                                            )}

                                            <div className={`flex flex-col max-w-[70%] ${group.senderId === 0 ? 'items-end' : 'items-start'}`}>
                                                {group.messages.map((msg, j) => (
                                                    <div
                                                        key={j}
                                                        className={`my-0.5 group relative ${hoveredMessageId === `${i}-${j}` ? 'mb-6' : ''}`}
                                                        onClick={() => setHoveredMessageId(hoveredMessageId === `${i}-${j}` ? null : `${i}-${j}`)}
                                                    >
                                                        <div
                                                            className={`px-3 py-2 rounded-2xl break-words ${group.senderId === 0
                                                                ? 'bg-blue-500 text-white rounded-tr-none'
                                                                : 'bg-white text-gray-800 rounded-tl-none shadow-sm'
                                                                } ${j === 0 ? (group.senderId === 0 ? 'rounded-tr-2xl' : 'rounded-tl-2xl') : ''}`}
                                                        >
                                                            <div
                                                                className="chat-message [&_img]:!max-w-[150px] [&_img]:!max-h-[150px] [&_img]:!object-contain [&_img]:!rounded-md [&_img]:!border [&_img]:!border-gray-200 [&_img]:!shadow-sm"
                                                                dangerouslySetInnerHTML={{ __html: msg.content }}
                                                            />
                                                        </div>

                                                        {hoveredMessageId === `${i}-${j}` && (
                                                            <div className={`absolute ${group.senderId === 0 ? 'right-0' : 'left-0'} bottom-[-1.5rem] text-xs flex items-center gap-1.5 text-gray-500 bg-white py-1 px-2 rounded-full shadow-sm z-10`}>
                                                                <span>{formatMessageTimestamp(msg.timestamp)}</span>
                                                                {group.senderId === 0 && getMessageStatus(msg)}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {typing && (
                                <div className="flex mb-4 items-end">
                                    <div className="flex-shrink-0 mr-2">
                                        <img
                                            src={getSelectedCustomer().avatarUrl || "https://www.gravatar.com/avatar/00000000000000000000000000000000?s=40&d=identicon"}
                                            alt="Avatar"
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                    </div>
                                    <div className="bg-white px-4 py-3 rounded-3xl shadow-sm">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={bottomRef}></div>
                        </div>

                        {/* Thanh nhập tin nhắn */}
                        <div className="border-t border-gray-200 bg-white p-3 relative">
                            {showAttachMenu && (
                                <div className="absolute bottom-16 left-4 bg-white shadow-lg rounded-lg border border-gray-200 p-2 z-10">
                                    <div className="flex gap-3">
                                        <label className="flex flex-col items-center justify-center w-14 h-14 bg-blue-50 rounded-full hover:bg-blue-100 cursor-pointer">
                                            <Image size={24} className="text-blue-600" />
                                            <span className="text-xs mt-1 text-blue-600">Ảnh</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                            />
                                        </label>
                                        <div className="flex flex-col items-center justify-center w-14 h-14 bg-purple-50 rounded-full hover:bg-purple-100 cursor-pointer">
                                            <Paperclip size={24} className="text-purple-600" />
                                            <span className="text-xs mt-1 text-purple-600">File</span>
                                        </div>
                                        <div className="flex flex-col items-center justify-center w-14 h-14 bg-green-50 rounded-full hover:bg-green-100 cursor-pointer">
                                            <Phone size={24} className="text-green-600" />
                                            <span className="text-xs mt-1 text-green-600">Gọi</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {showEmojiPicker && (
                                <div className="absolute bottom-16 left-4 z-10">
                                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setShowAttachMenu(!showAttachMenu);
                                        setShowEmojiPicker(false);
                                    }}
                                    className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                                >
                                    <Paperclip size={20} />
                                </button>
                                <div className="relative flex-1">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        className="w-full border-0 px-4 py-3 rounded-full bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                                        placeholder="Nhắn tin..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                    />
                                    <button
                                        onClick={() => {
                                            setShowEmojiPicker(!showEmojiPicker);
                                            setShowAttachMenu(false);
                                        }}
                                        className="absolute right-3 top-3 text-gray-500 hover:text-blue-500"
                                    >
                                        <Smile size={20} />
                                    </button>
                                </div>

                                {input.trim() ? (
                                    <button
                                        onClick={sendMessage}
                                        className="p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                                    >
                                        <Send size={20} />
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button className="p-3 rounded-full hover:bg-gray-100 text-gray-600">
                                            <Mic size={20} />
                                        </button>
                                        <button
                                            onClick={sendThumbsUp}
                                            className="p-3 rounded-full hover:bg-gray-100 text-blue-500"
                                        >
                                            <ThumbsUp size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-50">
                        <div className="text-center p-5">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send size={32} className="text-blue-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800">Chào mừng đến với Trò Chuyện</h3>
                            <p className="text-gray-500 mt-2">Chọn một cuộc trò chuyện từ danh sách bên trái hoặc bắt đầu cuộc trò chuyện mới.</p>
                            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                Tạo cuộc trò chuyện mới
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
};

export default AdminChat;