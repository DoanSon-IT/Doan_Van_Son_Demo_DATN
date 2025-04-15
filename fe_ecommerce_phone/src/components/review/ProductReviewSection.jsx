import { useEffect, useState } from "react";
import { getPagedReviews } from "../../api/apiReview";
import { Card, CardContent } from "../common/Card";
import Pagination  from "../common/Pagination";

const ProductReviewSection = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchReviews();
    }, [page]);

    const fetchReviews = async () => {
        try {
            const res = await getPagedReviews(productId, page);
            setReviews(res.content);
            setTotalPages(res.totalPages);
        } catch (err) {
            console.error("Lỗi khi tải đánh giá", err);
        }
    };

    if (!reviews.length) return (
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6 text-center shadow-sm">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Đánh giá sản phẩm</h3>
            <p className="text-gray-500 italic">Chưa có đánh giá nào cho sản phẩm này.</p>
        </div>
    );

    return (
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Đánh giá sản phẩm</h3>

            <div className="space-y-4">
                {reviews.map((r) => (
                    <Card key={r.id}>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <span className="text-yellow-500 text-lg">
                                    {"\u2B50".repeat(r.rating)}
                                </span>
                                <span className="text-muted text-sm">({r.rating}/5)</span>
                            </div>
                            <p className="mt-2 text-gray-700">{r.comment}</p>
                            <p className="text-xs text-right text-muted italic">
                                – {r.customerName}, {new Date(r.createdAt).toLocaleDateString()}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mt-6">
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
        </div>
    );

};

export default ProductReviewSection;
