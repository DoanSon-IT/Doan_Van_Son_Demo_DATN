import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyUser } from "@/api/apiAuth";
import { CircularProgress, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";

const VerifyAccount = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const rawToken = searchParams.get("token");
    const token = decodeURIComponent(rawToken?.trim());

    const [status, setStatus] = useState("loading");
    const [message, setMessage] = useState("🔄 Đang xác thực tài khoản...");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("❌ Không tìm thấy token xác thực!");
            return;
        }

        const verify = async () => {
            try {
                console.log("🎯 Token FE gửi đi:", token);
                const res = await verifyUser(token);
                console.log("✅ Kết quả xác thực:", res);

                if (res?.message?.includes("thành công")) {
                    localStorage.setItem("verified_done", "true");
                    setMessage("📡 Đang kết nối tới máy chủ...");
                    await new Promise((r) => setTimeout(r, 1000));
                    setMessage("🔐 Đang kiểm tra mã xác thực...");
                    await new Promise((r) => setTimeout(r, 1000));
                    setMessage("✅ Tài khoản đã được xác minh thành công!");
                    setStatus("success");
                    await new Promise((r) => setTimeout(r, 2000));
                } else {
                    setStatus("error");
                    setMessage("❌ Phản hồi xác thực không hợp lệ.");
                    return;
                }

                if (window.opener && !window.opener.closed) {
                    window.opener.location.href = "/auth/login";
                    window.close();
                } else {
                    setTimeout(() => navigate("/auth/login"), 3000);
                }
            } catch (err) {
                const msg = err?.response?.data?.message || err.message || "❌ Xác thực thất bại.";
                console.error("❌ Lỗi xác thực:", err);

                if (msg.includes("đã được xác minh trước đó")) {
                    setMessage("⚠️ Tài khoản đã được xác minh trước đó.");
                    setStatus("info");
                    setTimeout(() => navigate("/auth/login"), 3000);
                } else {
                    setMessage(msg);
                    setStatus("error");
                }
            }
        };

        verify();
    }, [token, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 text-center w-full max-w-md"
            >
                {(status === "loading" || status === "success") && (
                    <>
                        <CircularProgress sx={{ color: "white" }} />
                        <Typography variant="h6" sx={{ color: "white", mt: 2 }}>{message}</Typography>
                    </>
                )}

                {status === "info" && (
                    <>
                        <CheckCircle size={64} color="gold" className="mx-auto mb-4" />
                        <Typography variant="h6" sx={{ color: "gold", mt: 2 }}>{message}</Typography>
                    </>
                )}

                {status === "error" && (
                    <>
                        <XCircle size={64} color="tomato" className="mx-auto mb-4" />
                        <Typography variant="h6" sx={{ color: "tomato", mt: 2 }}>{message}</Typography>
                        <Button
                            variant="outlined"
                            color="error"
                            sx={{ mt: 3 }}
                            onClick={() => navigate("/auth/resend")}
                        >
                            Gửi lại email xác thực
                        </Button>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default VerifyAccount;