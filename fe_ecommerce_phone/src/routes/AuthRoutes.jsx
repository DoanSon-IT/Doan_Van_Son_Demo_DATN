import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";

// 🔥 Lazy import các page auth
const Login = lazy(() => import("../auth/Login"));
const Register = lazy(() => import("../auth/Register"));
const ForgotPassword = lazy(() => import("../auth/ForgotPassword"));
const OAuth2Success = lazy(() => import("../auth/OAuth2Success"));
const VerifyAccount = lazy(() => import("../auth/VerifyAccount"));

const AuthRoutes = () => {
    return (
        <Suspense
            fallback={
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                    <CircularProgress color="info" />
                </Box>
            }
        >
            <Routes>
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="verify" element={<VerifyAccount />} />
                <Route path="oauth2/success" element={<OAuth2Success />} />
                <Route path="*" element={<Navigate to="/auth/login" replace />} />
            </Routes>
        </Suspense>
    );
};

export default AuthRoutes;
