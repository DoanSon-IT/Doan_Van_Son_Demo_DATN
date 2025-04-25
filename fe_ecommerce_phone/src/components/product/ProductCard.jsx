import React, { useState, useEffect, useCallback } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { ShoppingCart, CreditCard } from "lucide-react";
import StarRatings from "./StarRatings";
import "react-lazy-load-image-component/src/effects/blur.css";
import { getAverageRating, getReviewCount } from "../../api/apiReview";

function ProductCard({ product, isFeatured, handleAddToCart, handleBuyNow, formatPrice, refreshKey }) {
    const imageUrl = product.images?.[0]?.imageUrl || "https://via.placeholder.com/200";
    const isDiscounted = product.discountedPrice &&
        product.discountedPrice < product.sellingPrice &&
        (!product.discountExpiresAt || new Date(product.discountExpiresAt) > new Date());
    const discountPercentage = isDiscounted
        ? (((product.sellingPrice - product.discountedPrice) / product.sellingPrice) * 100).toFixed(0)
        : 0;

    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [rating, setRating] = useState(product.rating || 0);
    const [ratingCount, setRatingCount] = useState(product.ratingCount || 0);
    const [isLoading, setIsLoading] = useState(false);

    const fetchRatingData = useCallback(async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            const [avgRating, count] = await Promise.all([
                getAverageRating(product.id),
                getReviewCount(product.id),
            ]);
            setRating(avgRating || 0);
            setRatingCount(count || 0);
        } catch (error) {
            console.error("Error fetching rating data:", error);
            setRating(0);
            setRatingCount(0);
        } finally {
            setIsLoading(false);
        }
    }, [product.id]);

    useEffect(() => {
        fetchRatingData();
    }, [product.id, refreshKey, fetchRatingData]);

    return (
        <li className="max-w-sm rounded-lg overflow-hidden shadow-lg bg-white border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col h-[600px]">
            {/* Ảnh sản phẩm */}
            <div className="relative">
                <a href={`/products/${product.id}`}>
                    <LazyLoadImage
                        effect="blur"
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-60 object-cover rounded-t-lg"
                        onError={(e) => (e.target.src = "https://via.placeholder.com/200")}
                    />
                </a>
                {isDiscounted && (
                    <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-20">
                        Giảm {discountPercentage}%
                    </span>
                )}
            </div>

            {/* Nội dung sản phẩm */}
            <div className="p-5 flex flex-col flex-grow">
                {/* Phần trên: Tên, đánh giá, giá, mô tả */}
                <div className="flex flex-col flex-grow">
                    <a
                        href={`/products/${product.id}`}
                        className="text-xl font-bold text-gray-800 hover:text-blue-600 block overflow-hidden whitespace-nowrap"
                    >
                        <span className="inline-block transition-all duration-300 hover:animate-marquee">
                            {product.name || "Sản phẩm không tên"}
                        </span>
                    </a>
                    <div className="flex items-center gap-2 text-sm mt-1">
                        {isLoading ? (
                            <span className="text-gray-500">Đang tải...</span>
                        ) : (
                            <>
                                <StarRatings rating={rating} className="flex" />
                                <span className="text-gray-500">({ratingCount})</span>
                            </>
                        )}
                    </div>
                    {isDiscounted ? (
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl font-bold text-black">{formatPrice(product.discountedPrice)}</span>
                            <span className="text-sm text-gray-500 line-through">{formatPrice(product.sellingPrice)}</span>
                        </div>
                    ) : (
                        <span className="text-2xl font-bold text-black mb-3">{formatPrice(product.sellingPrice)}</span>
                    )}
                    {/* Mô tả với chiều cao cố định */}
                    <div className="text-sm text-gray-600 mb-5 flex-grow">
                        <div
                            className={`transition-all duration-300 ${isDescriptionExpanded ? "line-clamp-none" : "line-clamp-3"}`}
                        >
                            {product.description || "Không có mô tả"}
                        </div>
                        {product.description && product.description.length > 50 && (
                            <button
                                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                className="text-xs text-black hover:text-blue-300 mt-1 flex items-center gap-1"
                            >
                                {isDescriptionExpanded ? (
                                    <>
                                        <span>Thu gọn</span>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                        </svg>
                                    </>
                                ) : (
                                    <>
                                        <span>Xem thêm</span>
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Phần dưới: Nút hành động */}
                <div className="flex gap-2 mt-auto">
                    <button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 flex items-center justify-center bg-white border border-black text-black py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                        <ShoppingCart className="w-4 h-4 mr-2" /> Giỏ hàng
                    </button>
                    <button
                        onClick={() => handleBuyNow(product)}
                        className="flex-1 flex items-center justify-center bg-black text-white py-2 px-3 rounded-lg hover:bg-black transition-colors"
                    >
                        <CreditCard className="w-4 h-4 mr-2" /> Mua ngay
                    </button>
                </div>
            </div>
        </li>
    );
}

export default ProductCard;