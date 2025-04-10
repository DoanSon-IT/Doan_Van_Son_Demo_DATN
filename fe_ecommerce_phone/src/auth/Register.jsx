import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { registerUser } from "@/api/apiAuth";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, CircularProgress } from "@mui/material";
import SnackbarAlert from "../components/common/SnackbarAlert";
import AddressSelector from "../components/common/AddressSelector";

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        password: "",
        confirmPassword: "",
    });

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "info",
    });

    const [errors, setErrors] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        password: "",
        confirmPassword: "",
    });

    const [valids, setValids] = useState({
        fullName: false,
        email: false,
        phone: false,
        address: false,
        password: false,
        confirmPassword: false,
    });

    const [loading, setLoading] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    useEffect(() => {
        window.name = "registerTab";
        window.isRegisterTab = true;
    }, []);

    const validateField = (name, value) => {
        if (name === "fullName") return value.length > 0 && value.length <= 50;
        if (name === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        if (name === "phone") return /^\d{10}$/.test(value);
        if (name === "address") return value.length > 0;
        if (name === "password") return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/.test(value);
        if (name === "confirmPassword") return value === formData.password && value.length > 0;
        return false;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (!validateField(name, value)) {
            setErrors((prev) => ({
                ...prev,
                [name]:
                    name === "fullName"
                        ? "Họ và tên không được để trống và tối đa 50 ký tự!"
                        : name === "email"
                            ? "Email không đúng định dạng!"
                            : name === "phone"
                                ? "Số điện thoại phải có đúng 10 chữ số!"
                                : name === "address"
                                    ? "Địa chỉ không được để trống!"
                                    : name === "password"
                                        ? "Mật khẩu phải có ít nhất 8 ký tự, chứa chữ và số!"
                                        : "Mật khẩu xác nhận không khớp!",
            }));
            setValids((prev) => ({ ...prev, [name]: false }));
        } else {
            setErrors((prev) => ({ ...prev, [name]: "" }));
            setValids((prev) => ({ ...prev, [name]: true }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setSnackbar({ open: true, message: "Mật khẩu xác nhận không khớp", severity: "error" });
            return;
        }

        try {
            setLoading(true);
            console.time("Register");
            const { confirmPassword, ...dataToSend } = formData;
            const response = await registerUser(dataToSend);
            console.timeEnd("Register");

            // ✅ Lưu dữ liệu để prefill khi login
            localStorage.setItem("pendingUser", JSON.stringify({
                email: formData.email,
                password: formData.password
            }));

            setSnackbar({ open: true, message: response.message, severity: "success" });
            setShowSuccessDialog(true);

        } catch (err) {
            setSnackbar({ open: true, message: err.message, severity: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] relative overflow-hidden px-4">
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage:
                        'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url("/background_auth.png")',
                }}
            ></div>

            <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="text-white px-4">
                    <div className="flex items-center mb-4">
                        <img src="/DS.png" alt="Hash Techie" className="w-10 h-10 mr-2" />
                        <h1 className="text-2xl font-bold">Doan Son Store</h1>
                    </div>
                    <h2 className="text-4xl font-extrabold mb-4">
                        Đăng ký tài khoản<br />
                    </h2>
                    <p className="text-gray-300 max-w-md mb-6">
                        Khám phá dịch vụ đỉnh cao ngay bây giờ.
                    </p>
                    <div className="flex space-x-4 text-xl">
                        <a href="#" className="hover:text-pink-500"><i className="fab fa-facebook-f"></i></a>
                        <a href="#" className="hover:text-pink-500"><i className="fab fa-twitter"></i></a>
                        <a href="#" className="hover:text-pink-500"><i className="fab fa-youtube"></i></a>
                        <a href="#" className="hover:text-pink-500"><i className="fab fa-instagram"></i></a>
                    </div>
                </div>

                <div className="w-full px-4">
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
                        <h2 className="text-3xl font-bold text-white text-center mb-6">Đăng ký</h2>

                        {errors.email && (
                            <div className="text-red-400 text-sm text-center mb-2">{errors.email}</div>
                        )}
                        {errors.address && (
                            <div className="text-red-400 text-sm text-center mb-2">{errors.address}</div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Họ và tên"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg py-3 px-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg py-3 px-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Số điện thoại"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg py-3 px-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <AddressSelector onChange={(val) => handleChange({ target: { name: "address", value: val } })} />
                            <input
                                type="password"
                                name="password"
                                placeholder="Mật khẩu"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg py-3 px-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Xác nhận mật khẩu"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg py-3 px-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />

                            <button
                                type="submit"
                                disabled={loading || Object.values(valids).some((valid) => !valid)}
                                className="w-full bg-black text-white py-3 rounded-lg hover:bg-black-600 transition-colors disabled:opacity-50"
                            >
                                {loading ? "Đang xử lý..." : "Đăng ký ngay"}
                            </button>

                            <div className="text-center mt-4 text-gray-300">
                                Đã có tài khoản?{" "}
                                <NavLink to="/auth/login" className="text-white-200 hover:underline">
                                    Đăng nhập
                                </NavLink>
                            </div>
                            <div className="text-center mt-2 text-gray-300">
                                <NavLink to="/auth/forgot-password" className="text-white-200 hover:underline">
                                    Quên mật khẩu?
                                </NavLink>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <Dialog open={showSuccessDialog} onClose={() => setShowSuccessDialog(false)}>
                <DialogTitle>🎉 Đăng ký thành công</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mt: 2 }}>
                        🎉 Đăng ký thành công!<br />
                        Vui lòng mở Gmail để xác thực tài khoản qua liên kết đã được gửi.<br />
                        Nếu không thấy email, hãy kiểm tra thư mục <strong>Spam / Quảng cáo</strong>.
                    </Typography>
                </DialogContent>

                <DialogActions>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => window.open("https://mail.google.com", "_blank", "noopener,noreferrer")}
                    >
                        Mở Gmail
                    </Button>
                    <Button onClick={() => setShowSuccessDialog(false)}>Đóng</Button>
                </DialogActions>

            </Dialog>

            <SnackbarAlert
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            />
        </div>
    );
};

export default Register;