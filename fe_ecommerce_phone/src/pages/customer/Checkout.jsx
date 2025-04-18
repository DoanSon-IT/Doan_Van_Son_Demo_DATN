import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiPayment from "../../api/apiPayment";
import apiOrder from "../../api/apiOrder";
import apiShipping from "../../api/apiShipping";
import { applyDiscount } from "../../api/apiDiscount";
import AppContext from "../../context/AppContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Checkout = () => {
    const { auth, cartItems, removeFromCart } = useContext(AppContext);
    const navigate = useNavigate();
    const { state } = useLocation();
    const [paymentMethod, setPaymentMethod] = useState("VNPAY");
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [shippingInfo, setShippingInfo] = useState({
        address: "",
        phoneNumber: "",
        carrier: "GHN",
    });
    const [discountCode, setDiscountCode] = useState("");
    const [discountResult, setDiscountResult] = useState(null);
    const [shippingFee, setShippingFee] = useState(0);
    const [estimatedDelivery, setEstimatedDelivery] = useState(null);

    const isLoggedIn = !!auth;
    const selectedProducts = state?.selectedProducts || [];

    useEffect(() => {
        if (!isLoggedIn) {
            setShowModal(true);
        } else {
            setShippingInfo({
                address: auth?.address || "",
                phoneNumber: auth?.phone || "",
                carrier: "GHN",
            });
        }
    }, [isLoggedIn, auth]);

    useEffect(() => {
        const fetchShippingEstimate = async () => {
            if (shippingInfo.address && shippingInfo.carrier) {
                try {
                    const estimate = await apiShipping.estimateShipping(
                        shippingInfo.address,
                        shippingInfo.carrier
                    );
                    setShippingFee(estimate.fee);
                    setEstimatedDelivery(new Date(estimate.estimatedDelivery).toLocaleDateString("vi-VN"));
                } catch (error) {
                    toast.error(error.message);
                    setShippingFee(0);
                    setEstimatedDelivery(null);
                }
            }
        };
        fetchShippingEstimate();
    }, [shippingInfo.address, shippingInfo.carrier]);

    const handleShippingChange = (e) => {
        const { name, value } = e.target;
        setShippingInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handleApplyDiscount = async () => {
        if (!discountCode) {
            toast.warn("Vui lòng nhập mã giảm giá!");
            return;
        }

        try {
            const payload = {
                discountCode,
                items: selectedProducts.map((item) => ({
                    productId: item.id,
                    quantity: item.quantity,
                })),
            };

            const res = await applyDiscount(payload);
            setDiscountResult(res.data);
            toast.success("🎉 Áp mã giảm giá thành công!");
        } catch (error) {
            console.error("❌ Lỗi từ backend:", error?.response?.data || error);
            const raw = error?.response?.data;
            const message = typeof raw === "string" ? raw : raw?.message || "";
            let friendlyMessage = "Có lỗi khi áp mã giảm giá!";

            if (message.includes("đã được sử dụng")) {
                friendlyMessage = "Mã này đã được sử dụng!";
            } else if (message.includes("hết hạn")) {
                friendlyMessage = "Mã giảm giá đã hết hạn!";
            } else if (message.includes("chưa bắt đầu")) {
                friendlyMessage = "Mã giảm giá chưa có hiệu lực!";
            } else if (message.includes("tối thiểu")) {
                friendlyMessage = "Đơn hàng chưa đủ điều kiện để áp mã!";
            } else if (message.includes("không tồn tại")) {
                friendlyMessage = "Mã giảm giá không tồn tại!";
            }

            toast.error(friendlyMessage);
            setDiscountResult(null);
        }
    };

    const handlePayment = async () => {
        if (selectedProducts.length === 0) {
            toast.warn("Không có sản phẩm nào để thanh toán!");
            return;
        }
        if (!shippingInfo.address || !shippingInfo.phoneNumber) {
            toast.warn("Vui lòng nhập đầy đủ địa chỉ và số điện thoại!");
            return;
        }
        setIsLoading(true);
        try {
            const orderRequest = {
                productIds: selectedProducts.map((item) => item.id),
                quantities: selectedProducts.map((item) => item.quantity),
                address: shippingInfo.address,
                phoneNumber: shippingInfo.phoneNumber,
                carrier: shippingInfo.carrier,
                discountCode: discountCode || null,
                paymentMethod: paymentMethod,
            };
            const orderResponse = await apiOrder.createOrder(orderRequest);
            const orderId = orderResponse.id;

            // Lấy URL thanh toán
            const paymentResponse = await apiPayment.getPaymentUrl(orderId);
            const paymentUrl = paymentResponse.paymentUrl || "/order-confirmation";

            selectedProducts.forEach((item) => removeFromCart(item.id));

            if (paymentMethod === "VNPAY" || paymentMethod === "MOMO") {
                window.location.href = paymentUrl; // Điều hướng đến VNPay/MoMo
            } else if (paymentMethod === "COD") {
                navigate("/order-confirmation", {
                    state: {
                        orderDetails: {
                            orderId: orderId,
                            totalPrice: orderResponse.totalPrice,
                            paymentMethod: paymentMethod,
                            products: selectedProducts,
                            shippingFee: shippingFee,
                        },
                    },
                });
            }
        } catch (error) {
            console.error("Lỗi khi xử lý thanh toán:", error);
            const message = error.message || "Lỗi khi xử lý thanh toán, vui lòng thử lại!";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const subtotal = selectedProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = discountResult?.discountAmount || 0;
    const totalPrice = subtotal - discountAmount + shippingFee;

    if (!isLoggedIn) {
        return (
            <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                            <h3 className="text-lg font-semibold mb-4">
                                Vui lòng đăng nhập để tiếp tục thanh toán!
                            </h3>
                            <p className="mb-4">
                                Bạn cần có tài khoản để mua hàng. Đăng nhập hoặc đăng ký ngay bây giờ.
                            </p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => navigate("/auth/login")}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Đăng nhập
                                </button>
                                <button
                                    onClick={() => navigate("/auth/register")}
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                >
                                    Đăng ký
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-screen-2xl mx-auto p-9 pt-24">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Thanh toán</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
                Vui lòng kiểm tra lại đơn hàng và điền thông tin giao hàng.
            </p>

            <div className="mt-4">
                <h3 className="text-lg font-medium">Sản phẩm trong đơn hàng:</h3>
                <ul className="mt-2 space-y-2">
                    {selectedProducts.map((item) => (
                        <li key={item.id} className="flex justify-between">
                            <span>{item.name} (x{item.quantity})</span>
                            <span>{(item.price * item.quantity).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</span>
                        </li>
                    ))}
                </ul>
                <div className="mt-6">
                    <h3 className="text-lg font-medium">Mã giảm giá:</h3>
                    <div className="flex mt-2 gap-2">
                        <input
                            type="text"
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value)}
                            placeholder="Nhập mã..."
                            className="p-2 border rounded w-full"
                        />
                        <button
                            onClick={handleApplyDiscount}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                            Áp dụng
                        </button>
                    </div>

                    {discountResult && (
                        <div className="mt-2 text-green-600 text-sm">
                            Giảm {(discountResult.discountAmount ?? 0).toLocaleString("vi-VN")} VND – còn lại {(discountResult.finalTotal ?? 0).toLocaleString("vi-VN")} VND
                        </div>
                    )}
                </div>
                <div className="mt-4 text-right">
                    <p>Tạm tính: {subtotal.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</p>
                    <p>Phí giao hàng: {shippingFee.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</p>
                    {discountAmount > 0 && (
                        <p>Giảm giá: -{discountAmount.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</p>
                    )}
                    <p className="font-semibold">
                        Tổng cộng: {totalPrice.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                    </p>
                </div>
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-medium">Thông tin giao hàng:</h3>
                <div className="mt-2 space-y-4">
                    <input
                        type="text"
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleShippingChange}
                        placeholder="Địa chỉ giao hàng"
                        className="p-2 border rounded w-full"
                        required
                    />
                    <input
                        type="text"
                        name="phoneNumber"
                        value={shippingInfo.phoneNumber}
                        onChange={handleShippingChange}
                        placeholder="Số điện thoại"
                        className="p-2 border rounded w-full"
                        required
                    />
                    <select
                        name="carrier"
                        value={shippingInfo.carrier}
                        onChange={handleShippingChange}
                        className="p-2 border rounded w-full"
                    >
                        <option value="GHN">Giao Hàng Nhanh (GHN)</option>
                        <option value="GHTK">Giao Hàng Tiết Kiệm (GHTK)</option>
                        <option value="VNPOST">Viettel Post</option>
                    </select>
                    {estimatedDelivery && (
                        <p className="text-sm text-gray-600">
                            Dự kiến giao hàng: {estimatedDelivery}
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-6">
                <h3 className="text-lg font-medium">Phương thức thanh toán:</h3>
                <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-2 p-2 border rounded w-full max-w-xs"
                >
                    <option value="COD">Thanh toán khi nhận hàng</option>
                    <option value="VNPAY">Thanh toán VNPay</option>
                    <option value="MOMO">Thanh toán MOMO</option>
                </select>
            </div>

            <button
                onClick={handlePayment}
                disabled={isLoading}
                className={`mt - 6 bg - blue - 500 text - white px - 4 py - 2 rounded hover: bg - blue - 600 ${isLoading ? "opacity-50 cursor-not-allowed" : ""} `}
            >
                {isLoading ? "Đang xử lý..." : "Xác nhận thanh toán"}
            </button>
            <ToastContainer />
        </div>
    );
};

export default Checkout;