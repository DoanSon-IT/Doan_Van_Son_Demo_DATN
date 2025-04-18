import { useState, useEffect, useContext, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Search } from "lucide-react";
import { motion } from "framer-motion";
import AppContext from "../../context/AppContext";
import apiProduct from "../../api/apiProduct";
import apiCategory from "../../api/apiCategory";
import debounce from "lodash/debounce";
import AvatarWithFrame from "../common/AvatarWithFrame";

const Header = () => {
    const navigate = useNavigate();
    const { auth, logout, cartItems } = useContext(AppContext);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSticky, setIsSticky] = useState(false);
    const [frameIndex, setFrameIndex] = useState(() => Number(localStorage.getItem("avatarFrame")) || 0);

    const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const isAuthenticated = !!auth;

    useEffect(() => {
        const handleScroll = () => setIsSticky(window.scrollY > 100);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            const newIndex = Number(localStorage.getItem("avatarFrame")) || 0;
            setFrameIndex((prev) => (prev !== newIndex ? newIndex : prev));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const fetchSuggestionsDebounced = useCallback(
        debounce(async (query) => {
            if (query.trim()) {
                try {
                    const [productRes, categoryRes] = await Promise.all([
                        apiProduct.getAllProducts(query, 0, 5),
                        apiCategory.getAllCategories(),
                    ]);

                    const productSuggestions = Array.isArray(productRes.content)
                        ? productRes.content.map((p) => ({ label: p.name, type: "product" }))
                        : [];

                    const matchedCategory = categoryRes.find((cat) =>
                        cat.name.toLowerCase().includes(query.toLowerCase())
                    );

                    const categorySuggestion = matchedCategory
                        ? [{ label: matchedCategory.name, id: matchedCategory.id, type: "category" }]
                        : [];

                    setSuggestions([...categorySuggestion, ...productSuggestions]);
                    setShowSuggestions(true);
                } catch (err) {
                    console.error("Lỗi khi gợi ý tìm kiếm:", err);
                    setSuggestions([]);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300),
        []
    );

    useEffect(() => {
        fetchSuggestionsDebounced(searchQuery);
    }, [searchQuery, fetchSuggestionsDebounced]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setShowSuggestions(false);
            navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setShowSuggestions(false);
        if (suggestion.type === "category") {
            navigate(`/category/${suggestion.id}`);
        } else {
            setSearchQuery(suggestion.label);
            navigate(`/search?query=${encodeURIComponent(suggestion.label)}`);
        }
    };

    const handleLogout = () => {
        logout();
        setUserMenuOpen(false);
        navigate("/");
    };

    return (
        <header className={`bg-white/95 backdrop-blur-xl border-b z-[1000] border-gray-300 shadow-[0_0_20px_rgba(0,0,0,0.1)] ${isSticky ? "fixed top-0 left-0 w-full z-[1000] transition-all duration-300" : "relative"}`}>
            <div className="max-w-screen-2xl flex items-center justify-between mx-auto p-4">
                <NavLink to="/" className="relative group">
                    <motion.img
                        src="/Logo.png"
                        alt="Logo"
                        className="w-40 h-auto"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 500 }}
                    />
                </NavLink>

                <nav className="flex items-center space-x-8 text-xl font-semibold">
                    <NavLink to="/" className={({ isActive }) => `py-4 px-3 text-gray-700 hover:text-black transition-all duration-500 transform hover:scale-105 ${isActive ? "text-black" : ""}`}>Trang chủ</NavLink>
                    <NavLink to="/products" className={({ isActive }) => `py-4 px-3 text-gray-700 hover:text-black hover:shadow-[0_0_15px_rgba(0,0,0,0.1)] transition-all duration-500 transform hover:scale-105 ${isActive ? "text-black shadow-[0_0_10px_rgba(0,0,0,0.1)]" : ""}`}>Sản phẩm</NavLink>
                    <NavLink to="/about" className={({ isActive }) => `py-4 px-3 text-gray-700 hover:text-black transition-all duration-500 transform hover:scale-105 ${isActive ? "text-black" : ""}`}>Giới thiệu</NavLink>
                    <NavLink to="/contact" className={({ isActive }) => `py-4 px-3 text-gray-700 hover:text-black transition-all duration-500 transform hover:scale-105 ${isActive ? "text-black" : ""}`}>Liên hệ</NavLink>
                </nav>

                <div className="flex items-center space-x-6">
                    <form onSubmit={handleSearch} className="relative w-64">
                        <div className="relative flex items-center">
                            <Search className="absolute left-3 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 text-gray-900 border border-gray-300 rounded-xl shadow focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                onFocus={() => setShowSuggestions(true)}
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute left-0 top-[calc(100%+5px)] bg-white shadow rounded-xl w-full py-2 border border-gray-300 z-50"
                                >
                                    {suggestions.map((suggestion, index) => (
                                        <div
                                            key={index}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                                        >
                                            {suggestion.label}
                                            {suggestion.type === "category" && (
                                                <span className="text-xs text-gray-500 ml-2">(Danh mục)</span>
                                            )}
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </div>
                    </form>

                    <NavLink to="/cart" className="relative group">
                        <motion.div className="p-2 rounded-full hover:bg-gray-100" whileHover={{ scale: 1.2, rotate: 10 }}>
                            <ShoppingCart className="w-6 h-6 text-gray-700" />
                            {cartItemCount > 0 && (
                                <motion.span
                                    key={cartItemCount}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                                >
                                    {cartItemCount}
                                </motion.span>
                            )}
                        </motion.div>
                    </NavLink>

                    <div className="relative group" onMouseEnter={() => setUserMenuOpen(true)} onMouseLeave={() => setUserMenuOpen(false)}>
                        <div className="flex items-center gap-x-6 pr-2 cursor-pointer">
                            {isAuthenticated ? (
                                <>
                                    <div className="w-9 h-9 flex-shrink-0">
                                        <AvatarWithFrame
                                            avatarUrl={auth.avatarUrl || "/default-avatar.png"}
                                            frameUrl={`/avatar-frames/frame_${frameIndex + 1}.png`}
                                            size={36}
                                        />
                                    </div>
                                    <span className="text-lg font-semibold bg-gradient-to-r from-green-500 via-pink-500 to-blue-400 bg-clip-text text-transparent hidden sm:inline">
                                        {auth.fullName}
                                    </span>
                                </>
                            ) : (
                                <User className="w-6 h-6 text-gray-700" />
                            )}
                        </div>

                        {userMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute right-0 top-[calc(100%-5px)] bg-white shadow rounded-xl w-64 py-2 border border-gray-300"
                            >
                                {isAuthenticated ? (
                                    <>
                                        <NavLink to="/profile" className="block px-4 py-3 text-gray-700 hover:bg-gray-100">Thông tin cá nhân</NavLink>
                                        <NavLink to="/orders" className="block px-4 py-3 text-gray-700 hover:bg-gray-100">Đơn hàng</NavLink>
                                        <hr className="my-2 border-gray-300" />
                                        <button onClick={handleLogout} className="block w-full text-left px-4 py-3 text-red-500 hover:bg-red-100">
                                            Đăng xuất
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <NavLink to="/auth/login" className="block px-4 py-3 text-gray-700 hover:bg-gray-100">Đăng nhập</NavLink>
                                        <NavLink to="/auth/register" className="block px-4 py-3 text-gray-700 hover:bg-gray-100">Đăng ký</NavLink>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
