import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";
import NotFoundPage from "../pages/NotFoundPage";

// Tiện ích để load component lazy + fallback gọn gàng
const lazyLoad = (path) => {
    const Component = lazy(() => import(`../pages/admin/${path}.jsx`));
    return (
        <Suspense fallback={<div>Đang tải...</div>}>
            <Component />
        </Suspense>
    );
};

const AdminRoutes = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    <ProtectedRoute roles={["ADMIN"]}>
                        <AdminLayout />
                    </ProtectedRoute>
                }
            >
                {/* Redirect mặc định */}
                <Route index element={<Navigate to="dashboard" replace />} />

                {/* Lazy loaded routes */}
                <Route path="dashboard" element={lazyLoad("Dashboard")} />
                <Route path="products" element={lazyLoad("ProductManagement")} />
                <Route path="orders" element={lazyLoad("OrderManagement")} />
                <Route path="customers" element={lazyLoad("UserCustomerManagement")} />
                <Route path="categories" element={lazyLoad("CategoryManagement")} />
                <Route path="suppliers" element={lazyLoad("SupplierManagement")} />
                <Route path="employees" element={lazyLoad("EmployeeManagement")} />
                <Route path="report" element={lazyLoad("ReportManagement")} />
                <Route path="inventory" element={lazyLoad("InventoryManagement")} />
                <Route path="chat" element={lazyLoad("AdminChat")} />
                <Route path="profile" element={lazyLoad("AdminProfile")} />
                <Route path="discounts" element={lazyLoad("DiscountManagement")} />

                {/* 404 fallback */}
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
};

export default AdminRoutes;
