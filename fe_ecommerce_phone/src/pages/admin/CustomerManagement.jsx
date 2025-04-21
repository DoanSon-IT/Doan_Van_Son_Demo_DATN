import React, { useEffect, useState, useContext } from "react";
import AppContext from "../../context/AppContext";
import apiUser from "../../api/apiUser";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PAGE_SIZE = 10;

const CustomerManagement = () => {
    const { auth } = useContext(AppContext);
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [sortOrder, setSortOrder] = useState("desc");
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!auth) return navigate("/auth/login");
        fetchCustomers();
    }, [auth, page, searchTerm, sortOrder]);

    const fetchCustomers = async () => {
        setIsLoading(true);
        console.log("Fetching customers with sortOrder:", sortOrder); // Log để kiểm tra
        try {
            const data = await apiUser.getCustomersPaged({
                keyword: searchTerm,
                page,
                size: PAGE_SIZE,
                sortBy: "id",
                sortDir: sortOrder,
            });
            console.log("API response:", data); // Log response
            setCustomers(data.content);
            console.log("Updated customers:", data.content); // Log danh sách customer
            setTotalPages(data.totalPages);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Xác nhận xóa khách hàng này?")) return;
        try {
            await apiUser.deleteCustomer(id);
            fetchCustomers();
            toast.success("Đã xóa khách hàng");
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleUpdatePoints = async (id, points) => {
        try {
            const updated = await apiUser.updateLoyaltyPoints(id, points);
            setCustomers((prev) =>
                prev.map((c) => (c.id === id ? updated : c))
            );
        } catch (err) {
            toast.error("Lỗi cập nhật điểm tích lũy");
        }
    };

    const toggleSortOrder = () => {
        setSortOrder((prev) => {
            console.log("Toggling sortOrder from", prev); // Log để kiểm tra
            return prev === "desc" ? "asc" : "desc";
        });
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Quản lý khách hàng</h2>
                <button
                    onClick={toggleSortOrder}
                    className="text-sm px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200"
                >
                    Sắp xếp: {sortOrder === "desc" ? "Mới nhất" : "Cũ nhất"}
                </button>
            </div>

            <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4 px-4 py-2 border rounded w-full sm:w-1/2"
            />

            {isLoading ? (
                <div className="text-center py-10">Đang tải...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border rounded shadow">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left">ID</th>
                                <th className="p-3 text-left">Tên</th>
                                <th className="p-3 text-left">Email</th>
                                <th className="p-3 text-left">Điểm tích lũy</th>
                                <th className="p-3 text-left">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((customer) => (
                                <tr key={customer.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">{customer.id}</td>
                                    <td className="p-3">{customer.user?.fullName}</td>
                                    <td className="p-3">{customer.user?.email}</td>
                                    <td className="p-3">
                                        <input
                                            type="number"
                                            value={customer.loyaltyPoints || 0}
                                            onChange={(e) =>
                                                handleUpdatePoints(customer.id, parseInt(e.target.value))
                                            }
                                            className="p-1 border rounded w-20"
                                        />
                                    </td>
                                    <td className="p-3">
                                        <button
                                            onClick={() => handleDelete(customer.id)}
                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-center space-x-2 mt-4">
                        <button
                            disabled={page === 0}
                            onClick={() => setPage(page - 1)}
                            className="px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200"
                        >
                            Trước
                        </button>
                        <span className="px-3 py-1">{page + 1} / {totalPages}</span>
                        <button
                            disabled={page + 1 >= totalPages}
                            onClick={() => setPage(page + 1)}
                            className="px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            )}

            <ToastContainer />
        </div>
    );
};

export default CustomerManagement;