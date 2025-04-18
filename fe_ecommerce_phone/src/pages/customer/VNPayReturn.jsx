import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import apiPayment from "../../api/apiPayment";

const VNPayReturn = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [orderDetails, setOrderDetails] = useState(null);

    useEffect(() => {
        const vnpResponseCode = searchParams.get("vnp_ResponseCode");
        const vnpTxnRef = searchParams.get("vnp_TxnRef");

        console.log("VNPay return params:", Object.fromEntries(searchParams));

        if (!vnpTxnRef) {
            toast.error("Không tìm thấy mã giao dịch");
            navigate("/cart");
            return;
        }

        const fetchOrderDetails = async () => {
            try {
                // Gọi API để lấy Payment theo transaction ID
                const payment = await apiPayment.getPaymentByTransaction(vnpTxnRef);
                const order = payment.order || {};

                console.log("API response:", payment);

                setOrderDetails({
                    orderId: order.id || vnpTxnRef,
                    paymentMethod: "VNPAY",
                    totalPrice: order.totalPrice || 0,
                    shippingFee: order.shippingFee || 0,
                    products: Array.isArray(order.orderDetails)
                        ? order.orderDetails.map((item) => ({
                            name: item.productName || "Unknown Product",
                            quantity: item.quantity || 1,
                            price: item.price || 0,
                        }))
                        : [],
                });
            } catch (error) {
                console.error("Error fetching order details:", error);
                toast.error(error.message || "Không thể tải chi tiết đơn hàng");
                navigate("/cart");
            }
        };

        if (vnpResponseCode === "00") {
            fetchOrderDetails();
        } else {
            let errorMessage = "Thanh toán thất bại";
            switch (vnpResponseCode) {
                case "97":
                    errorMessage = "Dữ liệu không hợp lệ (secure hash lỗi)";
                    break;
                case "99":
                    errorMessage = "Lỗi hệ thống, vui lòng thử lại";
                    break;
                default:
                    errorMessage = `Thanh toán thất bại: Mã lỗi ${vnpResponseCode}`;
            }
            toast.error(errorMessage);
            navigate("/cart");
        }
    }, [navigate, searchParams]);

    useEffect(() => {
        if (orderDetails) {
            console.log("Order details before redirect:", orderDetails);
            const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
            const selectedIds = JSON.parse(localStorage.getItem("selectedIds") || "[]");
            const updatedCart = existingCart.filter(
                (cartItem) => !selectedIds.includes(cartItem.id)
            );
            localStorage.setItem("cart", JSON.stringify(updatedCart));
            localStorage.removeItem("selectedIds");

            toast.success("Thanh toán thành công!");
            navigate("/order-confirmation", {
                state: { orderDetails },
            });
        }
    }, [orderDetails, navigate]);

    return <div>Đang xử lý kết quả thanh toán...</div>;
};

export default VNPayReturn;