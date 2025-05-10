import React, { useState, useEffect, useRef } from "react";
import { spinDiscount } from "../../api/apiDiscount";
import { Gift, X, CheckCircle, AlertCircle } from "lucide-react";

const RandomDiscount = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [canSpin, setCanSpin] = useState(true);
    const modalRef = useRef(null);

    // Kiểm tra xem đã quay chưa trong ngày hôm nay
    useEffect(() => {
        const lastSpinDate = localStorage.getItem('lastSpinDate');
        const today = new Date().toDateString();

        if (lastSpinDate === today) {
            setCanSpin(false);
        } else {
            setCanSpin(true);
        }
    }, []);

    // Định dạng tiền tệ VND
    const formatCurrency = (value) =>
        new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);

    // Xử lý khi bấm lấy mã giảm giá ngẫu nhiên
    const handleGetDiscount = async () => {
        if (!canSpin) return;

        setLoading(true);
        setResult(null);

        try {
            const res = await spinDiscount();
            setResult(res.data);
            setCanSpin(false);

            if (res.data && res.data.code) {
                // Lưu kết quả vào lịch sử
                const newWin = {
                    date: new Date().toLocaleDateString('vi-VN'),
                    code: res.data.code,
                    discount: res.data.discountPercentage + '%'
                };

                const winHistory = JSON.parse(localStorage.getItem('wheelHistory') || '[]');
                const updatedHistory = [newWin, ...winHistory].slice(0, 10);
                localStorage.setItem('wheelHistory', JSON.stringify(updatedHistory));

                // Đánh dấu đã quay trong ngày hôm nay
                localStorage.setItem('lastSpinDate', new Date().toDateString());
            }
        } catch (err) {
            setResult({ code: null, message: "Không có mã nào khả dụng hoặc đã xảy ra lỗi." });
            setCanSpin(false);
        } finally {
            setLoading(false);
        }
    };

    // Mở modal
    const openModal = () => {
        setIsOpen(true);
        document.body.classList.add('overflow-hidden');
    };

    // Đóng modal
    const closeModal = () => {
        setIsOpen(false);
        document.body.classList.remove('overflow-hidden');
    };

    // Xử lý click bên ngoài modal để đóng
    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target) && isOpen) {
                closeModal();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleOutsideClick);
        }

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [isOpen]);

    return (
        <>
            {/* Nút nhỏ ở góc màn hình */}
            <div className="fixed bottom-4 right-20 z-[998] sm:right-24 md:right-28">
                <button
                    onClick={() => {
                        openModal();
                        handleGetDiscount();
                    }}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg flex items-center justify-center transform hover:scale-105 transition-all duration-300"
                >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-500 border-2 border-purple-300">
                        <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    {canSpin && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                            1
                        </span>
                    )}
                </button>
            </div>

            {/* Modal hiển thị kết quả */}
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70 transition-opacity duration-300 p-4">
                    <div
                        ref={modalRef}
                        className="w-full max-w-md bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl shadow-2xl overflow-hidden transition-transform duration-300 transform scale-100 animate-fadeIn"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white flex items-center">
                                <Gift className="text-pink-300 mr-2" /> Nhận Mã Giảm Giá
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-white hover:text-gray-200 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 pb-6 pt-2">
                            {/* Hiển thị trạng thái lượt quay */}
                            <div className="text-center text-sm text-gray-300 mb-4">
                                {canSpin ? 'Bạn có 1 lượt nhận mã hôm nay' : 'Bạn đã hết lượt nhận mã hôm nay'}
                            </div>

                            {/* Kết quả */}
                            {loading ? (
                                <div className="text-center text-white">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                                    <p>Đang tìm mã giảm giá...</p>
                                </div>
                            ) : result && result.code ? (
                                <div className="mt-6 bg-gradient-to-r from-indigo-900 to-purple-900 text-white px-5 py-4 rounded-xl shadow-md animate-fadeIn">
                                    <div className="flex items-center justify-center mb-2">
                                        <CheckCircle className="text-yellow-300 mr-2" />
                                        <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
                                            Chúc mừng bạn!
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 tracking-wider">
                                            {result.code}
                                        </p>
                                    </div>
                                    <div className="mt-3 text-center">
                                        <p className="text-sm">
                                            Giảm <span className="font-bold text-yellow-300">{result.discountPercentage}%</span>
                                        </p>
                                        <p className="text-sm">
                                            Đơn từ <span className="font-bold text-yellow-300">{formatCurrency(result.minOrderValue)}</span>
                                        </p>
                                        <p className="text-xs text-gray-300 mt-2">
                                            Hạn sử dụng: 7 ngày kể từ hôm nay
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-6 bg-gradient-to-r from-gray-800 to-gray-900 text-gray-200 px-5 py-4 rounded-xl shadow-md">
                                    <div className="text-center">
                                        <AlertCircle className="text-red-300 mx-auto mb-2" />
                                        <p className="text-lg font-semibold mb-2">Rất tiếc!</p>
                                        <p className="text-sm">{result?.message || "Không có mã giảm giá khả dụng."}</p>
                                    </div>
                                </div>
                            )}

                            {/* Thông báo quay lại ngày mai */}
                            {!canSpin && !loading && (
                                <p className="text-xs text-gray-300 mt-4 text-center">
                                    Vui lòng quay lại vào ngày mai
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RandomDiscount;