import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Heart, Phone, Battery, Mail } from "lucide-react";

const LetterStories = () => {

    useEffect(() => {
        // Thêm CSS để tối ưu hiển thị tiếng Việt
        const style = document.createElement('style');
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600&display=swap');
            
            .vietnamese-text {
                font-family: 'Be Vietnam Pro', system-ui, sans-serif;
                unicode-normalize: form-nfc;
                text-rendering: optimizeLegibility;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                font-feature-settings: "locl";
                word-break: keep-all;
            }
            
            .letter-content p {
                margin-bottom: 0.5rem;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    const stories = [
        {
            title: "Có những điều em từng mong... nhưng không bằng pin 100%",
            content: `Có những buổi chiều, em đứng trong tiệm nhìn ra ngoài trời, nghĩ về người mình từng thương. Người ấy từng nói: "Chỉ cần ở bên nhau là đủ. Em không cần quà, không cần vật chất, không cần iPhone."
Em tin điều đó suốt 3 năm.
Rồi một ngày, người ấy đi, để lại lời nhắn: "Anh xin lỗi, nhưng em không đủ... dung lượng cảm xúc cho anh nữa."
Em buồn. Em khóc. Em bật chế độ máy bay với thế giới.
Nhưng rồi em nhận ra – tình yêu có thể hết pin. **Còn chiếc iPhone 15 Pro Max thì chưa bao giờ làm em thất vọng.**
Từ đó em không đợi tin nhắn từ ai nữa, em chỉ đợi... máy về hàng để chốt đơn sớm.
📱 *Ai cần pin 100%, camera 48MP, chống nước IP68 – ib em liền.*`,
            icon: Battery
        },
        {
            title: "Tôi từng nghĩ mình sai vì quá quan tâm... nhưng hóa ra là sai vì chưa lên đời máy",
            content: `Tôi là kiểu người hay quan tâm người khác. Ai nhắn là trả lời liền. Ai cần là có mặt. Có lần, tôi mượn điện thoại mình để bạn nhắn tin, bạn nhắn xong quên xóa. Tôi đọc được. Rằng: – "Nó dễ thương đấy, nhưng hơi cùi bắp. Dùng điện thoại cũ đời nào luôn."
Tôi cười. Lạnh.
Đêm đó tôi không ngủ. Tôi suy nghĩ rất nhiều. Về bản thân. Về cách sống. Về chiếc điện thoại màn hình rạn 1 góc mà tôi vẫn cố dán decal che lại.
Và tôi hiểu ra một điều...
**Không phải tôi không đủ tốt. Chỉ là... camera máy tôi không đủ rõ để thấy người ta lật mặt.**
Hôm sau, tôi lên đời máy. Cầm trong tay con Galaxy S24 Ultra, tôi thấy mình khác liền. Ảnh selfie lên sáng như lương tháng 13, video call mượt như mối quan hệ không drama.
📱 *Tôi không cần ai thương nữa. Tôi chỉ cần máy đủ mạnh, RAM đủ trâu, và nhân viên tư vấn thật có tâm – như chính tôi đang bán đây.*`,
            icon: Phone
        },
        {
            title: "Tình yêu là điều xa xỉ... nên tôi chọn trả góp 0% lãi suất",
            content: `Tôi từng yêu. Một người thích sự đơn giản.
Người ấy không đòi hỏi gì nhiều – chỉ thích những thứ "vừa đủ". Không cần quán xá sang trọng, chỉ cần ngồi cạnh nhau ăn bánh tráng trộn là vui. Không cần điện thoại xịn, chỉ cần đủ gọi – nhắn – và block nhau khi giận.
Tôi tin người ấy. Và tôi chọn giản dị theo cách người ấy thích.
Cho tới một ngày... tôi thấy người ấy đăng ảnh check-in trong showroom Apple. Caption: "Mọi thứ đều có thể giản dị – trừ camera phải đẹp!"
Và tôi hiểu: **Thế giới có thể không công bằng. Nhưng camera góc rộng + chân dung xoá phông thì luôn công lý.**
Tôi không chọn tình yêu nữa.
Tôi chọn mở shop điện thoại, hỗ trợ trả góp 0% – để những người từng yêu sâu nhưng bị shallow đánh giá có thể lên đời iPhone không cần lương 20 triệu.
📱 *Đời mà. Tình có thể cũ, nhưng máy phải mới. Mua máy đi rồi tình yêu sẽ tới... hoặc không. Nhưng ít nhất, ảnh bạn sẽ đẹp.*`,
            icon: Heart
        },
        {
            title: "Chúng tôi từng hứa sẽ cùng nhau đi hết cuộc đời... cho đến khi em cắm sạc nhầm cục",
            content: `Em là người yêu cũ của tôi. Người từng khóc khi pin điện thoại tụt về 5%, và từng vui chỉ vì tôi đổi cường lực giúp không cần hỏi.
Chúng tôi từng là một đôi hoàn hảo: Em dùng iPhone, tôi dùng Android – cãi nhau từ hệ điều hành tới icon.
Nhưng dù khác biệt, chúng tôi vẫn thương nhau… cho đến một ngày định mệnh.
Em qua nhà tôi chơi. Em hỏi mượn cục sạc.
Tôi cầm củ sạc 20W đưa cho em. Em nhìn, im lặng.
Đêm đó, em nhắn: – "Em nghĩ tụi mình không hợp nữa. Em cần một người hiểu em hơn. Một người… sạc nhanh hơn."
Tôi ngơ ngác. Rồi bật cười.
Và tôi hiểu: **Tình yêu có thể chịu đựng mọi thứ – trừ... thời gian sạc lâu.**
Từ đó tôi mở tiệm điện thoại, chuyên phụ kiện chính hãng, sạc nhanh từ 0 đến hết tình.
📱 *Củ sạc – cáp chuẩn – tai nghe bluetooth – cần gì em cũng có. Trừ… người cũ.*`,
            icon: Battery
        },
        {
            title: "Anh từng chọn em thay vì iPhone. Sai lầm lớn nhất đời anh.",
            content: `Hồi đó anh có đủ tiền để mua một trong hai: iPhone mới hoặc đưa em đi du lịch Đà Lạt.
Em hỏi: – "Anh chọn em chứ?"
Anh gật đầu không do dự.
Em cười. Anh cười. iPhone nằm trong tủ kính, nhìn anh với ánh mắt thất vọng.
Anh đưa em đi Đà Lạt, em chụp ảnh bằng điện thoại anh – một con máy cũ xài từ thời học cấp 3.
Em nhìn tấm ảnh xong, nói nhỏ: – "Máy chụp không đẹp… không ra được cái vibe mình mong."
Vài tuần sau, em xa anh. Trên tay em là iPhone 15 – không phải do anh mua.
Anh không trách em.
Anh chỉ ước… **giá như anh chọn iPhone từ đầu.**
Giờ anh mở shop bán điện thoại – giúp những người từng chọn sai như anh, chọn lại từ đầu. Không cần Đà Lạt, chỉ cần ống kính góc rộng.
📱 *Chụp đẹp, quay mượt, xoá phông tình cũ – tất cả đều có tại shop anh. Inbox nhé, còn bảo hành cả trái tim.*`,
            icon: Mail
        }
    ];

    const [activeIndex, setActiveIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [animating, setAnimating] = useState(false);

    // Chuẩn hóa Unicode và xử lý dấu tiếng Việt
    const normalizeText = (text) => {
        return text.normalize("NFC")
            .replace(/[\u0300-\u036f]/g, ""); // Loại bỏ combining characters
    };

    const nextStory = () => {
        if (animating) return;
        setAnimating(true);
        setFlipped(true);
        setTimeout(() => {
            setActiveIndex((activeIndex + 1) % stories.length);
            setTimeout(() => {
                setFlipped(false);
                setAnimating(false);
            }, 300);
        }, 300);
    };

    const prevStory = () => {
        if (animating) return;
        setAnimating(true);
        setFlipped(true);
        setTimeout(() => {
            setActiveIndex((activeIndex - 1 + stories.length) % stories.length);
            setTimeout(() => {
                setFlipped(false);
                setAnimating(false);
            }, 300);
        }, 300);
    };

    const formatContent = (content) => {
        return normalizeText(content)
            .split('\n')
            .map((line, i) => {
                line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
                return line ? <p key={i} dangerouslySetInnerHTML={{ __html: line }} /> : <br key={i} />;
            });
    };

    const IconComponent = stories[activeIndex].icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-50 py-16 flex items-center justify-center px-4 vietnamese-text">
            <div className="max-w-3xl w-full">
                {/* Letter title */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-rose-900">
                        Những bức thư gửi khách hàng
                    </h1>
                    <div className="h-1 w-32 bg-rose-700 mx-auto mt-3 rounded"></div>
                </div>

                {/* Letter container */}
                <div
                    className={`relative bg-white rounded-lg shadow-xl overflow-hidden transform transition-all duration-300 ${flipped ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`}
                    style={{
                        backgroundImage: "linear-gradient(to right, rgba(255,240,245,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,240,245,0.2) 1px, transparent 1px)",
                        backgroundSize: "20px 20px"
                    }}
                >
                    {/* Stamp-like decorative element */}
                    <div className="absolute top-4 right-4 w-16 h-16 bg-rose-100 rounded-md flex items-center justify-center transform rotate-6 shadow-sm">
                        <IconComponent className="text-rose-700" size={32} />
                    </div>

                    {/* Letter header */}
                    <div className="bg-rose-700 text-white py-4 px-6 border-b-4 border-rose-900">
                        <h2 className="text-xl md:text-2xl font-serif font-bold">
                            📜 Bức thư {activeIndex + 1}: "{stories[activeIndex].title}"
                        </h2>
                        <div className="flex justify-between items-center mt-1">
                            <div className="text-xs text-rose-100">Gửi từ trái tim</div>
                            <div className="text-xs text-rose-100">Ngày: {new Date().toLocaleDateString('vi-VN')}</div>
                        </div>
                    </div>

                    {/* Letter content */}
                    <div className="p-6 md:p-8 bg-white min-h-64">
                        <div className="font-serif leading-relaxed text-gray-800 letter-content">
                            {formatContent(stories[activeIndex].content)}
                        </div>

                        {/* Letter signature */}
                        <div className="mt-8 border-t border-dashed border-gray-300 pt-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-rose-800 italic">Trân trọng,</p>
                                    <p className="font-bold text-rose-900 mt-2">DSon Mobile</p>
                                </div>
                                <div className="text-rose-700 transform -rotate-12 font-bold border-2 border-rose-700 rounded-lg px-3 py-1">
                                    Từ trái tim
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Letter footer */}
                    <div className="bg-rose-50 p-4 border-t border-rose-200 flex justify-between items-center">
                        <button
                            onClick={prevStory}
                            className="flex items-center space-x-1 px-4 py-2 bg-white text-rose-800 rounded-full shadow-sm hover:bg-rose-100 transition-colors border border-rose-200"
                            disabled={animating}
                        >
                            <ChevronLeft size={16} />
                            <span>Lá thư trước</span>
                        </button>

                        <div className="flex space-x-2">
                            {stories.map((_, index) => (
                                <div
                                    key={index}
                                    className={`w-2 h-2 rounded-full ${activeIndex === index ? 'bg-rose-700' : 'bg-rose-200'}`}
                                ></div>
                            ))}
                        </div>

                        <button
                            onClick={nextStory}
                            className="flex items-center space-x-1 px-4 py-2 bg-white text-rose-800 rounded-full shadow-sm hover:bg-rose-100 transition-colors border border-rose-200"
                            disabled={animating}
                        >
                            <span>Lá thư sau</span>
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Decorative wax seal */}
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-rose-700 rounded-full flex items-center justify-center shadow-lg">
                        <div className="w-8 h-8 bg-rose-900 rounded-full flex items-center justify-center">
                            <Heart size={16} className="text-white" />
                        </div>
                    </div>
                </div>

                {/* Caption */}
                <div className="text-center mt-12 text-rose-900 opacity-80">
                    <p className="italic">Mỗi chiếc điện thoại đều mang một câu chuyện. Hãy để chúng tôi kể cho bạn nghe.</p>
                </div>
            </div>
        </div>
    );
};

export default LetterStories;