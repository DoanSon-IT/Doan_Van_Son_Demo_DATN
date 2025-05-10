import React, { useState, useEffect } from "react";
import slider1 from "../../assets/slider_1.png";
import slider2 from "../../assets/slider_2.png";
import slider3 from "../../assets/slider_3.png";

const Slider = () => {
    const slides = [
        { id: 1, title: "iPhone 15 Pro Max", description: "Công nghệ dẫn đầu - Giảm đến 3 triệu", image: slider1, buttonText: "Mua ngay", buttonLink: "/product/iphone-15" },
        { id: 2, title: "Samsung Galaxy Z Fold 5", description: "Màn hình gập đột phá - Quà tặng 5 triệu", image: slider2, buttonText: "Khám phá", buttonLink: "/product/z-fold-5" },
        { id: 3, title: "Black Friday", description: "Giảm 50% cực sốc - Số lượng có hạn", image: slider3, buttonText: "Săn deal", buttonLink: "/shop" },
    ];

    const [currentSlide, setCurrentSlide] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (!isHovered) {
            const interval = setInterval(() => {
                setIsAnimating(true);
                setTimeout(() => {
                    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
                    setTimeout(() => {
                        setIsAnimating(false);
                    }, 500);
                }, 200);
            }, 4000);
            return () => clearInterval(interval);
        }
    }, [slides.length, isHovered]);

    const goToSlide = (index) => {
        setIsAnimating(true);
        setTimeout(() => {
            setCurrentSlide(index);
            setTimeout(() => {
                setIsAnimating(false);
            }, 500);
        }, 200);
    };

    const goToPrevSlide = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
            setTimeout(() => {
                setIsAnimating(false);
            }, 500);
        }, 200);
    };

    const goToNextSlide = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
            setTimeout(() => {
                setIsAnimating(false);
            }, 500);
        }, 200);
    };

    return (
        <div
            className="relative w-full h-[25vh] sm:h-[35vh] md:h-[40vh] lg:h-[50vh] xl:h-[60vh] max-h-[600px] overflow-hidden bg-black"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute top-0 left-0 w-full h-full transition-all duration-700 ease-in-out 
                        ${index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"}
                        ${isAnimating ? "blur-sm" : ""}`}
                >
                    <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.target.src = "https://via.placeholder.com/1200x600?text=Image+Not+Found")}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent flex items-end justify-center px-4 sm:px-6 pb-4 sm:pb-8">
                        <div className={`text-center text-white transition-all duration-700 ${isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}>
                            <h2 className="text-sm sm:text-lg md:text-xl lg:text-3xl font-bold tracking-wide mb-1">{slide.title}</h2>
                            <p className="mt-1 text-[10px] sm:text-sm lg:text-base text-gray-300">{slide.description}</p>
                            <a
                                href={slide.buttonLink}
                                className="mt-2 sm:mt-3 inline-block px-3 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-xs sm:text-sm md:text-base shadow-lg"
                            >
                                {slide.buttonText}
                            </a>
                            <div className="mt-2 flex justify-center gap-1 sm:gap-2">
                                <span className="inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red-500 text-white text-[10px] sm:text-xs rounded-full">HOT</span>
                                <span className="inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-500 text-white text-[10px] sm:text-xs rounded-full">Trả góp 0%</span>
                            </div>
                        </div>
                    </div>

                    {/* Thêm angle gradient overlay cho hiệu ứng sang trọng */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent opacity-60 mix-blend-overlay"></div>
                </div>
            ))}

            {/* Navigation Dots - Cải thiện */}
            <div className="absolute bottom-1 sm:bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3 z-20">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 transform ${index === currentSlide
                            ? "bg-white scale-125 shadow-glow"
                            : "bg-gray-600 hover:bg-gray-400"
                            }`}
                        style={index === currentSlide ? { boxShadow: "0 0 10px rgba(255, 255, 255, 0.7)" } : {}}
                    />
                ))}
            </div>

            {/* Navigation Arrows - Cải thiện */}
            <button
                onClick={goToPrevSlide}
                className="absolute left-1 sm:left-2 md:left-4 top-1/2 transform -translate-y-1/2 p-1 sm:p-1.5 md:p-2 bg-white/20 rounded-full hover:bg-white/40 transition-all duration-300 text-white backdrop-blur-sm hover:scale-110"
            >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <button
                onClick={goToNextSlide}
                className="absolute right-1 sm:right-2 md:right-4 top-1/2 transform -translate-y-1/2 p-1 sm:p-1.5 md:p-2 bg-white/20 rounded-full hover:bg-white/40 transition-all duration-300 text-white backdrop-blur-sm hover:scale-110"
            >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
};

export default Slider;