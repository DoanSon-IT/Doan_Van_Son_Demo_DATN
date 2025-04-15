import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import StarRatings from "../../components/product/StarRatings";
import ProductReviewSection from "../../components/review/ProductReviewSection";
import { ShoppingCart, Check, CreditCard } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import "animate.css/animate.min.css";
import "react-toastify/dist/ReactToastify.css";
import apiProduct from "../../api/apiProduct";
import AppContext from "../../context/AppContext";
import "../../assets/toast-custom.css";

const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price || 0);
};

function ProductDetail() {
    const { addToCart } = useContext(AppContext);
    const [product, setProduct] = useState(null);
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        fetchProductData();
    }, [id]);

    const fetchProductData = async () => {
        setIsLoading(true);
        try {
            const response = await apiProduct.getProductById(id);
            setProduct(response);
        } catch (error) {
            console.error("Lỗi khi tải thông tin sản phẩm:", error);
            setProduct(null);
            toast.error("Không thể tải sản phẩm, vui lòng thử lại!", { autoClose: 2000 });
        }
        setIsLoading(false);
    };

    const handleAddToCart = () => {
        toast.success(`${product.name || "Sản phẩm"} đã được thêm vào giỏ hàng!`, {
            icon: <ShoppingCart className="text-green-500" size={18} />,
            position: "top-center",
            autoClose: 1800,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            containerId: "product-toast",
            toastClassName: "!text-sm !rounded-lg !shadow-lg !bg-gray-900 !text-white border border-[#00ffcc] px-4 py-3 !z-[1050]"
        });

        addToCart({
            id: product.id,
            name: product.name || "Sản phẩm không tên",
            price: product.discountedPrice || product.sellingPrice || 0,
            quantity: 1,
            images: product.images || [],
        });
    };

    const handleBuyNow = () => {
        handleAddToCart();
        setTimeout(() => (window.location.href = "/cart"), 1600);
    };

    if (isLoading) {
        return <p className="text-center mt-10 text-gray-400 animate__animated animate__flash">Đang tải sản phẩm...</p>;
    }

    if (!product) {
        return <p className="text-center mt-10 text-red-400">Không tìm thấy sản phẩm!</p>;
    }

    const isDiscounted = product.discountedPrice && product.discountedPrice < product.sellingPrice;
    const discountPercentage = isDiscounted
        ? (((product.sellingPrice - product.discountedPrice) / product.sellingPrice) * 100).toFixed(0)
        : 0;

    return (
        <>
            <div className="relative z-[1] max-w-screen-2xl mx-auto p-6 bg-white text-gray-800 font-lato animate__animated animate__fadeIn">
                <div className="flex flex-col lg:flex-row w-full gap-x-24 justify-center">
                    <div className="flex flex-col items-center mb-6 lg:mb-0 relative">
                        <LazyLoadImage
                            effect="blur"
                            src={selectedImage || product.images?.[0]?.imageUrl || "https://via.placeholder.com/400"}
                            alt={product.name || "Hình ảnh sản phẩm"}
                            className="object-cover rounded-xl shadow-lg"
                            width={400}
                            height={400}
                        />
                        {isDiscounted && (
                            <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                Giảm {discountPercentage}%
                            </span>
                        )}
                        <div className="flex gap-2 mt-4 flex-wrap justify-center">
                            {product.images?.map((img, index) => (
                                <img
                                    key={index}
                                    src={img.imageUrl}
                                    alt={`Ảnh ${index + 1}`}
                                    onClick={() => setSelectedImage(img.imageUrl)}
                                    className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${selectedImage === img.imageUrl ? "border-blue-600" : "border-gray-300"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col w-full lg:max-w-lg">
                        <h1 className="text-3xl mb-2 font-bold text-gray-800 animate__animated animate__bounceIn">
                            {product.name || "Tên sản phẩm không có"}
                        </h1>
                        <div className="flex items-center mb-3">
                            <StarRatings rating={product.rating || 0} className="flex mr-2" />
                            <span className="text-sm text-gray-600">({product.ratingCount || 0} đánh giá)</span>
                        </div>
                        <div className="pt-3 pb-3 border-b border-gray-100 mb-4">
                            {isDiscounted ? (
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl font-bold text-blue-600">{formatPrice(product.discountedPrice)}</span>
                                    <span className="text-sm text-gray-500 line-through">{formatPrice(product.sellingPrice)}</span>
                                </div>
                            ) : (
                                <span className="text-2xl font-bold text-blue-600">{formatPrice(product.sellingPrice)}</span>
                            )}
                        </div>
                        <p className="text-base text-gray-600 mb-6">{product.description || "Mô tả không có"}</p>
                        <div className="flex gap-4">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 flex items-center justify-center bg-white border border-blue-600 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                                <ShoppingCart className="w-4 h-4 mr-2" /> Giỏ hàng
                            </button>
                            <button
                                onClick={handleBuyNow}
                                className="flex-1 flex items-center justify-center bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <CreditCard className="w-4 h-4 mr-2" /> Mua ngay
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer
                containerId="product-toast"
                position="top-center"
                autoClose={2000}
                hideProgressBar
                closeOnClick
                pauseOnHover
                theme="dark"
                newestOnTop
                className="!fixed !top-24 !left-1/2 !-translate-x-1/2 !z-[1050] pointer-events-none"
            />
            <ProductReviewSection productId={product.id} />
        </>
    );
}

export default ProductDetail;