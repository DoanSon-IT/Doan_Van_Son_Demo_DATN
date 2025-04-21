import React, { useEffect, useState, useContext } from "react";
import AppContext from "../../context/AppContext";
import apiUser from "../../api/apiUser";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PAGE_SIZE = 10;

const UserManagement = () => {
    const { auth } = useContext(AppContext);
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [sortOrder, setSortOrder] = useState("desc");

    useEffect(() => {
        if (!auth) return navigate("/auth/login");
        fetchUsers();
    }, [auth, page, searchTerm, sortOrder]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const data = await apiUser.getUsersPaged({
                keyword: searchTerm,
                page,
                size: PAGE_SIZE,
                sortBy: "id",
                sortDir: sortOrder,
            });
            setUsers(data.content);
            setTotalPages(data.totalPages);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Xác nhận xóa tài khoản này?")) return;
        try {
            await apiUser.deleteUser(id);
            fetchUsers();
            toast.success("Đã xóa người dùng");
        } catch (err) {
            toast.error(err.message);
        }
    };

    const formatRoles = (roles) => {
        if (!roles) return "Không có vai trò";
        return roles
            .map((r) =>
                r === "ROLE_CUSTOMER"
                    ? "Khách hàng"
                    : r === "ROLE_ADMIN"
                        ? "Quản trị viên"
                        : r === "ROLE_STAFF"
                            ? "Nhân viên"
                            : r
            )
            .join(", ");
    };

    const toggleSortOrder = () => {
        setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Quản lý tài khoản</h2>
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
                                <th className="p-3 text-left">SĐT</th>
                                <th className="p-3 text-left">Vai trò</th>
                                <th className="p-3 text-left">Xác thực</th>
                                <th className="p-3 text-left">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">{user.id}</td>
                                    <td className="p-3">{user.fullName}</td>
                                    <td className="p-3">{user.email}</td>
                                    <td className="p-3">{user.phone || "-"}</td>
                                    <td className="p-3">{formatRoles(user.roles)}</td>
                                    <td className="p-3">{user.verified ? "✔️" : "❌"}</td>
                                    <td className="p-3">
                                        <button
                                            onClick={() => handleDelete(user.id)}
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
                        <button disabled={page === 0} onClick={() => setPage(page - 1)} className="px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200">Trước</button>
                        <span className="px-3 py-1">{page + 1} / {totalPages}</span>
                        <button disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200">Sau</button>
                    </div>
                </div>
            )}

            <ToastContainer />
        </div>
    );
};

export default UserManagement;
