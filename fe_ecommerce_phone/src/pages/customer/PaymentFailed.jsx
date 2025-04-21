import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const PaymentFailed = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const errorCode = searchParams.get("code") || "unknown";

    // Get error message based on error code
    const getErrorMessage = (code) => {
        switch (code) {
            case "07": return "Thanh toán bị từ chối bởi ngân hàng";
            case "09": return "Thẻ/Tài khoản không hợp lệ";
            case "10": return "Hết hạn thanh toán";
            case "11": return "Giao dịch đã được thanh toán";
            case "24": return "Giao dịch không thành công";
            case "97": return "Dữ liệu không hợp lệ (secure hash lỗi)";
            case "99": return "Lỗi hệ thống, vui lòng thử lại";
            default: return `Thanh toán thất bại: Mã lỗi ${code}`;
        }
    };

    useEffect(() => {
        // Auto-redirect to cart after 5 seconds
        const timeout = setTimeout(() => {
            navigate("/cart");
        }, 5000);

        return () => clearTimeout(timeout);
    }, [navigate]);

    return (
        <div className="max-w-screen-2xl mx-auto p-9 pt-24">
            <div className="text-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
                    <h2 className="text-2xl font-semibold mb-2">Thanh toán không thành công</h2>
                    <p className="mb-4">{getErrorMessage(errorCode)}</p>
                    <p className="text-sm">Bạn sẽ được chuyển hướng về giỏ hàng sau 5 giây...</p>
                </div>

                <div className="flex justify-center gap-4 mt-6">
                    <button
                        onClick={() => navigate("/cart")}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Quay lại giỏ hàng
                    </button>
                    <button
                        onClick={() => navigate("/")}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                        Tiếp tục mua sắm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailed;