
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import apiProduct from "../../api/apiProduct";
import ProductCard from "../../components/product/ProductCard";
import { ToastContainer, toast } from "react-toastify";
import { ShoppingCart, Check } from "lucide-react";
import "react-lazy-load-image-component/src/effects/blur.css";
import "react-toastify/dist/ReactToastify.css";
import "../../assets/toast-custom.css";

const SearchPage = () => {
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const searchQuery = new URLSearchParams(location.search).get("query") || "";

    useEffect(() => {
        const fetchSearchResults = async () => {
            try {
                const response = await apiProduct.getFilteredProducts(searchQuery, null, null, "", 0, 20);
                setProducts(Array.isArray(response.content) ? response.content : response);
            } catch (error) {
                console.error("Lỗi khi tìm kiếm sản phẩm:", error);
                toast.error("Không thể tải kết quả tìm kiếm!", { autoClose: 2000 });
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [searchQuery]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price || 0);
    };

    const handleAddToCart = (product) => {
        toast(
            <div className="flex items-center w-full p-2 bg-gray-900 border-2 border-[#00ffcc] rounded-lg shadow-[0_0_10px_#00ffcc]">
                <Check className="w-4 h-4 text-green-500 mr-1" />
                <ShoppingCart className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-white">
                    {`${product.name || "Sản phẩm"} đã được thêm vào giỏ hàng!`}
                </span>
            </div>,
            {
                autoClose: 1500,
                position: "top-center",
                hideProgressBar: true,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: false,
                className: "toast-custom",
            }
        );

        const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
        const existingItem = existingCart.find((item) => item.id === product.id);

        const finalPrice = product.discountedPrice && product.discountedPrice < product.sellingPrice
            ? product.discountedPrice
            : product.sellingPrice;

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            existingCart.push({
                id: product.id,
                quantity: 1,
                name: product.name || "Sản phẩm không tên",
                price: finalPrice || 0,
                originalPrice: product.sellingPrice || 0,
                images: product.images || [],
            });
        }

        localStorage.setItem("cart", JSON.stringify(existingCart));
    };

    const handleBuyNow = (product) => {
        handleAddToCart(product);
        setTimeout(() => (window.location.href = "/cart"), 1600);
    };

    if (loading) return <div className="text-white text-center">Đang tải...</div>;

    return (
        <div className="p-4 sm:p-6 bg-white text-gray-800 font-lato min-h-screen">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
                Kết quả tìm kiếm cho: "{searchQuery}"
            </h1>
            {products.length > 0 ? (
                <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
            ) : (
                <p className="text-center text-gray-400">Không tìm thấy sản phẩm nào.</p>
            )}
            <ToastContainer
                position="top-center"
                autoClose={1500}
                hideProgressBar
                closeOnClick
                pauseOnHover
                theme="dark"
                className="toast-container-custom"
            />
        </div>
    );
};

export default SearchPage;
