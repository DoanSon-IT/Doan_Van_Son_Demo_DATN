
import React, { useState, useEffect, useContext } from "react";
import { ToastContainer, toast } from "react-toastify";
import { ShoppingCart, Check } from "lucide-react";
import apiProduct from "../../api/apiProduct";
import AppContext from "../../context/AppContext";
import ProductCard from "../../components/product/ProductCard";
import "react-lazy-load-image-component/src/effects/blur.css";
import "animate.css/animate.min.css";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/toast-custom.css";

const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price || 0);
};

function ProductPage() {
    const { addToCart, cartItems, setCartCounter } = useContext(AppContext);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProductData();
    }, []);

    const fetchProductData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiProduct.getAllProducts("", 0, 10);
            setProducts(response.content || []);
        } catch (error) {
            console.error("Lỗi khi tải danh sách sản phẩm:", error);
            setError(error.message);
            toast.error("Không thể tải danh sách sản phẩm, vui lòng thử lại!", { autoClose: 2000 });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToCart = (product) => {
        toast.success(
            `${product.name || "Sản phẩm"} đã được thêm vào giỏ hàng!`,
            {
                icon: <ShoppingCart className="text-green-500" size={18} />,
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                containerId: "product-toast",
                toastClassName: "!text-sm !rounded-lg !shadow-lg !bg-gray-900 !text-white border border-[#00ffcc] px-4 py-3 !z-[1050] !shadow-[0_0_10px_#00ffcc] !transition-all !duration-300",
            }
        );

        addToCart({
            id: product.id,
            name: product.name || "Sản phẩm không tên",
            price: product.discountedPrice || product.sellingPrice || 0,
            quantity: 1,
            images: product.images || [],
        });

        const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        setCartCounter(totalItems);
    };

    const handleBuyNow = (product) => {
        handleAddToCart(product);
        setTimeout(() => (window.location.href = "/cart"), 1600);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-gray-400 text-lg animate__animated animate__pulse">
                    Đang tải danh sách sản phẩm...
                </p>
            </div>
        );
    }

    if (error || products.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-screen">
                <p className="text-red-400 text-lg mb-4">
                    {error || "Không tìm thấy sản phẩm nào!"}
                </p>
                <button
                    onClick={fetchProductData}
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-screen-2xl mx-auto p-6 bg-white text-gray-800 font-lato animate__animated animate__fadeIn">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Danh sách sản phẩm</h1>
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        handleAddToCart={handleAddToCart}
                        handleBuyNow={handleBuyNow}
                        formatPrice={formatPrice}
                    />
                ))}
            </ul>
            <ToastContainer
                containerId="product-toast"
                position="top-center"
                autoClose={2000}
                hideProgressBar
                closeOnClick
                pauseOnHover
                theme="dark"
                newestOnTop
                className="!fixed !top-[140px] !left-1/2 !-translate-x-1/2 !z-[1050] pointer-events-none"
            />
        </div>
    );
}

export default ProductPage;
