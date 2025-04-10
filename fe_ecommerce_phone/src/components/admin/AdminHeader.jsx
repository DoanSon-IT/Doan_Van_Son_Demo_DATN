import { FaBell, FaUserCog, FaSignOutAlt, FaMoon, FaSun } from "react-icons/fa";
import { useState, useContext } from "react";
import { useTheme } from "../../context/AppThemeContext";
import { useNavigate } from "react-router-dom";
import AppContext from "../../context/AppContext";

const AdminHeader = () => {
    const [showMenu, setShowMenu] = useState(false);
    const { darkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const { logout } = useContext(AppContext);

    const avatarUrl = darkMode
        ? "/admin/admin-night.png"
        : "/admin/admin-day.png";

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <div className="fixed top-0 left-0 right-0 h-[72px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-md flex justify-between items-center px-6 z-50">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Chào mừng bạn đến với trang quản trị!
            </h2>

            <div className="flex items-center space-x-4">
                <button className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                    <FaBell className="text-gray-700 dark:text-gray-300" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                </button>

                <div className="relative">
                    <img
                        onClick={() => setShowMenu(!showMenu)}
                        src={avatarUrl}
                        alt="Admin Avatar"
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-400 cursor-pointer avatar-glow"
                    />

                    {showMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-xl shadow-lg py-2 z-50">
                            <a
                                href="/admin/profile"
                                className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                            >
                                <FaUserCog className="mr-2" /> Quản lý hồ sơ
                            </a>
                            <button
                                onClick={toggleTheme}
                                className="flex items-center px-4 py-2 w-full hover:bg-gray-100 dark:hover:bg-gray-500 dark:hover:text-white"
                            >
                                {darkMode ? <FaSun className="mr-2" /> : <FaMoon className="mr-2" />} Đổi theme
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center px-4 py-2 w-full text-red-500 hover:bg-red-100 dark:hover:bg-red-700 dark:hover:text-white"
                            >
                                <FaSignOutAlt className="mr-2" /> Đăng xuất
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminHeader;
