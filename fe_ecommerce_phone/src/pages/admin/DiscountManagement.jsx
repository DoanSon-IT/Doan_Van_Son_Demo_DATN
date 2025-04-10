import React, { useEffect, useState } from "react";
import {
    getAllDiscounts,
    deleteDiscount,
    updateDiscount,
    createDiscount
} from "../../api/apiDiscount";
import { AlertCircle, Calendar, CheckCircle, Edit2, Search, Trash2, Plus, Percent, DollarSign, Clock } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { DateTime } from "luxon";

const formatCurrency = (value) =>
    new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);

const DiscountManagement = () => {
    const [discounts, setDiscounts] = useState([]);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [editingDiscount, setEditingDiscount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [notification, setNotification] = useState({ show: false, message: "", type: "" });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        code: "",
        discountPercentage: '',
        validFrom: null,
        validTo: null,
        minOrderValue: '',
        probabilityWeight: ''
    });

    const fetchDiscounts = async () => {
        setLoading(true);
        try {
            const res = await getAllDiscounts(page, size);
            setDiscounts(res.data.content);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error("Lỗi khi tải mã giảm giá:", error);
            showNotification("Không thể tải dữ liệu mã giảm giá", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiscounts();
    }, [page]);

    const filteredDiscounts = discounts.filter(discount =>
        discount.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const showNotification = (message, type) => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
    };

    const handleDelete = async (id) => {
        try {
            await deleteDiscount(id);
            fetchDiscounts();
            showNotification("Xóa mã giảm giá thành công", "success");
        } catch (error) {
            showNotification("Không thể xóa mã giảm giá", "error");
        }
    };

    const handleEdit = (discount) => {
        setEditingDiscount(discount.id);
        setFormData({
            ...discount,
            validFrom: new Date(discount.validFrom),
            validTo: new Date(discount.validTo)
        });
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setEditingDiscount(null);
        setFormData({
            code: "",
            discountPercentage: '',
            validFrom: null,
            validTo: null,
            minOrderValue: ''
        });
        setIsModalOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.validFrom || !formData.validTo || formData.validFrom >= formData.validTo) {
            showNotification("Ngày bắt đầu phải nhỏ hơn ngày kết thúc", "error");
            setLoading(false);
            return;
        }

        const formattedData = {
            ...formData,
            validFrom: formData.validFrom.toISOString(),
            validTo: formData.validTo.toISOString()
        };

        try {
            if (editingDiscount) {
                await updateDiscount(editingDiscount, formattedData);
                showNotification("Cập nhật mã giảm giá thành công", "success");
            } else {
                await createDiscount(formattedData);
                showNotification("Thêm mã giảm giá mới thành công", "success");
            }

            handleCancel();
            fetchDiscounts();
        } catch (error) {
            const errorMessage = error.response?.data?.message || (editingDiscount ? "Không thể cập nhật mã giảm giá" : "Không thể thêm mã giảm giá mới");
            showNotification(errorMessage, "error");
            console.error("Lỗi từ API:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    const isExpired = (validTo) => DateTime.fromISO(validTo).toUTC() < DateTime.now().toUTC();
    const isActive = (validFrom, validTo) => {
        const now = DateTime.now().toUTC();
        return DateTime.fromISO(validFrom).toUTC() <= now && DateTime.fromISO(validTo).toUTC() >= now;
    };

    const formatDateTime = (iso) =>
        DateTime.fromISO(iso).setZone("Asia/Ho_Chi_Minh").toFormat("dd/MM/yyyy HH:mm");

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header with stats */}
                <div className="mb-6 flex flex-col md:flex-row justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Quản Lý Mã Giảm Giá</h1>

                    <div className="flex flex-wrap gap-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center border-l-4 border-blue-500">
                            <div className="bg-blue-100 p-2 rounded-full mr-3">
                                <Calendar className="text-blue-500 w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Tổng Mã</p>
                                <p className="text-xl font-bold">{discounts.length}</p>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center border-l-4 border-green-500">
                            <div className="bg-green-100 p-2 rounded-full mr-3">
                                <CheckCircle className="text-green-500 w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Đang Hoạt Động</p>
                                <p className="text-xl font-bold">
                                    {discounts.filter(d => isActive(d.validFrom, d.validTo)).length}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center border-l-4 border-red-500">
                            <div className="bg-red-100 p-2 rounded-full mr-3">
                                <Clock className="text-red-500 w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Hết Hạn</p>
                                <p className="text-xl font-bold">
                                    {discounts.filter(d => isExpired(d.validTo)).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notification */}
                {notification.show && (
                    <div
                        className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center z-50 ${notification.type === "success" ? "bg-green-500" : "bg-red-500"
                            } text-white transition-all duration-300`}
                    >
                        {notification.type === "success" ? (
                            <CheckCircle className="mr-2 h-5 w-5" />
                        ) : (
                            <AlertCircle className="mr-2 h-5 w-5" />
                        )}
                        {notification.message}
                    </div>
                )}

                {/* Search and add button */}
                <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Tìm kiếm mã giảm giá..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition shadow-sm font-medium"
                    >
                        <Plus className="h-5 w-5" />
                        Thêm Mã Giảm Giá
                    </button>
                </div>

                {/* Discount table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
                    {loading ? (
                        <div className="flex justify-center items-center p-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : filteredDiscounts.length === 0 ? (
                        <div className="text-center p-12 text-gray-500">
                            <div className="flex justify-center mb-4">
                                <Search className="h-12 w-12 text-gray-300" />
                            </div>
                            <p className="text-lg font-medium">Không tìm thấy mã giảm giá nào</p>
                            {searchTerm && (
                                <p className="mt-2">Thử thay đổi từ khóa tìm kiếm hoặc thêm mã giảm giá mới</p>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã Code</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Giảm</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thời Gian</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn Tối Thiểu</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tỷ Lệ Trúng</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng Thái</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành Động</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredDiscounts.map(dis => (
                                        <tr key={dis.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-mono font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded inline-block">{dis.code}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                                                    <Percent className="h-4 w-4 mr-1" />
                                                    {dis.discountPercentage}%
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center justify-center text-gray-600">
                                                        <span className="font-medium mr-1">Từ:</span>
                                                        {formatDateTime(dis.validFrom)}
                                                    </div>
                                                    <div className="flex items-center justify-center text-gray-600">
                                                        <span className="font-medium mr-1">Đến:</span>
                                                        {formatDateTime(dis.validTo)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="inline-flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full">
                                                    {formatCurrency(dis.minOrderValue)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                                                {(dis.probabilityWeight || 0) + '%'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {isActive(dis.validFrom, dis.validTo) ? (
                                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        Đang áp dụng
                                                    </span>
                                                ) : isExpired(dis.validTo) ? (
                                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                        Hết hạn
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                        Sắp tới
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                <div className="flex justify-center space-x-3">
                                                    <button
                                                        onClick={() => handleEdit(dis)}
                                                        className="text-blue-600 hover:text-blue-900 flex items-center"
                                                    >
                                                        <Edit2 className="h-4 w-4 mr-1" />
                                                        Sửa
                                                    </button>
                                                    <button
                                                        onClick={() => confirmDelete(dis.id, dis.code)}
                                                        className="text-red-600 hover:text-red-900 flex items-center"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        Xóa
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-6 flex justify-center">
                        <nav className="inline-flex rounded-md shadow">
                            <button
                                onClick={() => setPage(Math.max(0, page - 1))}
                                disabled={page === 0}
                                className={`px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${page === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                &larr; Trước
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i)}
                                    className={`px-4 py-2 border-t border-b border-gray-300 text-sm font-medium ${page === i
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                                disabled={page === totalPages - 1}
                                className={`px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${page === totalPages - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                Tiếp &rarr;
                            </button>
                        </nav>
                    </div>
                )}

                {/* Modal form */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                        {editingDiscount ? 'Cập Nhật Mã Giảm Giá' : 'Thêm Mã Giảm Giá Mới'}
                                    </h3>
                                    <form onSubmit={handleSubmit}>
                                        <div className="grid gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Mã Code
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="SUMMER2025"
                                                    value={formData.code}
                                                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                                                    className="border p-2 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Phần Trăm Giảm
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        placeholder="10"
                                                        value={formData.discountPercentage}
                                                        onChange={e => setFormData({ ...formData, discountPercentage: e.target.value === '' ? '' : +e.target.value })}
                                                        className="border p-2 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
                                                        required
                                                    />
                                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                        <span className="text-gray-500">%</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Thời Gian Bắt Đầu
                                                </label>
                                                <DatePicker
                                                    selected={formData.validFrom ? new Date(formData.validFrom) : null}
                                                    onChange={(date) => setFormData({ ...formData, validFrom: date })}
                                                    dateFormat="dd/MM/yyyy HH:mm"
                                                    timeFormat="HH:mm"
                                                    showTimeSelect
                                                    placeholderText="Chọn ngày giờ (dd/mm/yyyy hh:mm)"
                                                    className="border p-2 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Thời Gian Kết Thúc
                                                </label>
                                                <DatePicker
                                                    selected={formData.validTo ? new Date(formData.validTo) : null}
                                                    onChange={(date) => setFormData({ ...formData, validTo: date })}
                                                    dateFormat="dd/MM/yyyy HH:mm"
                                                    timeFormat="HH:mm"
                                                    showTimeSelect
                                                    placeholderText="Chọn ngày giờ (dd/mm/yyyy hh:mm)"
                                                    className="border p-2 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Giá Trị Đơn Hàng Tối Thiểu
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        placeholder="100000"
                                                        value={formData.minOrderValue}
                                                        onChange={e => setFormData({ ...formData, minOrderValue: e.target.value === '' ? '' : +e.target.value })}
                                                        className="border p-2 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
                                                        required
                                                    />
                                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                        <span className="text-gray-500">đ</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700">Tỷ lệ trúng (weight)</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    placeholder="Ví dụ: 1 là rất hiếm, 100 là dễ trúng"
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring focus:ring-indigo-200 focus:border-indigo-500"
                                                    value={formData.probabilityWeight}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            probabilityWeight: e.target.value === '' ? '' : +e.target.value
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-5 sm:mt-6 flex justify-end space-x-3">
                                            <button
                                                type="button"
                                                onClick={handleCancel}
                                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                Hủy
                                            </button>
                                            <button
                                                type="submit"
                                                className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                {editingDiscount ? 'Cập Nhật' : 'Thêm Mới'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiscountManagement;