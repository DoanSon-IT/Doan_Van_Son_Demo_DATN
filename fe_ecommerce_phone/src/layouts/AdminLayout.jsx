import { Outlet } from "react-router-dom";
import SideBar from "../components/admin/Sidebar";
import AdminHeader from "../components/admin/AdminHeader";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header cố định ở trên cùng */}
      <AdminHeader />

      {/* Phần bên dưới gồm Sidebar + Main Content */}
      <div className="flex pt-[72px]"> {/* đẩy xuống dưới header */}
        {/* Sidebar đã fixed, nên không chiếm không gian thực */}
        <SideBar />

        <main className="ml-64 p-6 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
