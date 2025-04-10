// 📁 components/common/LoginPromptModal.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

const LoginPromptModal = ({ onClose, cartData }) => {
    const navigate = useNavigate();
    const [isHoveringLogin, setIsHoveringLogin] = useState(false);
    const [isHoveringRegister, setIsHoveringRegister] = useState(false);

    useEffect(() => {
        // Ẩn Header khi modal xuất hiện
        const header = document.querySelector("header");
        if (header) header.style.display = "none";

        // Thêm class để ngăn scroll trên body
        document.body.classList.add("overflow-hidden");

        return () => {
            if (header) header.style.display = "";
            document.body.classList.remove("overflow-hidden");
        };
    }, []);

    const handleLogin = () => {
        navigate("/auth/login", {
            state: { redirectTo: "/checkout", cartData },
        });
        onClose();
    };

    const handleRegister = () => {
        navigate("/auth/register");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md transition-all duration-500">
            {/* Enhanced Galaxy Background Layer - hiệu ứng smooth hơn */}
            <div className="absolute inset-0 bg-[url('/dem_day_sao_bg.png')] bg-cover bg-center opacity-70 animate-smooth-pulse pointer-events-none"></div>

            {/* Enhanced Stars Twinkle Layer */}
            <div className="absolute inset-0">
                <div className="stars-container"></div>
            </div>

            {/* Multiple Shooting Stars - đổi hướng từ phải qua trái */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="shooting-star star-1"></div>
                <div className="shooting-star star-2"></div>
                <div className="shooting-star star-3"></div>
            </div>

            {/* Modal Content with Glass Morphism */}
            <div className="relative z-10 bg-black/30 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl px-12 py-10 w-[95%] max-w-2xl text-white transform transition-all duration-700 hover:scale-[1.02]">
                {/* Glowing Border Effect */}
                <div className="absolute inset-0 rounded-2xl glow-border"></div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-all duration-300 hover:rotate-90 hover:scale-110"
                >
                    <X size={22} />
                </button>

                <div className="text-center">
                    <h2 className="text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-white">
                        🚀 Đăng nhập để thanh toán
                    </h2>

                    <p className="text-gray-100 mb-10 text-xl leading-relaxed">
                        Trải nghiệm mua sắm thông minh hơn – hãy đăng nhập hoặc đăng ký để tiếp tục cuộc hành trình của bạn.
                    </p>

                    <div className="flex justify-center gap-8">
                        {/* Black Login Button with Hover Effect */}
                        <button
                            onClick={handleLogin}
                            onMouseEnter={() => setIsHoveringLogin(true)}
                            onMouseLeave={() => setIsHoveringLogin(false)}
                            className="group relative px-10 py-4 bg-black text-white rounded-full font-bold shadow-lg transition-all duration-500 overflow-hidden border border-white/20 hover:border-white/50"
                        >
                            <span className={`relative z-10 transition-all duration-500 ${isHoveringLogin ? 'text-black' : 'text-white'}`}>
                                Đăng nhập
                            </span>
                            <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span>
                        </button>

                        {/* Black Register Button with Hover Effect */}
                        <button
                            onClick={handleRegister}
                            onMouseEnter={() => setIsHoveringRegister(true)}
                            onMouseLeave={() => setIsHoveringRegister(false)}
                            className="group relative px-10 py-4 bg-black text-white rounded-full font-bold shadow-lg transition-all duration-500 overflow-hidden border border-white/20 hover:border-white/50"
                        >
                            <span className={`relative z-10 transition-all duration-500 ${isHoveringRegister ? 'text-black' : 'text-white'}`}>
                                Đăng ký
                            </span>
                            <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Enhanced Animations */}
            <style>{`
                /* Hiệu ứng pulse mượt mà hơn (mờ -> đậm -> mờ) */
                @keyframes smoothPulse {
                    0% { opacity: 0.4; }
                    50% { opacity: 0.8; }
                    100% { opacity: 0.4; }
                }
                
                .animate-smooth-pulse {
                    animation: smoothPulse 8s ease-in-out infinite;
                }
                
                /* Glowing border effect */
                .glow-border {
                    box-shadow: 0 0 15px 2px rgba(255, 255, 255, 0.1);
                    animation: borderPulse 4s infinite;
                    pointer-events: none;
                }
                
                @keyframes borderPulse {
                    0% { box-shadow: 0 0 15px 2px rgba(255, 255, 255, 0.1); }
                    50% { box-shadow: 0 0 25px 4px rgba(255, 255, 255, 0.2); }
                    100% { box-shadow: 0 0 15px 2px rgba(255, 255, 255, 0.1); }
                }
                
                /* Stars background */
                .stars-container {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background-image: 
                        radial-gradient(2px 2px at 20px 30px, white, rgba(0,0,0,0)),
                        radial-gradient(2px 2px at 40px 70px, white, rgba(0,0,0,0)),
                        radial-gradient(2px 2px at 50px 160px, white, rgba(0,0,0,0)),
                        radial-gradient(2px 2px at 90px 40px, white, rgba(0,0,0,0)),
                        radial-gradient(2px 2px at 130px 80px, white, rgba(0,0,0,0)),
                        radial-gradient(2px 2px at 160px 120px, white, rgba(0,0,0,0));
                    background-repeat: repeat;
                    background-size: 200px 200px;
                    animation: twinkle 8s ease-in-out infinite;
                }
                
                @keyframes twinkle {
                    0% { opacity: 0.3; }
                    50% { opacity: 0.7; }
                    100% { opacity: 0.3; }
                }
                
                /* Đã chỉnh sửa: Sao băng từ góc PHẢI trên xuống góc TRÁI dưới (dạng \) */
                @keyframes shootingStar {
                    0% {
                        transform: translateX(0%) translateY(0%) rotate(150deg);
                        opacity: 1;
                    }
                    50% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateX(-200%) translateY(200%) rotate(150deg);
                        opacity: 0;
                    }
                }
                
                .shooting-star {
                    position: absolute;
                    width: 4px;
                    height: 100px;
                    background: linear-gradient(white, transparent);
                    border-radius: 50%;
                    filter: blur(1px);
                }
                
                .star-1 {
                    top: 5%;
                    right: 10%; /* Đổi từ left thành right */
                    animation: shootingStar 2.5s ease-in-out infinite;
                    animation-delay: 0s;
                }
                
                .star-2 {
                    top: 15%;
                    right: 25%; /* Đổi từ left thành right */
                    animation: shootingStar 3s ease-in-out infinite;
                    animation-delay: 1s;
                }
                
                .star-3 {
                    top: 8%;
                    right: 40%; /* Đổi từ left thành right */
                    animation: shootingStar 2s ease-in-out infinite;
                    animation-delay: 2s;
                }
            `}</style>
        </div>
    );
};

export default LoginPromptModal;