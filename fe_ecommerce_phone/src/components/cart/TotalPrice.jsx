import React from "react";

function TotalPrice({ cartItems, selectedItems, className }) {
    const subtotal = cartItems
        .filter((item) => selectedItems.has(item.id))
        .reduce((sum, item) => {
            // Sử dụng giá đã giảm nếu có, ngược lại sử dụng giá gốc
            const effectivePrice = item.discountedPrice || item.salePrice || item.price;
            return sum + (effectivePrice * item.quantity);
        }, 0);

    return (
        <div className={`${className}`}>
            <p className="text-lg font-semibold text-blue-600">
                Tổng thiệt hại:{" "}
                {subtotal.toLocaleString("vi-VN", {
                    style: "currency",
                    currency: "VND",
                })}
            </p>
            <p className="text-gray-600 text-sm mt-1">
                Thuế và phí vận chuyển được tính khi thanh toán
            </p>
        </div>
    );
}

export default TotalPrice;