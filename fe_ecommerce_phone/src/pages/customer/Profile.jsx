import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import AppContext from "../../context/AppContext";
import apiUser from "../../api/apiUser";
import { ToastContainer, toast } from "react-toastify";
import { Camera, Download as DownloadIcon, ImageIcon, FrameIcon } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import AvatarWithFrame from "../../components/common/AvatarWithFrame";
import FrameGridSelector from "../../components/common/FrameGridSelector";
import AvatarSelector from "../../components/common/AvatarSelector"; // Import the new component

const frameOptions = Array.from({ length: 10 }, (_, i) => `/avatar-frames/frame_${i + 1}.png`);
const avatarOptions = Array.from({ length: 10 }, (_, i) => `/avatars/avatar${i + 1}.png`);

const Profile = () => {
    const { auth, setAuth } = useContext(AppContext);
    const navigate = useNavigate();
    const fileInputRef = useRef();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ fullName: "", phone: "", address: "", avatarUrl: "" });
    const [selectedFrameIndex, setSelectedFrameIndex] = useState(() => Number(localStorage.getItem("avatarFrame")) || 0);
    const [selectorView, setSelectorView] = useState("avatar");
    const [previewAvatar, setPreviewAvatar] = useState("");
    const [customAvatar, setCustomAvatar] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await apiUser.getCurrentUser();
                if (!data) {
                    throw new Error("Không thể lấy thông tin người dùng");
                }
                setProfile(data);
                setFormData({
                    fullName: data.fullName || "",
                    phone: data.phone || "",
                    address: data.address || "",
                    avatarUrl: data.avatarUrl || "",
                });
                setPreviewAvatar(data.avatarUrl || "");
            } catch (err) {
                console.error("Lỗi khi tải thông tin:", err);
                setError("Không thể tải thông tin cá nhân!");
                toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
                // Thử refresh token trước khi chuyển hướng
                try {
                    await refreshToken();
                    const user = await getCurrentUser();
                    if (user) {
                        setAuth(user);
                        // Thử tải lại profile
                        const data = await apiUser.getCurrentUser();
                        setProfile(data);
                        setFormData({
                            fullName: data.fullName || "",
                            phone: data.phone || "",
                            address: data.address || "",
                            avatarUrl: data.avatarUrl || "",
                        });
                        setPreviewAvatar(data.avatarUrl || "");
                        return;
                    }
                } catch (refreshError) {
                    console.error("Không thể refresh token:", refreshError);
                }
                navigate("/auth/login");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [navigate, setAuth]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const imageUrl = await apiUser.uploadAvatar(file);
            setFormData((prev) => ({ ...prev, avatarUrl: imageUrl }));
            setPreviewAvatar(imageUrl);
            setCustomAvatar(true);
            toast.success("Đã cập nhật avatar!");
        } catch {
            toast.error("Upload avatar thất bại!");
        }
    };

    const handleAvatarSelect = (url) => {
        setFormData((prev) => ({ ...prev, avatarUrl: url }));
        setPreviewAvatar(url);
        setCustomAvatar(false);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const updated = await apiUser.updateCurrentUser(formData);
            setProfile(updated);
            setAuth((prev) => ({ ...prev, avatarUrl: updated.avatarUrl }));
            setIsEditing(false);
            toast.success("Cập nhật thành công!");
        } catch {
            toast.error("Cập nhật thất bại!");
        }
    };

    const exportAvatarWithFrame = async () => {
        const avatarImg = new Image();
        const frameImg = new Image();
        avatarImg.crossOrigin = "anonymous";
        frameImg.crossOrigin = "anonymous";
        avatarImg.src = formData.avatarUrl || "/default-avatar.png";
        frameImg.src = frameOptions[selectedFrameIndex];

        const frameRatio = 1.4; // Match with the component
        const canvasSize = 300;
        const frameSize = canvasSize * frameRatio;
        const offset = (frameSize - canvasSize) / 2;

        await Promise.all([
            new Promise((res) => (avatarImg.onload = res)),
            new Promise((res) => (frameImg.onload = res)),
        ]);

        const canvas = document.createElement("canvas");
        canvas.width = frameSize;
        canvas.height = frameSize;
        const ctx = canvas.getContext("2d");

        // Draw circular avatar first (centered)
        ctx.save();
        ctx.beginPath();
        ctx.arc(frameSize / 2, frameSize / 2, canvasSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatarImg, frameSize / 2 - canvasSize / 2, frameSize / 2 - canvasSize / 2, canvasSize, canvasSize);
        ctx.restore();

        // Draw frame on top
        ctx.drawImage(frameImg, 0, 0, frameSize, frameSize);

        const link = document.createElement("a");
        link.download = "my-avatar.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    };

    const particlesInit = async (engine) => {
        await loadSlim(engine);
    };

    if (loading) return <div className="text-center py-10">Đang tải thông tin...</div>;
    if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

    return (
        <div className="min-h-screen flex flex-col items-center p-6 bg-white">
            <Particles
                id="tsparticles-profile"
                init={particlesInit}
                options={{
                    particles: {
                        number: { value: 40 },
                        opacity: { value: 0.3 },
                        size: { value: 3 },
                        move: { enable: true, speed: 1 },
                    },
                    interactivity: {
                        events: { onhover: { enable: true, mode: "repulse" } },
                        modes: { repulse: { distance: 100 } },
                    },
                    retina_detect: true,
                }}
                className="absolute inset-0 opacity-30 z-0"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2 }}
                className="relative z-10 w-full max-w-4xl"
            >
                <h1 className="text-3xl font-bold mb-6 text-center">Thông tin cá nhân</h1>

                {/* Avatar */}
                <div className="flex flex-col items-center mb-6 bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-xl">
                    <div className="w-64 h-64 flex items-center justify-center">
                        <AvatarWithFrame
                            avatarUrl={previewAvatar || formData.avatarUrl}
                            frameUrl={frameOptions[selectedFrameIndex]}
                            size={140}
                        />
                    </div>
                    <button
                        onClick={exportAvatarWithFrame}
                        className="mt-3 bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800"
                    >
                        <DownloadIcon className="w-4 h-4" /> Tải avatar có khung
                    </button>
                </div>

                {/* Selector khi chỉnh sửa */}
                {isEditing && (
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <div className="flex justify-center gap-4 mb-4">
                            <button
                                onClick={() => setSelectorView("avatar")}
                                className={`px-4 py-2 rounded-md flex items-center gap-2 ${selectorView === "avatar"
                                    ? "bg-purple-600 text-white"
                                    : "bg-gray-200"
                                    }`}
                            >
                                <ImageIcon className="w-5 h-5" /> Chọn Avatar
                            </button>
                            <button
                                onClick={() => setSelectorView("frame")}
                                className={`px-4 py-2 rounded-md flex items-center gap-2 ${selectorView === "frame"
                                    ? "bg-purple-600 text-white"
                                    : "bg-gray-200"
                                    }`}
                            >
                                <FrameIcon className="w-5 h-5" /> Chọn Khung
                            </button>
                            <button
                                onClick={() => fileInputRef.current.click()}
                                className="px-4 py-2 rounded-md bg-gray-800 text-white flex items-center gap-2"
                            >
                                <Camera className="w-5 h-5" /> Tải lên
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>

                        <div className="my-4">
                            {selectorView === "avatar" ? (
                                <AvatarSelector
                                    avatarOptions={avatarOptions}
                                    selectedAvatar={previewAvatar}
                                    onAvatarSelect={handleAvatarSelect}
                                />
                            ) : (
                                <FrameGridSelector
                                    frameOptions={frameOptions}
                                    selectedFrameIndex={selectedFrameIndex}
                                    setSelectedFrameIndex={setSelectedFrameIndex}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* FORM hoặc View info, nằm trong vùng cuộn */}
                <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-md overflow-y-auto max-h-[75vh] p-6 text-lg space-y-4">
                    {isEditing ? (
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="flex items-center">
                                <label className="w-40 font-semibold text-gray-700">Họ và tên:</label>
                                <input
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                                />
                            </div>
                            <div className="flex items-center">
                                <label className="w-40 font-semibold text-gray-700">Số điện thoại:</label>
                                <input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                                />
                            </div>
                            <div className="flex items-center">
                                <label className="w-40 font-semibold text-gray-700">Địa chỉ:</label>
                                <input
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-900 transition-all"
                                >
                                    Lưu
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 bg-gray-300 py-2 rounded-lg hover:bg-gray-400"
                                >
                                    Quay lại
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <div className="flex items-center">
                                <label className="w-40 font-semibold text-gray-700">Họ và tên:</label>
                                <span>{formData.fullName}</span>
                            </div>
                            <div className="flex items-center">
                                <label className="w-40 font-semibold text-gray-700">Số điện thoại:</label>
                                <span>{formData.phone}</span>
                            </div>
                            <div className="flex items-center">
                                <label className="w-40 font-semibold text-gray-700">Địa chỉ:</label>
                                <span>{formData.address}</span>
                            </div>
                            <div className="flex items-center">
                                <label className="w-40 font-semibold text-gray-700">Email:</label>
                                <span>{profile.email}</span>
                            </div>
                            <div className="flex items-center">
                                <label className="w-40 font-semibold text-gray-700">Vai trò:</label>
                                <span className="text-green-600">{profile.roles.join(", ")}</span>
                            </div>
                            <div className="flex items-center">
                                <label className="w-40 font-semibold text-gray-700">Ngày tạo:</label>
                                <span>{new Date(profile.createdAt).toLocaleDateString("vi-VN")}</span>
                            </div>
                            <div className="flex items-center">
                                <label className="w-40 font-semibold text-gray-700">Xác thực:</label>
                                <span>{profile.verified ? "Đã xác thực" : "Chưa xác thực"}</span>
                            </div>

                            <div className="flex justify-center pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="w-full md:w-1/3 bg-black text-white py-2 rounded-lg hover:bg-gray-900"
                                >
                                    Chỉnh sửa thông tin
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
            <ToastContainer />
        </div>
    );
};

export default Profile;