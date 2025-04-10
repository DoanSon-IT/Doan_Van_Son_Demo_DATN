import { NavLink } from "react-router-dom";
import {
    FaChartLine,
    FaBoxOpen,
    FaUsers,
    FaList,
    FaShoppingCart,
    FaTruck,
    FaUserTie,
    FaWarehouse,
    FaComments,
    FaChartPie,
    FaTicketAlt
} from "react-icons/fa";

const Sidebar = () => {
    return (
        <aside className="w-64 bg-white dark:bg-gray-900 h-screen fixed left-0 top-0 shadow-lg border-r border-gray-200 dark:border-gray-700 z-40 overflow-y-auto pt-[72px]">
            <nav className="mt-6">
                <ul className="space-y-1">
                    <li>
                        <NavLink to="/admin/dashboard" className={({ isActive }) =>
                            `block px-6 py-3 ${isActive ? "bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"} font-medium transition-all rounded-r-full`
                        }>
                            <FaChartLine className="inline-block mr-3" /> Dashboard
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/products" className={({ isActive }) =>
                            `block px-6 py-3 ${isActive ? "bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"} font-medium transition-all rounded-r-full`
                        }>
                            <FaBoxOpen className="inline-block mr-3" /> Quản lý sản phẩm
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/categories" className={({ isActive }) =>
                            `block px-6 py-3 ${isActive ? "bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"} font-medium transition-all rounded-r-full`
                        }>
                            <FaList className="inline-block mr-3" /> Quản lý danh mục
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/orders" className={({ isActive }) =>
                            `block px-6 py-3 ${isActive ? "bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"} font-medium transition-all rounded-r-full`
                        }>
                            <FaShoppingCart className="inline-block mr-3" /> Quản lý đơn hàng
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/customers" className={({ isActive }) =>
                            `block px-6 py-3 ${isActive ? "bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"} font-medium transition-all rounded-r-full`
                        }>
                            <FaUsers className="inline-block mr-3" /> Quản lý khách hàng
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/suppliers" className={({ isActive }) =>
                            `block px-6 py-3 ${isActive ? "bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"} font-medium transition-all rounded-r-full`
                        }>
                            <FaTruck className="inline-block mr-3" /> Quản lý nhà cung cấp
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/employees" className={({ isActive }) =>
                            `block px-6 py-3 ${isActive ? "bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"} font-medium transition-all rounded-r-full`
                        }>
                            <FaUserTie className="inline-block mr-3" /> Quản lý nhân viên
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/inventory" className={({ isActive }) =>
                            `block px-6 py-3 ${isActive ? "bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"} font-medium transition-all rounded-r-full`
                        }>
                            <FaWarehouse className="inline-block mr-3" /> Quản lý tồn kho
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/discounts" className={({ isActive }) =>
                            `block px-6 py-3 ${isActive ? "bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"} font-medium transition-all rounded-r-full`
                        }>
                            <FaTicketAlt className="inline-block mr-3" /> Mã giảm giá
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/chat" className={({ isActive }) =>
                            `block px-6 py-3 ${isActive ? "bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"} font-medium transition-all rounded-r-full`
                        }>
                            <FaComments className="inline-block mr-3" /> Quản lý chat
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/report" className={({ isActive }) =>
                            `block px-6 py-3 ${isActive ? "bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"} font-medium transition-all rounded-r-full`
                        }>
                            <FaChartPie className="inline-block mr-3" /> Thống kê
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;