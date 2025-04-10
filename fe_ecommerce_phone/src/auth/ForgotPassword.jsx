import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { forgotPassword } from "@/api/apiAuth";
import axiosInstance from "@/api/axiosConfig";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

const ForgotPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search);
    const token = query.get("token");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [showResetSuccess, setShowResetSuccess] = useState(false);

    useEffect(() => {
        if (token) setMessage("Vui lòng nhập mật khẩu mới để đặt lại!");
    }, [token]);

    useEffect(() => {
        if (showResetSuccess) {
            const timeout = setTimeout(() => navigate("/auth/login"), 3000);
            return () => clearTimeout(timeout);
        }
    }, [showResetSuccess, navigate]);

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const validatePassword = (pwd) => /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(pwd);

    const handleForgot = async (e) => {
        e.preventDefault();
        if (!validateEmail(email)) {
            setError("Email không đúng định dạng!");
            return;
        }
        try {
            const response = await forgotPassword(email);
            setMessage(response.message || "Hướng dẫn đặt lại mật khẩu đã được gửi!");
            setError("");
            setShowSuccessDialog(true);
        } catch (error) {
            setError(error.message || "Đã xảy ra lỗi, vui lòng thử lại.");
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        if (!validatePassword(password)) {
            setError("Mật khẩu phải có ít nhất 6 ký tự, gồm chữ và số!");
            return;
        }
        if (password !== confirmPassword) {
            setError("Xác nhận mật khẩu không khớp!");
            return;
        }
        try {
            const res = await axiosInstance.post("/auth/reset-password", {
                token,
                newPassword: password,
            });
            setMessage(res.data.message || "✅ Mật khẩu đã được đặt lại thành công!");
            setError("");
            setShowResetSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || "Token không hợp lệ hoặc đã hết hạn!");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] relative overflow-hidden px-4 transition-all duration-500">
            <div
                className="absolute inset-0 bg-cover bg-center opacity-90"
                style={{
                    backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url("/background_auth.png")',
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                }}
            ></div>

            <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="text-white px-4 animate-fade-in">
                    <div className="flex items-center mb-4">
                        <img src="/DS.png" alt="Logo" className="w-10 h-10 mr-2" />
                        <h1 className="text-2xl font-bold">Doan Son Store</h1>
                    </div>
                    <h2 className="text-4xl font-extrabold mb-4">
                        {token ? "Đặt lại mật khẩu" : "Khôi phục mật khẩu"}
                    </h2>
                    <p className="text-gray-300 max-w-md mb-6">
                        {token
                            ? "Nhập mật khẩu mới để tiếp tục sử dụng tài khoản."
                            : "Nhập email để nhận hướng dẫn đặt lại mật khẩu."}
                    </p>
                </div>

                <div className="w-full px-4 animate-slide-in-right">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
                        <h2 className="text-3xl font-bold text-white text-center mb-6">
                            {token ? "Tạo mật khẩu mới" : "Khôi phục mật khẩu"}
                        </h2>

                        {error && <div className="text-red-400 text-sm text-center mb-2">{error}</div>}
                        {message && <div className="text-green-400 text-sm text-center mb-2">{message}</div>}

                        {!token ? (
                            <form onSubmit={handleForgot} className="space-y-4">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg py-3 px-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    Gửi yêu cầu
                                </button>
                                <div className="text-center mt-4 text-gray-300">
                                    Quay lại {" "}
                                    <NavLink to="/auth/login" className="text-white-200 hover:underline">
                                        Đăng nhập
                                    </NavLink>
                                </div>
                            </form>
                        ) : showResetSuccess ? (
                            <div className="text-center text-white space-y-4">
                                <h3 className="text-2xl font-semibold">✅ Đặt lại mật khẩu thành công!</h3>
                                <p>Bạn sẽ được chuyển hướng về trang đăng nhập trong giây lát...</p>
                                <Button variant="outlined" color="inherit" onClick={() => navigate("/auth/login")}>Về trang đăng nhập</Button>
                            </div>
                        ) : (
                            <form onSubmit={handleReset} className="space-y-4">
                                <input
                                    type="password"
                                    placeholder="Mật khẩu mới"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg py-3 px-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                                <input
                                    type="password"
                                    placeholder="Xác nhận mật khẩu"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg py-3 px-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Đặt lại mật khẩu
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            <Dialog open={showSuccessDialog} onClose={() => setShowSuccessDialog(false)}>
                <DialogTitle>📧 Gửi yêu cầu thành công</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mt: 2 }}>
                        Chúng tôi đã gửi một email hướng dẫn đặt lại mật khẩu đến địa chỉ bạn cung cấp.<br />
                        Vui lòng mở Gmail và làm theo hướng dẫn trong thư.<br />
                        Nếu không thấy email, hãy kiểm tra thư mục <strong>Spam / Quảng cáo</strong>.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="primary" onClick={() => window.open("https://mail.google.com", "_blank")}>Mở Gmail</Button>
                    <Button onClick={() => setShowSuccessDialog(false)}>Đóng</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ForgotPassword;
