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
    const { auth, cartItems, removeFromCart, setCartItems } = useContext(AppContext);
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
    const [selectedProducts, setSelectedProducts] = useState(state?.selectedProducts || []);
    const [orderCreated, setOrderCreated] = useState(false);

    const isLoggedIn = !!auth;

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
            toast.warn("Không có sản phẩm nào để thanh toán! Vui lòng quay lại giỏ hàng.");
            setTimeout(() => navigate("/cart"), 3000);
            return;
        }
        if (!shippingInfo.address || !shippingInfo.phoneNumber) {
            toast.warn("Vui lòng nhập đầy đủ địa chỉ và số điện thoại!");
            return;
        }
        if (orderCreated) {
            toast.warn("Đơn hàng đã được tạo, vui lòng quay lại giỏ hàng để tạo đơn hàng mới!");
            setTimeout(() => navigate("/cart"), 3000);
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

            if (paymentMethod === "COD") {
                // For COD, create order immediately
                const orderResponse = await apiOrder.createOrder(orderRequest);
                const orderId = orderResponse.id;
                const fullOrder = await apiOrder.getOrderById(orderId);

                const orderDetails = {
                    orderId: fullOrder.id,
                    totalPrice: fullOrder.totalPrice || 0,
                    paymentMethod: fullOrder.paymentMethod || paymentMethod,
                    shippingFee: fullOrder.shippingFee || 0,
                    products: Array.isArray(fullOrder.orderDetails)
                        ? fullOrder.orderDetails.map((detail) => ({
                            name: detail.productName || "Unknown Product",
                            quantity: detail.quantity || 1,
                            price: detail.price || 0,
                        }))
                        : [],
                };

                selectedProducts.forEach((item) => removeFromCart(item.id));
                setSelectedProducts([]);
                setOrderCreated(true);

                navigate("/order-confirmation", {
                    state: { orderDetails },
                });
            } else if (paymentMethod === "VNPAY") {
                const orderResponse = await apiOrder.createOrder(orderRequest);
                const orderId = orderResponse.id;

                let payment;
                try {
                    // 1. Thử lấy thanh toán (theo orderId)
                    payment = await apiPayment.getPayment(orderId);

                    // 2. Nếu đã thanh toán xong
                    if (payment.status === "PAID" || payment.status === "AWAITING_DELIVERY") {
                        throw new Error("Đơn hàng này đã được thanh toán.");
                    }

                    // 3. Nếu chưa → lấy lại URL thanh toán
                    const res = await apiPayment.getPaymentUrl(orderId);
                    payment = res;
                } catch (error) {
                    const notFound = error.message?.includes("Không tìm thấy") || error.message?.includes("404");

                    if (notFound) {
                        // 4. Nếu chưa có thanh toán → tạo mới
                        payment = await apiPayment.createPayment(orderId, "VNPAY");
                    } else {
                        // 5. Nếu là lỗi khác → throw
                        throw error;
                    }
                }

                if (payment?.paymentUrl) {
                    selectedProducts.forEach((item) => removeFromCart(item.id));
                    setSelectedProducts([]);
                    setOrderCreated(true);

                    window.location.href = payment.paymentUrl;
                } else {
                    toast.error("Không tìm thấy URL thanh toán!");
                }
            }

        } catch (error) {
            console.error("Lỗi khi xử lý thanh toán:", error);
            let message = error.message || "Lỗi khi xử lý thanh toán, vui lòng thử lại!";
            if (message.includes("Thanh toán cho đơn hàng này đã tồn tại")) {
                message = "Đơn hàng này đã được thanh toán. Vui lòng quay lại giỏ hàng để tạo đơn hàng mới.";
                setTimeout(() => navigate("/cart"), 3000);
            }
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
            <div className="p-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-lg shadow-lg">
                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
                        <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md mx-auto transform transition-all duration-300 scale-100">
                            <h3 className="text-xl font-bold mb-4 text-gray-800">
                                Vui lòng đăng nhập để tiếp tục thanh toán!
                            </h3>
                            <p className="mb-6 text-gray-600">
                                Bạn cần có tài khoản để mua hàng. Đăng nhập hoặc đăng ký ngay bây giờ.
                            </p>
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={() => navigate("/auth/login")}
                                    className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition duration-300 font-medium"
                                >
                                    Đăng nhập
                                </button>
                                <button
                                    onClick={() => navigate("/auth/register")}
                                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300 font-medium"
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
        <div className="max-w-screen-2xl mx-auto p-6 md:p-9 pt-24 bg-gray-50 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg">
                <div className="border-b pb-4 mb-6">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Thanh toán</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        Vui lòng kiểm tra lại đơn hàng và điền thông tin giao hàng.
                    </p>
                </div>

                <div className="grid md:grid-cols-5 gap-8">
                    {/* Cột trái: Thông tin đơn hàng */}
                    <div className="md:col-span-3 space-y-6">
                        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                            <h3 className="text-xl font-semibold mb-4 flex items-center">
                                <span className="bg-black text-white w-7 h-7 inline-flex items-center justify-center rounded-full mr-2 text-sm">1</span>
                                Sản phẩm trong đơn hàng
                            </h3>
                            {selectedProducts.length > 0 ? (
                                <ul className="divide-y divide-gray-200 dark:divide-gray-600">
                                    {selectedProducts.map((item) => (
                                        <li key={item.id} className="flex justify-between py-3">
                                            <div className="flex items-center">
                                                <span className="font-medium">{item.name}</span>
                                                <span className="ml-2 text-gray-500 text-sm">x{item.quantity}</span>

                                            </div>
                                            <span className="font-semibold">
                                                {(item.price * item.quantity).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-red-500">Không có sản phẩm nào trong đơn hàng</p>
                            )}
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                            <h3 className="text-xl font-semibold mb-4 flex items-center">
                                <span className="bg-black text-white w-7 h-7 inline-flex items-center justify-center rounded-full mr-2 text-sm">2</span>
                                Thông tin giao hàng
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Địa chỉ giao hàng</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={shippingInfo.address}
                                        onChange={handleShippingChange}
                                        placeholder="Nhập địa chỉ giao hàng đầy đủ"
                                        className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-black focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                                    <input
                                        type="text"
                                        name="phoneNumber"
                                        value={shippingInfo.phoneNumber}
                                        onChange={handleShippingChange}
                                        placeholder="Nhập số điện thoại liên hệ"
                                        className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-black focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Đơn vị vận chuyển</label>
                                    <select
                                        name="carrier"
                                        value={shippingInfo.carrier}
                                        onChange={handleShippingChange}
                                        className="p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-black focus:border-transparent"
                                    >
                                        <option value="GHN">Giao Hàng Nhanh (GHN)</option>
                                        <option value="GHTK">Giao Hàng Tiết Kiệm (GHTK)</option>
                                        <option value="VNPOST">Viettel Post</option>
                                    </select>
                                </div>
                                {estimatedDelivery && (
                                    <div className="bg-blue-50 text-blue-700 p-3 rounded-lg flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Dự kiến giao hàng: <strong>{estimatedDelivery}</strong></span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                            <h3 className="text-xl font-semibold mb-4 flex items-center">
                                <span className="bg-black text-white w-7 h-7 inline-flex items-center justify-center rounded-full mr-2 text-sm">3</span>
                                Phương thức thanh toán
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <label className={`border rounded-lg p-4 flex items-center cursor-pointer ${paymentMethod === "COD" ? "border-black bg-gray-100" : "border-gray-300"}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="COD"
                                        checked={paymentMethod === "COD"}
                                        onChange={() => setPaymentMethod("COD")}
                                        className="hidden"
                                    />
                                    <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${paymentMethod === "COD" ? "border-black" : "border-gray-400"}`}>
                                        {paymentMethod === "COD" && <div className="w-3 h-3 bg-black rounded-full"></div>}
                                    </div>
                                    <div>
                                        <p className="font-medium">Thanh toán khi nhận hàng</p>
                                        <p className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi nhận được hàng</p>
                                    </div>
                                </label>

                                <label className={`border rounded-lg p-4 flex items-center cursor-pointer ${paymentMethod === "VNPAY" ? "border-black bg-gray-100" : "border-gray-300"}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="VNPAY"
                                        checked={paymentMethod === "VNPAY"}
                                        onChange={() => setPaymentMethod("VNPAY")}
                                        className="hidden"
                                    />
                                    <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${paymentMethod === "VNPAY" ? "border-black" : "border-gray-400"}`}>
                                        {paymentMethod === "VNPAY" && <div className="w-3 h-3 bg-black rounded-full"></div>}
                                    </div>
                                    <div>
                                        <p className="font-medium">VNPay</p>
                                        <p className="text-sm text-gray-500">Thanh toán trực tuyến qua VNPay</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Cột phải: Tổng cộng và mã giảm giá */}
                    <div className="md:col-span-2">
                        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg sticky top-24">
                            <h3 className="text-xl font-semibold mb-4">Tổng đơn hàng</h3>

                            <div className="mb-6">
                                <h4 className="font-medium mb-2">Mã giảm giá</h4>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={discountCode}
                                        onChange={(e) => setDiscountCode(e.target.value)}
                                        placeholder="Nhập mã..."
                                        className="p-3 border border-gray-300 rounded-lg flex-1 focus:ring-2 focus:ring-black focus:border-transparent"
                                    />
                                    <button
                                        onClick={handleApplyDiscount}
                                        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition duration-300"
                                    >
                                        Áp dụng
                                    </button>
                                </div>

                                {discountResult && (
                                    <div className="mt-2 text-green-600 text-sm bg-green-50 p-2 rounded">
                                        ✓ Giảm {(discountResult.discountAmount ?? 0).toLocaleString("vi-VN")} VND
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 border-t border-b py-4 mb-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tạm tính:</span>
                                    <span>{subtotal.toLocaleString("vi-VN")} VND</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Phí vận chuyển:</span>
                                    <span>{shippingFee.toLocaleString("vi-VN")} VND</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Giảm giá:</span>
                                        <span>-{discountAmount.toLocaleString("vi-VN")} VND</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center text-lg font-bold mb-6">
                                <span>Tổng cộng:</span>
                                <span className="text-xl">{totalPrice.toLocaleString("vi-VN")} VND</span>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={isLoading}
                                className={`w-full bg-black text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition duration-300 hover:bg-gray-800 ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang xử lý...
                                    </div>
                                ) : (
                                    <>
                                        Xác nhận thanh toán {totalPrice.toLocaleString("vi-VN")} VND
                                    </>
                                )}
                            </button>

                            <p className="text-sm text-gray-500 text-center mt-4">
                                Bằng cách nhấn "Xác nhận thanh toán", bạn đồng ý với điều khoản và điều kiện của chúng tôi
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <ToastContainer position="top-right" autoClose={5000} />
        </div>
    );
};

export default Checkout;