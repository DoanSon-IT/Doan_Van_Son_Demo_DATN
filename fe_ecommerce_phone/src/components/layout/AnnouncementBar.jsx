import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "tailwindcss/tailwind.css";

function AnnouncementBar({ announcements = [] }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            setIsVisible(scrollPosition < 48); // Ẩn khi cuộn xuống quá 48px
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Nếu không có announcements, dùng mặc định
    const defaultAnnouncements = announcements.length === 0
        ? [
            "🎉 Ưu đãi đặc biệt hôm nay - Giảm giá 30% tất cả sản phẩm!",
            "🚀 Nhanh tay sở hữu công nghệ đỉnh cao với giá sốc!",
            "💥 Deal hot - Miễn phí vận chuyển toàn quốc!",
        ]
        : announcements;

    return (
        <motion.div
            className="fixed top-0 left-0 w-full h-auto md:h-12 py-2 md:py-0 flex items-center justify-start bg-white border-b border-gray-200 shadow-md relative overflow-hidden z-[1100]"
            initial={{ opacity: 0, y: -48 }}
            animate={{
                opacity: isVisible ? 1 : 0,
                y: isVisible ? 0 : -48,
                transition: {
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                },
            }}
        >
            <motion.div
                className="whitespace-nowrap flex items-center text-blue-600 text-sm sm:text-base md:text-lg lg:text-xl font-bold tracking-wide px-4 drop-shadow-lg"
                animate={{ x: ["100%", "-100%"] }}
                transition={{
                    x: {
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: defaultAnnouncements.length * (window.innerWidth < 768 ? 8 : 10),
                        ease: "linear",
                    },
                }}
            >
                {defaultAnnouncements.map((text, index) => (
                    <span
                        key={index}
                        className="mx-4 md:mx-8 animate-bounce"
                        style={{
                            background: "linear-gradient(to right, #93c5fd, #a5b4fc)",
                            WebkitBackgroundClip: "text",
                            backgroundClip: "text",
                            color: "transparent",
                        }}
                    >
                        🎉 {text} 🎉
                    </span>
                ))}
            </motion.div>
        </motion.div>
    );
}

export default AnnouncementBar;