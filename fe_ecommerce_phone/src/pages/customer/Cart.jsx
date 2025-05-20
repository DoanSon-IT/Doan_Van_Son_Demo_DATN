import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import TotalPrice from "../../components/cart/TotalPrice";
import CartTable from "../../components/cart/CartTable";
import CheckOutButton from "../../components/cart/CheckOutButton";
import TitleMessage from "../../components/cart/TitleMessage";
import AppContext from "../../context/AppContext";
import LoginPromptModal from "../../components/common/LoginPromptModal";

function Cart() {
    const { auth, cartItems, removeFromCart, updateCartItemQuantity } = useContext(AppContext);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const navigate = useNavigate();

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = new Set(cartItems.map((item) => item.id));
            setSelectedItems(allIds);
        } else {
            setSelectedItems(new Set());
        }
    };

    const handleSelectItem = (id) => {
        const newSelectedItems = new Set(selectedItems);
        if (newSelectedItems.has(id)) {
            newSelectedItems.delete(id);
        } else {
            newSelectedItems.add(id);
        }
        setSelectedItems(newSelectedItems);
    };

    const handleDeleteAll = () => {
        if (window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng không?")) {
            cartItems.forEach((item) => removeFromCart(item.id));
            setSelectedItems(new Set());
        }
    };

    const handleCheckout = () => {
        if (selectedItems.size === 0) {
            alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
            return;
        }

        const selectedProducts = cartItems.filter((item) => selectedItems.has(item.id));

        if (!auth) {
            localStorage.setItem("redirectIntent", "/cart");
            setShowLoginPrompt(true);
            return;
        }

        navigate("/checkout", { state: { selectedProducts } });
    };

    return (
        <div className="relative min-h-screen bg-white text-gray-800 pt-16 pb-8 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 flex flex-col w-full overflow-hidden">
            <div className="w-full flex-grow mx-auto relative z-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-100/60 via-transparent to-transparent opacity-60 pointer-events-none"></div>

                <div className="relative z-10 mb-8 text-center">
                    <TitleMessage className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse shadow-lg" />
                </div>

                {cartItems.length > 0 ? (
                    <div className="relative z-10 flex flex-col gap-6">
                        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 w-full">
                            <div className="flex justify-between mb-4 items-center">
                                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Giỏ hàng của bạn</h2>
                                <button
                                    onClick={handleDeleteAll}
                                    className="px-3 py-1 sm:px-4 sm:py-2 text-sm md:text-base font-medium text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-red-300/50"
                                >
                                    Xóa tất cả
                                </button>
                            </div>
                            <CartTable
                                cartItems={cartItems}
                                setCartItems={(items) => items.forEach((item) => updateCartItemQuantity(item.id, item.quantity))}
                                selectedItems={selectedItems}
                                handleSelectItem={handleSelectItem}
                                handleSelectAll={handleSelectAll}
                                className="text-gray-700 w-full"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-lg">
                            <TotalPrice
                                cartItems={cartItems}
                                selectedItems={selectedItems}
                                className="text-xl sm:text-2xl md:text-3xl font-semibold text-blue-600 p-3 sm:p-4 rounded-lg w-full sm:w-auto text-center sm:text-left"
                            />
                            <CheckOutButton
                                onCheckout={handleCheckout}
                                isLoading={isLoading}
                                className="relative inline-flex items-center justify-center px-6 py-2 sm:px-8 sm:py-3 md:px-10 md:py-4 text-base sm:text-lg md:text-xl font-bold text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-full hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-300/50 w-full sm:w-auto"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="relative z-10 flex flex-col items-center justify-center gap-6 text-center mt-12 mb-24">
                        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <p className="text-gray-600 text-lg sm:text-xl md:text-2xl font-medium">
                            Giỏ hàng trống. Hãy thêm sản phẩm để trải nghiệm!
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow-md hover:shadow-blue-300/50 transition-all duration-300 transform hover:scale-105"
                        >
                            Tiếp tục mua sắm
                        </button>
                    </div>
                )}
            </div>
            {showLoginPrompt && (
                <LoginPromptModal
                    onClose={() => setShowLoginPrompt(false)}
                    cartData={cartItems.filter((item) => selectedItems.has(item.id))}
                />
            )}
        </div>
    );
}

export default Cart;