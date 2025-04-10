import React from "react";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaUserShield } from "react-icons/fa";
import { useTheme } from "../../context/AppThemeContext";

const adminInfo = {
    name: "Doan Son dep trai",
    email: "doansonstore@gmail.com",
    phone: "0585068096",
    role: "Quản trị viên cấp cao",
    address: "Hà Nội, Việt Nam",
};

const AdminProfile = () => {
    const { darkMode } = useTheme();
    const avatar = darkMode ? "/admin/admin-night.png" : "/admin/admin-day.png";

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
                    src={avatar}
                    alt="Admin Avatar"
                    className="w-28 h-28 rounded-full object-cover border-4 border-purple-500 shadow-md"
                />

                <div className="space-y-4 text-gray-800 dark:text-gray-200 w-full">
                    <div className="flex items-center gap-3">
                        <FaUser className="text-purple-500" />
                        <span className="font-semibold">Tên:</span>
                        <span>{adminInfo.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <FaEnvelope className="text-purple-500" />
                        <span className="font-semibold">Email:</span>
                        <span>{adminInfo.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <FaPhone className="text-purple-500" />
                        <span className="font-semibold">Số điện thoại:</span>
                        <span>{adminInfo.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <FaUserShield className="text-purple-500" />
                        <span className="font-semibold">Vai trò:</span>
                        <span>{adminInfo.role}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <FaMapMarkerAlt className="text-purple-500" />
                        <span className="font-semibold">Địa chỉ:</span>
                        <span>{adminInfo.address}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;