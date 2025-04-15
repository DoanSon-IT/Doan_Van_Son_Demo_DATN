import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductGrid from "./ProductGrid";
import Slider from "../../components/layout/Slider";
import apiCategory from "../../api/apiCategory";
import useWindowSize from "../../hooks/useWindowSize";

const Home = () => {
    const [categories, setCategories] = useState([]);
    const [hoverIndex, setHoverIndex] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const brands = [
        { name: "Apple", logo: "/brands/apple.png", productCount: 120 },
        { name: "Samsung", logo: "/brands/samsung.png", productCount: 110 },
        { name: "Xiaomi", logo: "/brands/xiaomi.png", productCount: 90 },
        { name: "OPPO", logo: "/brands/oppo.png", productCount: 85 },
        { name: "Vivo", logo: "/brands/vivo.png", productCount: 70 },
        { name: "Realme", logo: "/brands/realme.png", productCount: 65 },
        { name: "Huawei", logo: "/brands/huawei.png", productCount: 50 },
        { name: "Motorola", logo: "/brands/motorola.png", productCount: 40 },
        { name: "Infinix", logo: "/brands/infinix.png", productCount: 35 },
        { name: "Tecno", logo: "/brands/tecno.png", productCount: 30 },
    ];
    const windowSize = useWindowSize();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const cachedCategories = localStorage.getItem("categories");
                if (cachedCategories) {
                    setCategories(JSON.parse(cachedCategories));
                } else {
                    const data = await apiCategory.getAllCategories();
                    const categoriesData = Array.isArray(data) ? data : data?.content || [];
                    setCategories(categoriesData);
                    localStorage.setItem("categories", JSON.stringify(categoriesData));
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh mục:", error);
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    const sidebarWidth = () => {
        const baseWidth = windowSize.width / windowSize.pixelRatio;
        if (baseWidth < 640) return "w-20";
        if (baseWidth < 768) return "w-40";
        return "w-48";
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 text-gray-800 font-mono">
            <div className="flex w-full px-4 gap-4">
                {/* Sidebar cố định */}
                <aside className="hidden pt-20 lg:block w-[10%] bg-gradient-to-r bg-white shadow-xl border-r border-slate-800 flex-shrink-0 h-[calc(100vh-0px)] fixed top-[48px] left-0 z-[999] overflow-y-auto transition-all duration-500">
                    <div className="pt-[60px] flex flex-col items-center">
                        <div className="flex justify-center items-center p-4 lg:p-0 lg:mb-8">
                            <span className="text-black text-2xl font-semibold">Danh mục</span>
                        </div>

                        <ul className="space-y-3 px-3 w-full">
                            {categories.map((category, index) => (
                                <li key={category.id} onMouseEnter={() => setHoverIndex(index)} onMouseLeave={() => setHoverIndex(null)}>
                                    <Link
                                        to={`/category/${category.id}`}
                                        className={`block w-full text-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${hoverIndex === index
                                                ? "bg-black text-green-600 shadow-lg scale-[1.02]"
                                                : "bg-black/90 text-white hover:bg-white hover:text-black hover:shadow-md hover:scale-[1.02]"
                                            }`}
                                    >
                                        {category.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-8 px-4 w-full hidden lg:block">
                            <div className="bg-white rounded-xl p-4 text-center text-sm shadow-md">
                                <h3 className="font-semibold text-gray-700">Cần trợ giúp?</h3>
                                <Link to="#" className="text-blue-500 hover:underline block mt-1">
                                    Trung tâm hỗ trợ
                                </Link>
                                <Link to="#" className="text-blue-500 hover:underline block">
                                    Câu hỏi thường gặp
                                </Link>
                            </div>
                        </div>

                        <p className="text-center text-white/80 text-xs italic mt-6 px-2">
                            “Trải nghiệm công nghệ, nâng tầm cuộc sống.”
                        </p>
                    </div>
                </aside>

                {/* Nội dung chính */}
                <div className="w-[75%] min-w-0 ml-[10%] mr-[15%]">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden fixed top-24 left-4 z-[102] bg-blue-500 text-white p-2 rounded-full shadow-lg transform hover:scale-110 transition-all"
                    >
                        ☰
                    </button>
                    {/* Sidebar mobile */}
                    {isSidebarOpen && (
                        <aside
                            className={`bg-white border-r border-gray-200 shadow-lg flex-shrink-0 ${sidebarWidth()} h-screen fixed top-0 left-0 overflow-y-auto lg:hidden z-[901]`}
                        >
                            <div className="flex justify-between items-center p-4">
                                <span className="text-2xl md:text-4xl text-blue-600">⚡</span>
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="text-gray-800 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            <ul className="space-y-4 text-center p-4">
                                {categories.length > 0 ? (
                                    categories.map((category, index) => (
                                        <li
                                            key={category.id}
                                            onMouseEnter={() => setHoverIndex(index)}
                                            onMouseLeave={() => setHoverIndex(null)}
                                            className="w-full"
                                        >
                                            <Link
                                                to={`/category/${category.id}`}
                                                className={`block p-2 md:p-3 text-sm md:text-base text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 rounded-md ${hoverIndex === index ? "border-l-4 border-blue-500 pl-2" : ""
                                                    }`}
                                            >
                                                {category.name}
                                            </Link>
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-center text-xs md:text-sm text-gray-400">Loading...</p>
                                )}
                            </ul>
                        </aside>
                    )}

                    <header className="w-full mb-4 relative z-20 pt-4">
                        <Slider />
                        <p className="text-center text-sm md:text-base mt-2 text-gray-600 italic bg-gradient-to-r from-transparent via-gray-100 to-transparent py-2">
                            "Anh Đoàn Sơn có đẳng cấp không? Đẳng cấp!"
                        </p>
                    </header>

                    <section className="w-full mt-4 relative z-10">
                        <div className="relative bg-gradient-to-r from-black to-gray-800 shadow-2xl border border-gray-200 overflow-hidden rounded-lg">
                            <div className="absolute inset-0 opacity-10">
                                <div
                                    className="absolute inset-0 bg-repeat opacity-5"
                                    style={{
                                        backgroundImage:
                                            "url('data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E')",
                                    }}
                                ></div>
                            </div>
                            <div className="flex items-center justify-center py-12">
                                <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-white z-10 animate-pulse">
                                    ⚡ Săn Deal Siêu Chất ⚡
                                </h2>
                            </div>
                            <p className="text-center text-sm md:text-base text-gray-300 z-10 relative mb-4">
                                Giá sốc - Đỉnh cao công nghệ!
                            </p>
                            <div className="text-center pb-8">
                                <Link
                                    to="#"
                                    className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-6 py-3 rounded-full font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 shadow-lg transform hover:scale-105"
                                >
                                    Chốt ngay
                                </Link>
                            </div>

                            <div className="absolute bottom-0 left-0 w-full">
                                <div className="flex justify-center gap-4 pb-2">
                                    <div className="flex items-center text-xs text-white">
                                        <span className="mr-1 text-yellow-400">✓</span> Giảm 50%
                                    </div>
                                    <div className="flex items-center text-xs text-white">
                                        <span className="mr-1 text-yellow-400">✓</span> Miễn phí ship
                                    </div>
                                    <div className="flex items-center text-xs text-white">
                                        <span className="mr-1 text-yellow-400">✓</span> Giao nhanh
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="w-full mt-10 z-10">
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mt-4 mb-4 text-center">
                            Sản phẩm đỉnh nhất
                        </h2>
                        <div className="w-full max-w-screen-2xl mx-auto">
                            <ProductGrid category="featured" theme="light" />
                        </div>
                    </section>

                    <section className="w-full mt-12 pb-12 z-10">
                        <div className="max-w-6xl mx-auto px-4">
                            <div className="mb-8 text-center">
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Thương hiệu nổi bật</h2>
                                <div className="w-24 h-1 bg-blue-500 mx-auto"></div>
                                <p className="text-gray-600 mt-3">Các thương hiệu uy tín hàng đầu thế giới</p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                                {brands.map((brand, index) => (
                                    <div
                                        key={index}
                                        className="bg-white p-4 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center group relative overflow-hidden"
                                    >
                                        <div className="absolute -right-8 -top-8 w-16 h-16 rounded-full bg-blue-100 opacity-10 group-hover:opacity-20 transition-opacity" />
                                        <div className="w-16 h-16 mb-3 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden">
                                            <img src={brand.logo} alt={brand.name} className="w-12 h-12 object-contain" />
                                        </div>
                                        <span className="font-semibold text-gray-800 group-hover:text-blue-600">{brand.name}</span>
                                        <span className="mt-2 text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                                            {brand.productCount}+ sản phẩm
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* <div className="text-center mt-8">
                                <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-full shadow-sm hover:shadow transition-all inline-flex items-center">
                                    Xem tất cả thương hiệu
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 ml-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div> */}
                        </div>
                    </section>
                </div>

                {/* Panel thông tin bên phải */}
                <aside className="hidden xl:block w-[15%] bg-white border-l border-gray-200 shadow-md flex-shrink-0 h-[calc(100vh-0px)] fixed top-[48px] right-0 z-[999] overflow-y-auto pt-20">
                    <div className="pt-[60px] flex flex-col gap-y-6">
                        <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-xl shadow-md relative overflow-hidden">
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-red-400 rounded-full opacity-20"></div>
                            <h3 className="font-bold text-white mb-3 flex items-center text-lg">
                                <span className="mr-2">🔥</span> ƯU ĐÃI SỐC
                            </h3>
                            <div className="space-y-2 text-white">
                                <p className="flex items-center text-sm"><span className="w-5 inline-block">-</span> Giảm 50% cho đơn hàng đầu tiên</p>
                                <p className="flex items-center text-sm"><span className="w-5 inline-block">-</span> Miễn phí ship toàn quốc</p>
                                <p className="flex items-center text-sm"><span className="w-5 inline-block">-</span> Đổi trả trong 30 ngày</p>
                            </div>
                            <div className="absolute bottom-2 right-2">
                                <span className="inline-block px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs text-white font-medium">Hot</span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-xl shadow-md relative overflow-hidden">
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-400 rounded-full opacity-20"></div>
                            <h3 className="font-bold text-white mb-3 flex items-center text-lg">
                                <span className="mr-2">🚚</span> GIAO NHANH
                            </h3>
                            <div className="space-y-2 text-white">
                                <p className="flex items-center text-sm bg-white bg-opacity-20 p-2 rounded-lg">
                                    Nhận hàng trong 2h tại TP.HCM và Hà Nội
                                </p>
                            </div>
                            <div className="absolute bottom-2 right-2">
                                <span className="inline-block px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs text-white font-medium">2h</span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-xl shadow-md relative overflow-hidden">
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-green-400 rounded-full opacity-20"></div>
                            <h3 className="font-bold text-white mb-3 flex items-center text-lg">
                                <span className="mr-2">🎧</span> HỖ TRỢ 24/7
                            </h3>
                            <div className="space-y-2 text-white">
                                <p className="flex items-center text-sm bg-white bg-opacity-20 p-2 rounded-lg">
                                    Hotline: <span className="text-yellow-300 font-semibold tracking-wide ml-2">1800-9999</span>
                                </p>
                            </div>
                            <div className="absolute bottom-2 right-2">
                                <span className="inline-block px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs text-white font-medium">24/7</span>
                            </div>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-md relative overflow-hidden">
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-purple-400 rounded-full opacity-20"></div>
                            <h3 className="font-bold text-white mb-3 flex items-center text-lg">
                                <span className="mr-2">📰</span> TIN TỨC MỚI
                            </h3>
                            <ul className="text-sm space-y-2 bg-white bg-opacity-20 p-3 rounded-lg">
                                <li>
                                    <a href="#" className="text-white hover:text-yellow-200 hover:underline flex items-center">
                                        <span className="text-yellow-300 mr-2">•</span>
                                        iPhone 16 sắp ra mắt
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-white hover:text-yellow-200 hover:underline flex items-center">
                                        <span className="text-yellow-300 mr-2">•</span>
                                        Top 5 laptop bán chạy nhất
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-white hover:text-yellow-200 hover:underline flex items-center">
                                        <span className="text-yellow-300 mr-2">•</span>
                                        Mẹo tăng thời lượng pin
                                    </a>
                                </li>
                            </ul>
                            <div className="absolute bottom-2 right-2">
                                <span className="inline-block px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs text-white font-medium">New</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Home;