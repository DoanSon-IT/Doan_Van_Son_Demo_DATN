const getVerifyUrl = (token) => {
    const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
    return `${baseUrl}/api/auth/verify?token=${token}`;
};

export default getVerifyUrl;
