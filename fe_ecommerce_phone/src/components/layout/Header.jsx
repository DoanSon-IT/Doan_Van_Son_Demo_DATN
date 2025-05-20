import { useState, useEffect, useContext, useCallback } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, User, Search, Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AppContext } from "../../context/AppContext";
import apiProduct from "../../api/apiProduct";
import apiCategory from "../../api/apiCategory";
import debounce from "lodash/debounce";
import AvatarWithFrame from "../common/AvatarWithFrame";
import BubbleBackground from "./BubbleBackground";
import BlueFlameIcon from "../common/BlueFlameIcon";

const Header = ({ isScrolled }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { auth, logout, cartItems, authLoading } = useContext(AppContext);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [frameIndex, setFrameIndex] = useState(() => Number(localStorage.getItem("avatarFrame")) || 0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);

    const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const hasAuthToken = () => {
        const match = document.cookie.match(new RegExp("(^| )auth_token=([^;]+)"));
        console.log("Auth token check:", match); // Debug log
        return !!match;
    };
    const isAuthenticated = () => {
        const hasToken = hasAuthToken();
        const hasUser = !!auth;
        console.log("Auth state:", { hasToken, hasUser, auth }); // Debug log
        return hasToken && hasUser;
    };

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

    if (authLoading) {
        return <div className="h-16 flex items-center justify-center">Đang tải...</div>;
    }

    return (
        <motion.header
            initial="initial"
            animate="animate"
            exit="exit"
            variants={headerVariants}
            className={`fixed left-0 w-full z-[1100] bg-black transition-all duration-300 shadow-lg ${isScrolled ? 'top-0 backdrop-blur-xl shadow-2xl' : 'top-[48px]'}`}
            style={{ height: '64px' }}
        >
            <BubbleBackground />
            <div className="relative z-10 max-w-[2000px] mx-auto h-full flex items-center justify-between px-6 hidden md:flex" style={{ height: '64px' }}>
                {/* Logo */}
                <NavLink to="/" className="flex items-center mr-4">
                    <motion.img
                        src="/Logo.png"
                        alt="Logo"
                        className="w-28 h-auto"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400 }}
                    />
                </NavLink>
                {/* Menu */}
                <nav className="flex-1 flex items-center justify-center gap-x-8">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `flex items-center gap-1 px-4 py-2 text-lg font-bold rounded-lg tracking-wider transition-all duration-200 border-b-2
                            ${isActive
                                ? "text-white bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700 shadow-lg shadow-blue-400/50 animate-glow border-blue-500"
                                : "text-white bg-transparent hover:bg-gradient-to-r hover:from-blue-300 hover:via-blue-500 hover:to-blue-700 hover:text-white hover:shadow-lg hover:shadow-blue-400/50 border-transparent"}
                            `
                        }
                    >
                        <span>Trang&nbsp;chủ</span>
                    </NavLink>
                    <NavLink
                        to="/products"
                        className={({ isActive }) =>
                            `flex items-center gap-1 px-4 py-2 text-lg font-bold rounded-lg tracking-wider transition-all duration-200 border-b-2
                            ${isActive
                                ? "text-white bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700 shadow-lg shadow-blue-400/50 animate-glow border-blue-500"
                                : "text-white bg-transparent hover:bg-gradient-to-r hover:from-blue-300 hover:via-blue-500 hover:to-blue-700 hover:text-white hover:shadow-lg hover:shadow-blue-400/50 border-transparent"}
                            `
                        }
                    >
                        <span>Sản&nbsp;phẩm</span>
                    </NavLink>
                    <NavLink
                        to="/about"
                        className={({ isActive }) =>
                            `flex items-center gap-1 px-4 py-2 text-lg font-bold rounded-lg tracking-wider transition-all duration-200 border-b-2
                            ${isActive
                                ? "text-white bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700 shadow-lg shadow-blue-400/50 animate-glow border-blue-500"
                                : "text-white bg-transparent hover:bg-gradient-to-r hover:from-blue-300 hover:via-blue-500 hover:to-blue-700 hover:text-white hover:shadow-lg hover:shadow-blue-400/50 border-transparent"}
                            `
                        }
                    >
                        <span>Giới&nbsp;thiệu</span>
                    </NavLink>
                    <NavLink
                        to="/contact"
                        className={({ isActive }) =>
                            `flex items-center gap-1 px-4 py-2 text-lg font-bold rounded-lg tracking-wider transition-all duration-200 border-b-2
                            ${isActive
                                ? "text-white bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700 shadow-lg shadow-blue-400/50 animate-glow border-blue-500"
                                : "text-white bg-transparent hover:bg-gradient-to-r hover:from-blue-300 hover:via-blue-500 hover:to-blue-700 hover:text-white hover:shadow-lg hover:shadow-blue-400/50 border-transparent"}
                            `
                        }
                    >
                        <span>Liên&nbsp;hệ</span>
                    </NavLink>
                </nav>
                {/* Search + Icon */}
                <div className="flex items-center gap-4 ml-4">
                    <form onSubmit={handleSearch} className="relative">
                        <div className="relative flex items-center">
                            <Search className="absolute left-3 w-5 h-5 text-blue-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                className="w-56 pl-10 pr-4 py-2 text-sm bg-white/10 text-white border border-blue-400 rounded-xl shadow focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-blue-200 transition-all duration-200"
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
                            className="p-2 rounded-full hover:bg-blue-900/30 transition-colors duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <ShoppingCart className="w-6 h-6 text-blue-400 hover:text-blue-500 transition-colors" />
                            {cartItemCount > 0 && (
                                <motion.span
                                    key={cartItemCount}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                                >
                                    {cartItemCount}
                                </motion.span>
                            )}
                        </motion.div>
                    </NavLink>
                    <div className="relative" onMouseEnter={() => setUserMenuOpen(true)} onMouseLeave={() => setUserMenuOpen(false)}>
                        <button className="flex items-center space-x-2 p-2 rounded-full hover:bg-blue-900/30 transition-colors duration-200">
                            {isAuthenticated() ? (
                                <>
                                    <div className="w-8 h-8">
                                        <AvatarWithFrame
                                            avatarUrl={auth.avatarUrl || "/default-avatar.png"}
                                            frameUrl={`/avatar-frames/frame_${frameIndex + 1}.png`}
                                            size={32}
                                        />
                                    </div>
                                    <span className="text-sm font-semibold bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700 bg-clip-text text-transparent">
                                        {auth.fullName}
                                    </span>
                                    <ChevronDown className="w-4 h-4 text-blue-400" />
                                </>
                            ) : (
                                <User className="w-6 h-6 text-blue-400 hover:text-blue-500 transition-colors" />
                            )}
                        </button>
                        {/* Dropdown user menu desktop */}
                        <AnimatePresence>
                            {userMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute right-0 top-full mt-1 bg-black shadow-lg rounded-xl w-48 py-2 border border-gray-200 z-50 hidden md:block"
                                >
                                    {isAuthenticated() ? (
                                        <>
                                            <NavLink
                                                to="/profile"
                                                className={({ isActive }) =>
                                                    `flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg tracking-wider transition-all duration-200 border-l-4
                                                    ${isActive
                                                        ? "text-blue-700 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700 shadow-lg shadow-blue-400/30 animate-glow border-blue-500"
                                                        : "text-white bg-transparent hover:bg-gradient-to-r hover:from-blue-300 hover:via-blue-500 hover:to-blue-700 hover:text-white hover:shadow-lg hover:shadow-blue-400/30 border-transparent"}
                                                    `
                                                }
                                            >
                                                Thông tin cá nhân
                                            </NavLink>
                                            <NavLink
                                                to="/orders"
                                                className={({ isActive }) =>
                                                    `flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg tracking-wider transition-all duration-200 border-l-4
                                                    ${isActive
                                                        ? "text-blue-700 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700 shadow-lg shadow-blue-400/30 animate-glow border-blue-500"
                                                        : "text-white bg-transparent hover:bg-gradient-to-r hover:from-blue-300 hover:via-blue-500 hover:to-blue-700 hover:text-white hover:shadow-lg hover:shadow-blue-400/30 border-transparent"}
                                                    `
                                                }
                                            >
                                                Đơn hàng
                                            </NavLink>
                                            <hr className="my-2 border-gray-200" />
                                            <button
                                                onClick={handleLogout}
                                                className={({ isActive }) =>
                                                    `flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg tracking-wider transition-all duration-200 border-l-4
                                                    ${isActive
                                                        ? "text-red-500 bg-gradient-to-r from-red-400 via-red-500 to-red-700 shadow-lg shadow-red-400/30 animate-glow border-red-500"
                                                        : "text-white bg-transparent hover:bg-gradient-to-r hover:from-red-300 hover:via-red-500 hover:to-red-700 hover:text-white hover:shadow-lg hover:shadow-red-400/30 border-transparent"}
                                                    `
                                                }
                                            >
                                                Đăng xuất
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <NavLink
                                                to="/auth/login"
                                                className={({ isActive }) =>
                                                    `flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg tracking-wider transition-all duration-200 border-l-4
                                                    ${isActive
                                                        ? "text-blue-700 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700 shadow-lg shadow-blue-400/30 animate-glow border-blue-500"
                                                        : "text-white bg-transparent hover:bg-gradient-to-r hover:from-blue-300 hover:via-blue-500 hover:to-blue-700 hover:text-white hover:shadow-lg hover:shadow-blue-400/30 border-transparent"}
                                                    `
                                                }
                                            >
                                                Đăng nhập
                                            </NavLink>
                                            <NavLink
                                                to="/auth/register"
                                                className={({ isActive }) =>
                                                    `flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg tracking-wider transition-all duration-200 border-l-4
                                                    ${isActive
                                                        ? "text-blue-700 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700 shadow-lg shadow-blue-400/30 animate-glow border-blue-500"
                                                        : "text-white bg-transparent hover:bg-gradient-to-r hover:from-blue-300 hover:via-blue-500 hover:to-blue-700 hover:text-white hover:shadow-lg hover:shadow-blue-400/30 border-transparent"}
                                                    `
                                                }
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
            <div className="flex md:hidden items-center justify-between px-4 h-[72px] relative z-20 bg-black/90" style={{ paddingTop: 0 }}>
                <div className="flex items-center h-full">
                    <button
                        onClick={() => { setMobileMenuOpen(true); setUserMenuOpen(false); }}
                        className="p-2 mr-2 text-white hover:bg-blue-900/30 rounded-full transition-colors duration-200 flex items-center h-full"
                        aria-label="Open menu"
                        style={{ zIndex: 1201 }}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <NavLink to="/" className="relative flex items-center h-full">
                        <img
                            src="/Logo.png"
                            alt="Logo"
                            className="w-24 h-auto"
                        />
                    </NavLink>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { setMobileSearchOpen(true); setUserMenuOpen(false); }}
                        className="p-2 text-white hover:bg-blue-900/30 rounded-full transition-colors duration-200"
                        aria-label="Search"
                    >
                        <Search className="w-6 h-6" />
                    </button>
                    <NavLink to="/cart" className="relative">
                        <div className="p-2 text-white hover:bg-blue-900/30 rounded-full transition-colors duration-200">
                            <ShoppingCart className="w-6 h-6" />
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {cartItemCount}
                                </span>
                            )}
                        </div>
                    </NavLink>
                    <button
                        onClick={() => { setUserMenuOpen(!userMenuOpen); setMobileMenuOpen(false); }}
                        className="p-2 text-white hover:bg-blue-900/30 rounded-full transition-colors duration-200"
                        aria-label="User menu"
                    >
                        <User className="w-6 h-6" />
                    </button>
                </div>
            </div>
            {/* Mobile User Menu */}
            <AnimatePresence>
                {userMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: "100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: "100%" }}
                        className="fixed inset-y-0 right-0 w-64 bg-black shadow-lg z-[1200] md:hidden"
                    >
                        <div className="p-4 border-b border-gray-200">
                            <button
                                onClick={() => setUserMenuOpen(false)}
                                className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors duration-200"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-4">
                            {isAuthenticated() ? (
                                <>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12">
                                            <AvatarWithFrame
                                                avatarUrl={auth.avatarUrl || "/default-avatar.png"}
                                                frameUrl={`/avatar-frames/frame_${frameIndex + 1}.png`}
                                                size={48}
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{auth.fullName}</h3>
                                            <p className="text-sm text-gray-500">{auth.email}</p>
                                        </div>
                                    </div>
                                    <NavLink
                                        to="/profile"
                                        onClick={() => setUserMenuOpen(false)}
                                        className={({ isActive }) =>
                                            `flex items-center gap-2 px-4 py-3 text-sm font-bold rounded-lg tracking-wider transition-all duration-200 border-l-4 mb-2
                                            ${isActive
                                                ? "text-blue-700 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700 shadow-lg shadow-blue-400/30 animate-glow border-blue-500"
                                                : "text-white bg-transparent hover:bg-gradient-to-r hover:from-blue-300 hover:via-blue-500 hover:to-blue-700 hover:text-white hover:shadow-lg hover:shadow-blue-400/30 border-transparent"}
                                            `
                                        }
                                    >
                                        Thông tin cá nhân
                                    </NavLink>
                                    <NavLink
                                        to="/orders"
                                        onClick={() => setUserMenuOpen(false)}
                                        className={({ isActive }) =>
                                            `flex items-center gap-2 px-4 py-3 text-sm font-bold rounded-lg tracking-wider transition-all duration-200 border-l-4 mb-2
                                            ${isActive
                                                ? "text-blue-700 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700 shadow-lg shadow-blue-400/30 animate-glow border-blue-500"
                                                : "text-whitewhite bg-transparent hover:bg-gradient-to-r hover:from-blue-300 hover:via-blue-500 hover:to-blue-700 hover:text-white hover:shadow-lg hover:shadow-blue-400/30 border-transparent"}
                                            `
                                        }
                                    >
                                        Đơn hàng
                                    </NavLink>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setUserMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold rounded-lg tracking-wider transition-all duration-200 border-l-4 text-white bg-transparent hover:bg-gradient-to-r hover:from-red-300 hover:via-red-500 hover:to-red-700 hover:text-white hover:shadow-lg hover:shadow-red-400/30 border-transparent"
                                    >
                                        Đăng xuất
                                    </button>
                                </>
                            ) : (
                                <>
                                    <NavLink
                                        to="/auth/login"
                                        onClick={() => setUserMenuOpen(false)}
                                        className={({ isActive }) =>
                                            `flex items-center gap-2 px-4 py-3 text-sm font-bold rounded-lg tracking-wider transition-all duration-200 border-l-4 mb-2
                                            ${isActive
                                                ? "text-blue-700 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700 shadow-lg shadow-blue-400/30 animate-glow border-blue-500"
                                                : "text-white bg-transparent hover:bg-gradient-to-r hover:from-blue-300 hover:via-blue-500 hover:to-blue-700 hover:text-white hover:shadow-lg hover:shadow-blue-400/30 border-transparent"}
                                            `
                                        }
                                    >
                                        Đăng nhập
                                    </NavLink>
                                    <NavLink
                                        to="/auth/register"
                                        onClick={() => setUserMenuOpen(false)}
                                        className={({ isActive }) =>
                                            `flex items-center gap-2 px-4 py-3 text-sm font-bold rounded-lg tracking-wider transition-all duration-200 border-l-4
                                            ${isActive
                                                ? "text-blue-700 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700 shadow-lg shadow-blue-400/30 animate-glow border-blue-500"
                                                : "text-white bg-transparent hover:bg-gradient-to-r hover:from-blue-300 hover:via-blue-500 hover:to-blue-700 hover:text-white hover:shadow-lg hover:shadow-blue-400/30 border-transparent"}
                                            `
                                        }
                                    >
                                        Đăng ký
                                    </NavLink>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
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
                            className="fixed top-0 left-0 h-screen w-4/5 max-w-xs bg-black z-[1200] shadow-xl flex flex-col"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-gray-800">
                                <span className="text-lg font-semibold text-white">Menu</span>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 text-white hover:bg-blue-900/30 rounded-full transition-colors duration-200"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto py-2">
                                <nav className="flex flex-col gap-y-2 mt-2">
                                    <NavLink
                                        to="/"
                                        className={({ isActive }) =>
                                            `flex items-center gap-1 px-4 py-3 text-lg font-bold rounded-lg tracking-wider transition-all duration-200 border-l-4
                                            ${isActive
                                                ? "text-white bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700 shadow-lg shadow-blue-400/50 animate-glow border-blue-500"
                                                : "text-white bg-transparent hover:bg-gradient-to-r hover:from-blue-300 hover:via-blue-500 hover:to-blue-700 hover:text-white hover:shadow-lg hover:shadow-blue-400/50 border-transparent"}
                                            `
                                        }
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <span>Trang&nbsp;chủ</span>
                                    </NavLink>
                                    <NavLink
                                        to="/products"
                                        className={({ isActive }) =>
                                            `flex items-center gap-1 px-4 py-3 text-lg font-bold rounded-lg tracking-wider transition-all duration-200 border-l-4
                                            ${isActive
                                                ? "text-white bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700 shadow-lg shadow-blue-400/50 animate-glow border-blue-500"
                                                : "text-white bg-transparent hover:bg-gradient-to-r hover:from-blue-300 hover:via-blue-500 hover:to-blue-700 hover:text-white hover:shadow-lg hover:shadow-blue-400/50 border-transparent"}
                                            `
                                        }
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <span>Sản&nbsp;phẩm</span>
                                    </NavLink>
                                    <NavLink
                                        to="/about"
                                        className={({ isActive }) =>
                                            `flex items-center gap-1 px-4 py-3 text-lg font-bold rounded-lg tracking-wider transition-all duration-200 border-l-4
                                            ${isActive
                                                ? "text-white bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700 shadow-lg shadow-blue-400/50 animate-glow border-blue-500"
                                                : "text-white bg-transparent hover:bg-gradient-to-r hover:from-blue-300 hover:via-blue-500 hover:to-blue-700 hover:text-white hover:shadow-lg hover:shadow-blue-400/50 border-transparent"}
                                            `
                                        }
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <span>Giới&nbsp;thiệu</span>
                                    </NavLink>
                                    <NavLink
                                        to="/contact"
                                        className={({ isActive }) =>
                                            `flex items-center gap-1 px-4 py-3 text-lg font-bold rounded-lg tracking-wider transition-all duration-200 border-l-4
                                            ${isActive
                                                ? "text-white bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700 shadow-lg shadow-blue-400/50 animate-glow border-blue-500"
                                                : "text-white bg-transparent hover:bg-gradient-to-r hover:from-blue-300 hover:via-blue-500 hover:to-blue-700 hover:text-white hover:shadow-lg hover:shadow-blue-400/50 border-transparent"}
                                            `
                                        }
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <span>Liên&nbsp;hệ</span>
                                    </NavLink>
                                </nav>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            {/* Mobile Search Popup */}
            <AnimatePresence>
                {mobileSearchOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black z-[1100]"
                            onClick={() => setMobileSearchOpen(false)}
                        />
                        <motion.div
                            initial={{ y: "-100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "-100%" }}
                            transition={{ type: "tween", duration: 0.3 }}
                            className="fixed top-0 left-0 w-full bg-black z-[1200] shadow-xl p-4 flex flex-col"
                        >
                            <div className="flex items-center mb-4">
                                <button
                                    onClick={() => setMobileSearchOpen(false)}
                                    className="p-2 text-blue-400 hover:bg-blue-900/30 rounded-full transition-colors duration-200"
                                >
                                    <X className="w-6 h-6 text-white" />
                                </button>
                                <span className="ml-2 text-lg font-semibold text-white">Tìm kiếm</span>
                            </div>
                            <form onSubmit={handleSearch} className="w-full">
                                <div className="relative flex items-center w-full">
                                    <Search className="absolute left-3 w-5 h-5 text-blue-400" />
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm..."
                                        className="w-full pl-10 pr-4 py-3 text-base bg-black text-white border border-blue-400 rounded-xl shadow focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-blue-200 transition-all duration-200"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        onFocus={() => setShowSuggestions(true)}
                                        autoFocus
                                    />
                                </div>
                            </form>
                            <AnimatePresence>
                                {showSuggestions && suggestions.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="mt-2 bg-black shadow-lg rounded-xl w-full py-2 border border-gray-700 z-50"
                                    >
                                        {suggestions.map((suggestion, index) => (
                                            <div
                                                key={index}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                className="px-4 py-2 text-base text-white hover:bg-gray-800 cursor-pointer transition-colors duration-200"
                                            >
                                                {suggestion.label}
                                                {suggestion.type === "category" && (
                                                    <span className="text-xs text-gray-400 ml-2">(Danh mục)</span>
                                                )}
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.header>
    );
};

export default Header;