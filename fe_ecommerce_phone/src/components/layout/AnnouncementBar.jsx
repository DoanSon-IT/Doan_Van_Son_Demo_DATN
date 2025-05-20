import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "tailwindcss/tailwind.css";

function AnnouncementBar({ announcements = [], isScrolled }) {
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
            className={`fixed top-0 left-0 w-full h-12 flex items-center justify-center bg-white border-b border-gray-200 shadow-lg relative overflow-hidden z-[1000] transition-all duration-300
                ${isScrolled ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}
            `}
            initial={{ opacity: 0, y: -48 }}
            animate={{
                opacity: isScrolled ? 0 : 1,
                y: isScrolled ? -48 : 0,
                transition: {
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                },
            }}
        >
            <motion.div
                className="whitespace-nowrap flex items-center text-sm sm:text-base md:text-lg lg:text-xl font-medium tracking-wide px-4"
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
                        className="mx-4 md:mx-8"
                        style={{
                            background: "linear-gradient(to right, #2563eb, #3b82f6)",
                            WebkitBackgroundClip: "text",
                            backgroundClip: "text",
                            color: "transparent",
                            textShadow: "0 2px 4px rgba(37, 99, 235, 0.1)"
                        }}
                    >
                        {text}
                    </span>
                ))}
            </motion.div>
        </motion.div>
    );
}

export default AnnouncementBar;