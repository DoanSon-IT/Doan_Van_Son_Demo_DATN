import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import apiPayment from "../../api/apiPayment";

const VNPayReturn = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const handleVNPayReturn = async () => {
            try {
                // Get all VNPay parameters
                const vnpResponseCode = searchParams.get("vnp_ResponseCode");
                const vnpTxnRef = searchParams.get("vnp_TxnRef");
                const vnpOrderInfo = searchParams.get("vnp_OrderInfo");
                const vnpTransactionNo = searchParams.get("vnp_TransactionNo");

                console.log("Processing VNPay return with:", {
                    code: vnpResponseCode,
                    ref: vnpTxnRef,
                    orderInfo: vnpOrderInfo,
                    transactionNo: vnpTransactionNo
                });

                if (!vnpTxnRef) {
                    throw new Error("Không tìm thấy mã giao dịch");
                }

                // If payment is successful
                if (vnpResponseCode === "00") {
                    // Extract potential orderId from the TxnRef or OrderInfo
                    // VNPay might return the original orderId in one of these fields
                    let potentialOrderId = vnpTxnRef;

                    // Try to extract orderId from vnp_OrderInfo if it contains our expected format
                    if (vnpOrderInfo && vnpOrderInfo.includes("Thanh toan don hang:")) {
                        const orderIdMatch = vnpOrderInfo.match(/Thanh toan don hang: (\d+)/);
                        if (orderIdMatch && orderIdMatch[1]) {
                            potentialOrderId = orderIdMatch[1];
                            console.log("Extracted orderId from OrderInfo:", potentialOrderId);
                        }
                    }

                    // Save transaction details to localStorage for debugging/recovery
                    localStorage.setItem("lastVnpayTransaction", JSON.stringify({
                        txnRef: vnpTxnRef,
                        responseCode: vnpResponseCode,
                        orderInfo: vnpOrderInfo,
                        transactionNo: vnpTransactionNo,
                        timestamp: new Date().toISOString()
                    }));

                    // First attempt: Try to fetch by what we believe is the orderId
                    try {
                        console.log("Attempting to fetch payment by orderId:", potentialOrderId);
                        const payment = await apiPayment.getPayment(potentialOrderId);
                        console.log("Payment retrieved by orderId:", payment);
                        processSuccessfulPayment(payment);
                    } catch (orderIdError) {
                        console.error("Failed to fetch by orderId:", orderIdError);

                        // Second attempt: Try by transaction reference
                        try {
                            console.log("Attempting to fetch payment by transaction ID:", vnpTxnRef);
                            const payment = await apiPayment.getPaymentByTransaction(vnpTxnRef);
                            console.log("Payment retrieved by transaction ID:", payment);
                            processSuccessfulPayment(payment);
                        } catch (txnError) {
                            console.error("Failed to fetch by transaction ID:", txnError);

                            // Last resort: Check if we have order details in localStorage
                            const pendingOrder = localStorage.getItem("pendingOrder");
                            if (pendingOrder) {
                                console.log("Using pending order from localStorage");
                                const orderDetails = JSON.parse(pendingOrder);
                                processSuccessfulPaymentFallback(orderDetails);
                                localStorage.removeItem("pendingOrder");
                            } else {
                                throw new Error("Không thể tìm thấy thông tin thanh toán sau khi thanh toán thành công");
                            }
                        }
                    }
                } else {
                    // Handle error codes
                    let errorMessage = "Thanh toán thất bại";
                    switch (vnpResponseCode) {
                        case "07": errorMessage = "Thanh toán bị từ chối bởi ngân hàng"; break;
                        case "09": errorMessage = "Thẻ/Tài khoản không hợp lệ"; break;
                        case "24": errorMessage = "Giao dịch không thành công"; break;
                        default: errorMessage = `Thanh toán thất bại: Mã lỗi ${vnpResponseCode}`;
                    }
                    throw new Error(errorMessage);
                }
            } catch (error) {
                console.error("Error processing payment return:", error);
                setError(error.message || "Lỗi xử lý kết quả thanh toán");
                toast.error(error.message || "Lỗi xử lý kết quả thanh toán");
                setTimeout(() => navigate("/cart"), 3000);
            } finally {
                setLoading(false);
            }
        };

        const processSuccessfulPayment = (payment) => {
            // Prepare order details for navigation
            const orderDetails = {
                orderId: payment.order?.id,
                paymentMethod: payment.paymentMethod,
                totalPrice: payment.order?.totalPrice || 0,
                shippingFee: payment.order?.shippingFee || 0,
                products: Array.isArray(payment.order?.orderDetails)
                    ? payment.order.orderDetails.map(item => ({
                        name: item.productName || "Unknown Product",
                        quantity: item.quantity || 1,
                        price: item.price || 0
                    }))
                    : []
            };

            clearCart();
            toast.success("Thanh toán thành công!");
            navigate("/order-confirmation", { state: { orderDetails } });
        };

        const processSuccessfulPaymentFallback = (orderDetails) => {
            clearCart();
            toast.success("Thanh toán thành công!");
            navigate("/order-confirmation", { state: { orderDetails } });
        };

        const clearCart = () => {
            const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
            const selectedIds = JSON.parse(localStorage.getItem("selectedIds") || "[]");
            const updatedCart = existingCart.filter(item => !selectedIds.includes(item.id));
            localStorage.setItem("cart", JSON.stringify(updatedCart));
            localStorage.removeItem("selectedIds");
        };

        handleVNPayReturn();
    }, [navigate, searchParams]);

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
                {loading ? (
                    <>
                        <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mx-auto"></div>
                        <p className="mt-4">Đang xử lý kết quả thanh toán...</p>
                    </>
                ) : error ? (
                    <div className="text-red-500">
                        <svg className="w-12 h-12 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p className="mt-2">{error}</p>
                        <p className="mt-2 text-sm text-gray-600">Đang chuyển về giỏ hàng...</p>
                    </div>
                ) : (
                    <div className="text-green-500">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <p className="mt-2">Thanh toán thành công!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VNPayReturn;