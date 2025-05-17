import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaUserShield } from "react-icons/fa";
import { useTheme } from "../../context/AppThemeContext";
import AppContext from "../../context/AppContext";

const AdminProfile = () => {
    const { darkMode } = useTheme();
    const { auth } = useContext(AppContext);
    const [admin, setAdmin] = useState(null);

    useEffect(() => {
        if (auth && auth.roles && auth.roles.includes("ADMIN")) {
            setAdmin(auth);
        } else {
            // Thử lấy từ sessionStorage nếu context chưa có
            const storedAuth = sessionStorage.getItem("auth");
            if (storedAuth) {
                const parsed = JSON.parse(storedAuth);
                if (parsed.roles && parsed.roles.includes("ADMIN")) {
                    setAdmin(parsed);
                }
            }
        }
    }, [auth]);

    const avatar = darkMode ? "/admin/admin-night.png" : "/admin/admin-day.png";

    if (!admin) {
        return (
            <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8 mt-10 text-center text-red-500">
                Không tìm thấy thông tin quản trị viên hoặc bạn chưa đăng nhập.
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8 mt-10">
            <motion.h1
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8"
            >
                Hồ sơ quản trị viên
            </motion.h1>

            <div className="flex flex-col items-center gap-6">
                <img
                    src={admin.avatarUrl || avatar}
                    alt="Admin Avatar"
                    className="w-28 h-28 rounded-full object-cover border-4 border-purple-500 shadow-md"
                />

                <div className="space-y-4 text-gray-800 dark:text-gray-200 w-full">
                    <div className="flex items-center gap-3">
                        <FaUser className="text-purple-500" />
                        <span className="font-semibold">Tên:</span>
                        <span>{admin.fullName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <FaEnvelope className="text-purple-500" />
                        <span className="font-semibold">Email:</span>
                        <span>{admin.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <FaPhone className="text-purple-500" />
                        <span className="font-semibold">Số điện thoại:</span>
                        <span>{admin.phone || "Chưa cập nhật"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <FaUserShield className="text-purple-500" />
                        <span className="font-semibold">Vai trò:</span>
                        <span>{admin.roles && admin.roles.join(", ")}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <FaMapMarkerAlt className="text-purple-500" />
                        <span className="font-semibold">Địa chỉ:</span>
                        <span>{admin.address || "Chưa cập nhật"}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;