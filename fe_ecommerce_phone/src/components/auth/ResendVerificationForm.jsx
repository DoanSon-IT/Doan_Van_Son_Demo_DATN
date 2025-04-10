import React, { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import axiosInstance from "@/api/axiosConfig";

const ResendVerificationForm = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            const res = await axiosInstance.post("/auth/resend-verification", { email });
            setMessage(res.data.message || "Email xác thực đã được gửi lại.");
        } catch (err) {
            setError(err.response?.data?.message || "Đã có lỗi xảy ra khi gửi lại email.");
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
                label="Email"
                type="email"
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                Gửi lại email xác thực
            </Button>
            {message && (
                <Typography sx={{ mt: 1 }} color="success.main">
                    {message}
                </Typography>
            )}
            {error && (
                <Typography sx={{ mt: 1 }} color="error">
                    {error}
                </Typography>
            )}
        </Box>
    );
};

export default ResendVerificationForm;
