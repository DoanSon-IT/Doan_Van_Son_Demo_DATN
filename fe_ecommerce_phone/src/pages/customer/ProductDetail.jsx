import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StarRatings from "../../components/product/StarRatings";
import ProductCard from "../../components/product/ProductCard"; // Thêm import
import {
    getAverageRating,
    getReviewCount,
} from "../../api/apiReview";
import ProductReviewSection from "../../components/review/ProductReviewSection";
import { ShoppingCart, Check, CreditCard, Shield, Clock, Truck, RotateCcw } from "lucide-react";
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
    const { addToCart, auth, setAuth } = useContext(AppContext);
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [rating, setRating] = useState(0);
    const [ratingCount, setRatingCount] = useState(0);

    useEffect(() => {
        const loadProductData = async () => {
            setIsLoading(true);
            try {
                const response = await apiProduct.getProductById(id);
                setProduct(response);
            } catch (error) {
                console.error("Lỗi khi tải thông tin sản phẩm:", error);
                toast.error("Không thể tải sản phẩm, vui lòng thử lại!", { autoClose: 2000 });
            } finally {
                setIsLoading(false);
            }
        };

        const loadRelatedProducts = async () => {
            try {
                const response = await apiProduct.getRelatedProducts(id, 5);
                setRelatedProducts(response);
            } catch (error) {
                console.error("Lỗi khi tải sản phẩm tương tự:", error);
                setRelatedProducts([]);
            }
        };

        loadProductData();
        loadRelatedProducts();
    }, [id]);

    useEffect(() => {
        const loadRatingData = async () => {
            if (!id) return;

            try {
                const [avgRating, reviewCount] = await Promise.all([
                    getAverageRating(id),
                    getReviewCount(id)
                ]);

                setRating(avgRating || 0);
                setRatingCount(reviewCount || 0);
            } catch (err) {
                console.error("Lỗi khi tải thông tin đánh giá:", err);
            }
        };

        loadRatingData();
    }, [id]);

    const handleAddToCart = (product) => {
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

    const handleBuyNow = (product) => {
        handleAddToCart(product);
        setTimeout(() => navigate("/cart"), 1600);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center animate__animated animate__pulse">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto animate-spin"></div>
                    <p className="mt-4 text-gray-600">Đang tải thông tin sản phẩm...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center mt-10 py-16">
                <div className="bg-red-50 inline-block p-5 rounded-full mb-4">
                    <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Không tìm thấy sản phẩm!</h2>
                <p className="text-gray-600 mt-2">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
                <a href="/" className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Quay lại trang chủ
                </a>
            </div>
        );
    }

    const isDiscounted = product.discountedPrice && product.discountedPrice < product.sellingPrice;
    const discountPercentage = isDiscounted
        ? (((product.sellingPrice - product.discountedPrice) / product.sellingPrice) * 100).toFixed(0)
        : 0;

    return (
        <>
            <div className="relative z-[1] max-w-screen-2xl mx-auto p-6 bg-white text-gray-800 font-lato animate__animated animate__fadeIn">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cột 1: Hình ảnh sản phẩm */}
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
                                    className={`w-16 h-16 object-cover rounded cursor-pointer border-2 ${selectedImage === img.imageUrl ? "border-black" : "border-gray-300"}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Cột 2: Thông tin sản phẩm */}
                    <div className="flex flex-col">
                        <h1 className="text-3xl mb-2 font-bold text-gray-800 animate__animated animate__bounceIn">
                            {product.name || "Tên sản phẩm không có"}
                        </h1>
                        <div className="flex items-center mb-3">
                            <StarRatings rating={rating} className="flex mr-2" />
                            <span className="text-sm text-gray-600">({ratingCount} đánh giá)</span>
                        </div>
                        <div className="pt-3 pb-3 border-b border-gray-100 mb-4">
                            {isDiscounted ? (
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl font-bold text-black">{formatPrice(product.discountedPrice)}</span>
                                    <span className="text-sm text-gray-500 line-through">{formatPrice(product.sellingPrice)}</span>
                                </div>
                            ) : (
                                <span className="text-2xl font-bold text-black">{formatPrice(product.sellingPrice)}</span>
                            )}
                        </div>
                        <p className="text-base text-gray-600 mb-6">{product.description || "Mô tả không có"}</p>
                        <div className="flex gap-4 mt-auto">
                            <button
                                onClick={() => handleAddToCart(product)}
                                className="flex-1 flex items-center justify-center bg-white border border-black text-black py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                                <ShoppingCart className="w-4 h-4 mr-2" /> Giỏ hàng
                            </button>
                            <button
                                onClick={() => handleBuyNow(product)}
                                className="flex-1 flex items-center justify-center bg-black text-white py-3 px-4 rounded-lg hover:bg-pink-600 transition-colors"
                            >
                                <CreditCard className="w-4 h-4 mr-2" /> Mua ngay
                            </button>
                        </div>
                    </div>

                    {/* Cột 3: Chính sách bảo hành */}
                    <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <Shield className="w-5 h-5 mr-2 text-blue-700" />
                            Chính sách bảo hành
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <Shield className="w-5 h-5 mr-3 text-green-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-800">Bảo hành chính hãng</p>
                                    <p className="text-sm text-gray-600">12 tháng bảo hành toàn bộ sản phẩm</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <Truck className="w-5 h-5 mr-3 text-black mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-800">Giao hàng tốc độ ánh sáng</p>
                                    <p className="text-sm text-gray-600">Nội thành 30phút sau khi đặt</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <RotateCcw className="w-5 h-5 mr-3 text-orange-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-800">Đổi trả dễ dàng</p>
                                    <p className="text-sm text-gray-600">7 ngày đổi trả nếu sản phẩm lỗi</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <Clock className="w-5 h-5 mr-3 text-purple-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-gray-800">Hỗ trợ 24/7</p>
                                    <p className="text-sm text-gray-600">Đường dây nóng: 1900 9999</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <h4 className="font-medium text-gray-800 mb-2">Liên hệ & Hỏi đáp</h4>
                            <div className="flex gap-2 flex-wrap">
                                <div className="bg-white p-2 rounded border border-gray-200">
                                    <img src="/icons/facebook.png" alt="facebook" className="h-6" />
                                </div>
                                <div className="bg-white p-2 rounded border border-gray-200">
                                    <img src="/icons/tiktok.png" alt="tiktok" className="h-6" />
                                </div>
                                <div className="bg-white p-2 rounded border border-gray-200">
                                    <img src="/icons/instagram.png" alt="instagram" className="h-6" />
                                </div>
                                <div className="bg-white p-2 rounded border border-gray-200">
                                    <img src="/icons/youtube.png" alt="youtube" className="h-6" />
                                </div>
                            </div>
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

            <ProductReviewSection productId={id} />

            {/* Section Sản phẩm tương tự */}
            {relatedProducts.length > 0 && (
                <div className="max-w-screen-2xl mx-auto p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Sản phẩm tương tự</h2>
                    <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {relatedProducts.map((relatedProduct) => (
                            <ProductCard
                                key={relatedProduct.id}
                                product={relatedProduct}
                                isFeatured={relatedProduct.isFeatured || false}
                                handleAddToCart={handleAddToCart}
                                handleBuyNow={handleBuyNow}
                                formatPrice={formatPrice}
                            />
                        ))}
                    </ul>
                </div>
            )}
        </>
    );
}

export default ProductDetail;