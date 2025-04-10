import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AppContext from "../../context/AppContext";
import apiOrder from "../../api/apiOrder";
import { ToastContainer, toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import "react-toastify/dist/ReactToastify.css";

const Orders = () => {
    const { auth } = useContext(AppContext);
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const ordersPerPage = 5;

    const statusTranslations = {
        "PENDING": "Chờ xác nhận",
        "SHIPPED": "Đang giao hàng",
        "COMPLETED": "Giao hàng thành công",
        "CANCELLED": "Đã hủy"
    };

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const data = await apiOrder.getOrders();
            const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(sortedData);
        } catch (error) {
            toast.error(error.message || "Không thể tải danh sách đơn hàng!");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleCancelOrder = async (orderId) => {
        if (window.confirm("Bạn chắc chắn muốn hủy đơn hàng này?")) {
            try {
                await apiOrder.cancelOrder(orderId);
                toast.success("Hủy đơn hàng thành công!");
                fetchOrders();
            } catch (error) {
                toast.error(error.message || "Không thể hủy đơn hàng!");
            }
        }
    };

    const offset = currentPage * ordersPerPage;
    const currentPageData = orders.slice(offset, offset + ordersPerPage);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Đơn hàng của tôi</h2>

                {isLoading ? (
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {currentPageData.map((order) => (
                            <div key={order.id} className="bg-white shadow-md rounded-xl p-6 border border-gray-200">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-semibold">Đơn #{order.id}</h3>
                                        <p className="text-sm text-gray-600">Ngày đặt: {new Date(order.createdAt).toLocaleString()}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${order.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                                        order.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                                            order.status === "SHIPPED" ? "bg-blue-100 text-blue-800" :
                                                "bg-red-100 text-red-800"
                                        }`}>
                                        {statusTranslations[order.status] || order.status}
                                    </span>
                                </div>

                                <div className="mt-4 space-y-3">
                                    {order.orderDetails.map(detail => (
                                        <div key={detail.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                                            <div className="flex items-center space-x-4">
                                                <img
                                                    src={detail.productImage || "/placeholder.png"}
                                                    alt={detail.productName}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                                <div>
                                                    <span className="block font-medium text-gray-700">
                                                        {detail.productName}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        Số lượng: {detail.quantity}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-gray-900 font-semibold">
                                                {(detail.price * detail.quantity).toLocaleString()} VND
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between items-center mt-4 border-t pt-4">
                                    <strong className="text-lg">Tổng tiền:</strong>
                                    <strong className="text-xl text-gray-900">
                                        {order.totalPrice.toLocaleString()} VND
                                    </strong>
                                </div>

                                {order.status === "PENDING" && (
                                    <button
                                        onClick={() => handleCancelOrder(order.id)}
                                        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                    >
                                        Hủy đơn hàng
                                    </button>
                                )}
                            </div>
                        ))}

                        <ReactPaginate
                            previousLabel={"Trước"}
                            nextLabel={"Sau"}
                            pageCount={Math.ceil(orders.length / ordersPerPage)}
                            onPageChange={({ selected }) => setCurrentPage(selected)}
                            containerClassName={"pagination flex justify-center space-x-2 my-8"}
                            activeClassName={"bg-blue-500 text-white px-3 py-1 rounded"}
                            pageClassName={"px-3 py-1 border rounded cursor-pointer"}
                        />
                    </div>
                )}
            </div>
            <ToastContainer />
        </div>
    );
};

export default Orders;
