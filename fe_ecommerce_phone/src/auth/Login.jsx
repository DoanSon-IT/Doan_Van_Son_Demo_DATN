// 📁 File: Login.jsx
import React, { useState, useContext, useEffect } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import AppContext from "../context/AppContext";
import ResendVerificationForm from "../components/auth/ResendVerificationForm";
import SnackbarAlert from "../components/common/SnackbarAlert";

const Login = () => {
  const { login } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "", general: "" });
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showResendForm, setShowResendForm] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  useEffect(() => {
    const pending = localStorage.getItem("pendingUser");
    if (pending) {
      const data = JSON.parse(pending);
      setFormData({
        email: data.email || "",
        password: data.password || ""
      });
      localStorage.removeItem("pendingUser");
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({ email: "", password: "", general: "" });
    setShowResendForm(false);

    try {
      const user = await login(formData);

      if (user) {
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", formData.email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        const storedIntent = localStorage.getItem("redirectIntent");
        const redirectTo = storedIntent || location.state?.redirectTo || "/";
        localStorage.removeItem("redirectIntent");

        if (user?.roles?.includes("ADMIN")) {
          navigate("/admin/dashboard", { replace: true });
        } else {
          if (redirectTo === "/checkout" && location.state?.cartData) {
            navigate("/checkout", { state: { selectedProducts: location.state.cartData } });
          } else {
            navigate(redirectTo, { replace: true });
          }
        }
      }
    } catch (err) {
      const errorMessage = err.message || "Đăng nhập thất bại";
      setErrors((prev) => ({ ...prev, general: errorMessage }));

      if (errorMessage.includes("chưa được xác thực")) {
        setShowResendForm(true);
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    const from = location.state?.from?.pathname || "/";
    sessionStorage.setItem("oauth2_redirect_path", from);
    const oauthUrl = `http://localhost:8080/oauth2/authorization/${provider}?state=${from}`;
    window.location.href = oauthUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] relative overflow-hidden px-4">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url("/background_auth.png")',
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      ></div>

      {/* Main Content Wrapper */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Content */}
        <div className="text-white px-4">
          <div className="flex items-center mb-4">
            <img src="/DS.png" alt="Hash Techie" className="w-10 h-10 mr-2" />
            <h1 className="text-2xl font-bold">Doan Son Store</h1>
          </div>
          <h2 className="text-4xl font-extrabold mb-4">
            Chào mừng bạn!<br />
          </h2>
          <p className="text-gray-300 max-w-md mb-6">
            Trải nghiệm mua sắm điện thoại thông minh – giao diện thân thiện, bảo hành rõ ràng, hỗ trợ tận tâm.
          </p>
          <div className="flex space-x-4 text-xl">
            <a href="https://www.facebook.com/daviddsondz" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://twitter.com/DoanSonStore" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://www.youtube.com/@DoanSonStore" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500">
              <i className="fab fa-youtube"></i>
            </a>
            <a href="https://www.instagram.com/DoanSonStore" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>

        {/* Login Form */}
        <div className="w-full px-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
            <h2 className="text-3xl font-bold text-white text-center mb-6">Đăng nhập</h2>

            {errors.general && (
              <div className="text-red-400 text-sm text-center mb-2">{errors.general}</div>
            )}

            {showResendForm && (
              <div className="mt-2">
                <ResendVerificationForm />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg py-3 px-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mật khẩu"
                className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg py-3 px-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

              <div className="flex justify-between items-center">
                <label className="flex items-center text-white text-sm">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={handleRememberMeChange}
                    className="mr-2 bg-white/10 border border-white/20 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  Ghi nhớ mật khẩu
                </label>
                <a href="/auth/forgot-password" className="text-white hover:underline text-sm">
                  Quên mật khẩu?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3 rounded-lg hover:bg-black-600 transition-colors"
              >
                {loading ? "Đang xử lý..." : "Đăng Nhập"}
              </button>

              <div className="text-center text-gray-300 my-4">Hoặc đăng nhập bằng</div>

              <div className="flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={() => handleSocialLogin("google")}
                  className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors"
                >
                  <i className="fab fa-google text-white"></i>
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin("facebook")}
                  className="bg-white/20 p-3 rounded-full hover:bg-white/30 transition-colors"
                >
                  <i className="fab fa-facebook text-white"></i>
                </button>
              </div>

              <div className="text-center mt-4 text-gray-300">
                Chưa có tài khoản?
                <NavLink to="/auth/register" className="text-white-200 ml-2 hover:underline">
                  Đăng ký
                </NavLink>
              </div>
            </form>
          </div>
        </div>
      </div>
      <SnackbarAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </div>
  );
};

export default Login;
