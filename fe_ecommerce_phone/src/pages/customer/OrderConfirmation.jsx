import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const OrderConfirmation = () => {
    const navigate = useNavigate();
    const { state } = useLocation();

    // Giá trị mặc định cho orderDetails
    const orderDetails = state?.orderDetails || {
        orderId: "Chưa có ID",
        totalPrice: 0,
        paymentMethod: "COD",
        shippingFee: 0,
        products: [],
    };

    // Đảm bảo products luôn là mảng
    const products = Array.isArray(orderDetails.products) ? orderDetails.products : [];

    return (
        <div className="max-w-screen-2xl mx-auto p-9 pt-24">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Xác nhận đơn hàng</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
                Cảm ơn bạn đã đặt hàng! Dưới đây là thông tin đơn hàng của bạn.
            </p>

            <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-medium">Thông tin đơn hàng</h3>
                <div className="mt-4 space-y-2">
                    <p><strong>Mã đơn hàng:</strong> {orderDetails.orderId}</p>
                    <p><strong>Phương thức thanh toán:</strong> {orderDetails.paymentMethod}</p>
                    <p>
                        <strong>Phí giao hàng:</strong>{" "}
                        {(orderDetails.shippingFee || 0).toLocaleString("vi-VN")} VND
                    </p>
                    <p>
                        <strong>Tổng tiền:</strong>{" "}
                        {(orderDetails.totalPrice || 0).toLocaleString("vi-VN")} VND
                    </p>
                </div>

                <h3 className="mt-6 text-lg font-medium">Sản phẩm đã đặt</h3>
                {products.length > 0 ? (
                    <ul className="mt-2 space-y-2">
                        {products.map((item, index) => (
                            <li key={index} className="flex justify-between">
                                <span>
                                    {item.name || "Unknown Product"} (x{item.quantity || 1})
                                </span>
                                <span>
                                    {((item.price || 0) * (item.quantity || 1)).toLocaleString(
                                        "vi-VN"
                                    )}{" "}
                                    VND
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        Không có sản phẩm nào được hiển thị.
                    </p>
                )}
            </div>

            <div className="mt-6 flex gap-4">
                <button
                    onClick={() => navigate("/orders")}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Xem đơn hàng của tôi
                </button>
                <button
                    onClick={() => navigate("/")}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                    Tiếp tục mua sắm
                </button>
            </div>
        </div>
    );
};

export default OrderConfirmation;