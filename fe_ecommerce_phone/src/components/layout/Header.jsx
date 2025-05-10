import { useState, useEffect, useContext, useCallback } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, User, Search, Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AppContext from "../../context/AppContext";
import apiProduct from "../../api/apiProduct";
import apiCategory from "../../api/apiCategory";
import debounce from "lodash/debounce";
import AvatarWithFrame from "../common/AvatarWithFrame";

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { auth, logout, cartItems } = useContext(AppContext);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [frameIndex, setFrameIndex] = useState(() => Number(localStorage.getItem("avatarFrame")) || 0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);

    const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const isAuthenticated = !!auth;

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            setIsScrolled(scrollPosition > 48); // Chuyển sang top-0 khi cuộn quá 48px
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
        setMobileSearchOpen(false);
        setUserMenuOpen(false);
    }, [location.pathname]);

    // Update avatar frame
    useEffect(() => {
        const interval = setInterval(() => {
            const newIndex = Number(localStorage.getItem("avatarFrame")) || 0;
            setFrameIndex((prev) => (prev !== newIndex ? newIndex : prev));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // Handle body scroll lock
    useEffect(() => {
        if (mobileMenuOpen || mobileSearchOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [mobileMenuOpen, mobileSearchOpen]);

    // Debounced search
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
            setMobileSearchOpen(false);
            navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setShowSuggestions(false);
        setMobileSearchOpen(false);
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
        setMobileMenuOpen(false);
        navigate("/");
    };

    const MobileNavLink = ({ to, children, onClick }) => (
        <NavLink
            to={to}
            onClick={onClick}
            className={({ isActive }) =>
                `block w-full py-4 px-6 text-lg font-medium transition-colors duration-200 ${isActive ? "text-purple-600 bg-purple-50" : "text-gray-700 hover:bg-gray-100"
                }`
            }
        >
            {children}
        </NavLink>
    );

    const headerVariants = {
        initial: { y: -100 },
        animate: { y: 0 },
        exit: { y: -100 }
    };

    const ANNOUNCEMENT_HEIGHT = 48;

    return (
        <motion.header
            initial="initial"
            animate="animate"
            exit="exit"
            variants={headerVariants}
            className={`fixed left-0 w-full z-[1050] transition-all duration-300 ${isScrolled ? "bg-white/95 backdrop-blur-xl shadow-lg top-0" : "bg-white top-[48px]"
                }`}
            style={{
                height: '64px',
            }}
        >
            <div className="max-w-[2000px] mx-auto h-full">
                {/* Desktop Header */}
                <div className="hidden md:flex items-center justify-between px-4 h-full">
                    <NavLink to="/" className="relative group">
                        <motion.img
                            src="/Logo.png"
                            alt="Logo"
                            className="w-32 h-auto"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 400 }}
                        />
                    </NavLink>

                    <nav className="flex items-center space-x-1">
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                `px-5 py-2 text-lg font-bold rounded-lg transition-all duration-200 border-b-2 ${isActive ? "text-purple-700 border-purple-700 bg-purple-50 shadow-md" : "text-gray-700 border-transparent hover:text-purple-600 hover:border-purple-400 hover:bg-purple-50 hover:shadow"}`
                            }
                        >
                            Trang chủ
                        </NavLink>
                        <NavLink
                            to="/products"
                            className={({ isActive }) =>
                                `px-5 py-2 text-lg font-bold rounded-lg transition-all duration-200 border-b-2 ${isActive ? "text-purple-700 border-purple-700 bg-purple-50 shadow-md" : "text-gray-700 border-transparent hover:text-purple-600 hover:border-purple-400 hover:bg-purple-50 hover:shadow"}`
                            }
                        >
                            Sản phẩm
                        </NavLink>
                        <NavLink
                            to="/about"
                            className={({ isActive }) =>
                                `px-5 py-2 text-lg font-bold rounded-lg transition-all duration-200 border-b-2 ${isActive ? "text-purple-700 border-purple-700 bg-purple-50 shadow-md" : "text-gray-700 border-transparent hover:text-purple-600 hover:border-purple-400 hover:bg-purple-50 hover:shadow"}`
                            }
                        >
                            Giới thiệu
                        </NavLink>
                        <NavLink
                            to="/contact"
                            className={({ isActive }) =>
                                `px-5 py-2 text-lg font-bold rounded-lg transition-all duration-200 border-b-2 ${isActive ? "text-purple-700 border-purple-700 bg-purple-50 shadow-md" : "text-gray-700 border-transparent hover:text-purple-600 hover:border-purple-400 hover:bg-purple-50 hover:shadow"}`
                            }
                        >
                            Liên hệ
                        </NavLink>
                    </nav>

                    <div className="flex items-center space-x-4">
                        <form onSubmit={handleSearch} className="relative">
                            <div className="relative flex items-center">
                                <Search className="absolute left-3 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm..."
                                    className="w-64 pl-10 pr-4 py-2 text-sm bg-gray-100 text-gray-900 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400 transition-all duration-200"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    onFocus={() => setShowSuggestions(true)}
                                />
                                <AnimatePresence>
                                    {showSuggestions && suggestions.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute left-0 top-full mt-1 bg-white shadow-lg rounded-xl w-full py-2 border border-gray-200 z-50"
                                        >
                                            {suggestions.map((suggestion, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => handleSuggestionClick(suggestion)}
                                                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                                                >
                                                    {suggestion.label}
                                                    {suggestion.type === "category" && (
                                                        <span className="text-xs text-gray-500 ml-2">(Danh mục)</span>
                                                    )}
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </form>

                        <NavLink to="/cart" className="relative group">
                            <motion.div
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <ShoppingCart className="w-6 h-6 text-gray-700" />
                                {cartItemCount > 0 && (
                                    <motion.span
                                        key={cartItemCount}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                                    >
                                        {cartItemCount}
                                    </motion.span>
                                )}
                            </motion.div>
                        </NavLink>

                        <div className="relative" onMouseEnter={() => setUserMenuOpen(true)} onMouseLeave={() => setUserMenuOpen(false)}>
                            <button className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                                {isAuthenticated ? (
                                    <>
                                        <div className="w-8 h-8">
                                            <AvatarWithFrame
                                                avatarUrl={auth.avatarUrl || "/default-avatar.png"}
                                                frameUrl={`/avatar-frames/frame_${frameIndex + 1}.png`}
                                                size={32}
                                            />
                                        </div>
                                        <span className="text-sm font-semibold bg-gradient-to-r from-green-500 via-pink-500 to-blue-400 bg-clip-text text-transparent">
                                            {auth.fullName}
                                        </span>
                                        <ChevronDown className="w-4 h-4 text-gray-500" />
                                    </>
                                ) : (
                                    <User className="w-6 h-6 text-gray-700" />
                                )}
                            </button>

                            <AnimatePresence>
                                {userMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-xl w-48 py-2 border border-gray-200 z-50"
                                    >
                                        {isAuthenticated ? (
                                            <>
                                                <NavLink
                                                    to="/profile"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                                                >
                                                    Thông tin cá nhân
                                                </NavLink>
                                                <NavLink
                                                    to="/orders"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                                                >
                                                    Đơn hàng
                                                </NavLink>
                                                <hr className="my-2 border-gray-200" />
                                                <button
                                                    onClick={handleLogout}
                                                    className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors duration-200"
                                                >
                                                    Đăng xuất
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <NavLink
                                                    to="/auth/login"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                                                >
                                                    Đăng nhập
                                                </NavLink>
                                                <NavLink
                                                    to="/auth/register"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                                                >
                                                    Đăng ký
                                                </NavLink>
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Mobile Header */}
                <div className="flex md:hidden items-center justify-between px-4 h-full">
                    <div className="flex items-center">
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="p-2 mr-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200"
                            aria-label="Open menu"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <NavLink to="/" className="relative">
                            <img
                                src="/Logo.png"
                                alt="Logo"
                                className="w-24 h-auto"
                            />
                        </NavLink>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setMobileSearchOpen(true)}
                            className="p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200"
                            aria-label="Search"
                        >
                            <Search className="w-6 h-6" />
                        </button>

                        <NavLink to="/cart" className="relative">
                            <div className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                                <ShoppingCart className="w-6 h-6 text-gray-700" />
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                        {cartItemCount}
                                    </span>
                                )}
                            </div>
                        </NavLink>
                    </div>
                </div>

                {/* Mobile Menu Sidebar */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.5 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black z-[1100]"
                                onClick={() => setMobileMenuOpen(false)}
                            />

                            <motion.div
                                initial={{ x: "-100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "-100%" }}
                                transition={{ type: "tween", duration: 0.3 }}
                                className="fixed top-0 left-0 h-screen w-4/5 max-w-xs bg-white z-[1100] shadow-xl flex flex-col"
                                style={{ marginTop: ANNOUNCEMENT_HEIGHT }}
                            >
                                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                    {isAuthenticated ? (
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10">
                                                <AvatarWithFrame
                                                    avatarUrl={auth.avatarUrl || "/default-avatar.png"}
                                                    frameUrl={`/avatar-frames/frame_${frameIndex + 1}.png`}
                                                    size={40}
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-base font-medium text-gray-900">{auth.fullName}</span>
                                                <span className="text-sm text-gray-500">Đã đăng nhập</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-lg font-semibold">Menu</div>
                                    )}
                                    <button
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto py-2">
                                    <nav className="flex flex-col">
                                        <MobileNavLink to="/" onClick={() => setMobileMenuOpen(false)}>
                                            Trang chủ
                                        </MobileNavLink>
                                        <MobileNavLink to="/products" onClick={() => setMobileMenuOpen(false)}>
                                            Sản phẩm
                                        </MobileNavLink>
                                        <MobileNavLink to="/about" onClick={() => setMobileMenuOpen(false)}>
                                            Giới thiệu
                                        </MobileNavLink>
                                        <MobileNavLink to="/contact" onClick={() => setMobileMenuOpen(false)}>
                                            Liên hệ
                                        </MobileNavLink>
                                    </nav>

                                    <div className="border-t border-gray-200 mt-4 pt-4">
                                        {isAuthenticated ? (
                                            <>
                                                <MobileNavLink to="/profile" onClick={() => setMobileMenuOpen(false)}>
                                                    Thông tin cá nhân
                                                </MobileNavLink>
                                                <MobileNavLink to="/orders" onClick={() => setMobileMenuOpen(false)}>
                                                    Đơn hàng
                                                </MobileNavLink>
                                                <button
                                                    onClick={handleLogout}
                                                    className="block w-full text-left py-4 px-6 text-base font-medium text-red-500 hover:bg-red-50 transition-colors duration-200"
                                                >
                                                    Đăng xuất
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <MobileNavLink to="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                                                    Đăng nhập
                                                </MobileNavLink>
                                                <MobileNavLink to="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                                                    Đăng ký
                                                </MobileNavLink>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Mobile Search Overlay */}
                <AnimatePresence>
                    {mobileSearchOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="fixed inset-0 z-[1001] bg-white p-4 flex flex-col"
                            style={{
                                top: isScrolled ? '64px' : '112px', // Adjust based on scroll state
                            }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">Tìm kiếm</h2>
                                <button
                                    onClick={() => setMobileSearchOpen(false)}
                                    className="p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSearch} className="relative flex-1">
                                <div className="relative flex items-center">
                                    <Search className="absolute left-3 w-5 h-5 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm sản phẩm..."
                                        className="w-full pl-10 pr-4 py-3 text-base bg-gray-100 text-gray-900 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="mt-4 bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
                                        {suggestions.map((suggestion, index) => (
                                            <div
                                                key={index}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                className="px-4 py-3 text-base text-gray-700 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0 transition-colors duration-200"
                                            >
                                                {suggestion.label}
                                                {suggestion.type === "category" && (
                                                    <span className="text-sm text-gray-500 ml-2">(Danh mục)</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.header>
    );
};

export default Header;