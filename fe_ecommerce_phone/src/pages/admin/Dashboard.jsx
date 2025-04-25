import React, { useEffect, useState, useContext, useMemo } from "react";
import AppContext from "../../context/AppContext";
import {
  fetchDashboardStats,
  fetchRecentOrders,
  fetchTopSellingProducts,
  fetchRecentUsers,
  fetchTopSellingProductsDTO,
  fetchOrderCountByStatus,
  fetchLowStockProducts,
  fetchTotalProfit,
  fetchUsersByRegion,
} from "../../api/apiAdmin";
import { Line, Pie, Bar } from "react-chartjs-2";
import "chart.js/auto";
import { motion } from "framer-motion";

// Ánh xạ trạng thái đơn hàng sang tiếng Việt
const orderStatusMap = {
  "PENDING": "Chờ xác nhận",
  "CONFIRMED": "Đã xác nhận",
  "SHIPPED": "Đang vận chuyển",
  "CANCELLED": "Đã hủy",
  "COMPLETED": "Hoàn thành",
};

// Styling cho các Card thống kê
const StatCard = ({ icon, title, value, trend, color, onClick }) => {
  return (
    <motion.div
      className={`bg-white p-5 shadow-lg rounded-xl flex flex-col transition-all hover:shadow-xl cursor-pointer overflow-hidden ${color}`}
      whileHover={{ y: -5, boxShadow: "0 10px 30px -15px rgba(0,0,0,0.2)" }}
      onClick={onClick}
      transition={{ type: "spring", stiffness: 300 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="text-3xl p-2 rounded-lg bg-opacity-20" style={{ backgroundColor: `${color}33` }}>
          {icon}
        </div>
        {trend && (
          <div className={`text-sm font-medium ${trend > 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="mt-2">
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
      </div>
    </motion.div>
  );
};

// Component bảng dữ liệu với hiệu ứng và tính năng sắp xếp
const DataTable = ({ title, data, columns, loading, emptyMessage }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !data) return data;
    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  return (
    <motion.div
      className="bg-white p-6 shadow-lg rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-lg font-bold mb-6 text-gray-800 border-b pb-2">{title}</h2>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {data && data.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200 table-hover">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      onClick={() => handleSort(column.key)}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center">
                        {column.label}
                        {sortConfig.key === column.key && (
                          <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedData.map((item, index) => (
                  <motion.tr
                    key={item.id || index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ backgroundColor: "#f9fafb" }}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    {columns.map((column) => (
                      <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {column.render
                          ? column.render(item)
                          : item[column.key] !== undefined ? item[column.key] : 'N/A'}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex justify-center items-center h-32 text-gray-500">
              {emptyMessage || "Không có dữ liệu để hiển thị"}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

// Component biểu đồ với hiệu ứng
const ChartCard = ({ title, children, loading }) => {
  return (
    <motion.div
      className="bg-white p-6 shadow-lg rounded-xl"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <h2 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">{title}</h2>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="h-72">
          {children}
        </div>
      )}
    </motion.div>
  );
};

const Dashboard = () => {
  const { auth, authLoading } = useContext(AppContext);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [topProductsDTO, setTopProductsDTO] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState({});
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [periodFilter, setPeriodFilter] = useState(7);
  const [activeTab, setActiveTab] = useState("overview");
  const [profit, setProfit] = useState(0);

  // Thống kê phần trăm tăng giảm
  const [comparisons, setComparisons] = useState({
    revenue: 0,
    orders: 0,
    products: 0,
    users: 0
  });

  useEffect(() => {
    if (authLoading) return;

    if (!auth) {
      setError("Chưa xác thực. Vui lòng đăng nhập lại!");
      setLoading(false);
      return;
    }

    fetchDashboardData();
  }, [auth, authLoading, periodFilter]);

  // Fetch dữ liệu dashboard
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsData = await fetchDashboardStats(periodFilter);
      const regionData = await fetchUsersByRegion();
      statsData.usersCountByRegion = regionData;
      setStats(statsData);

      // Giả lập dữ liệu % tăng trưởng - trong thực tế sẽ lấy từ API
      setComparisons({
        revenue: Math.floor(Math.random() * 20) - 5, // -5 đến 15%
        orders: Math.floor(Math.random() * 15), // 0 đến 15%
        products: Math.floor(Math.random() * 10) - 2, // -2 đến 8%
        users: Math.floor(Math.random() * 25) - 10 // -10 đến 15%
      });

      const profitData = await fetchTotalProfit(periodFilter);
      setProfit(profitData);

      const ordersData = await fetchRecentOrders(8);
      // Áp dụng ánh xạ trạng thái đơn hàng sang tiếng Việt
      const translatedOrders = ordersData.map(order => ({
        ...order,
        status: orderStatusMap[order.status] || order.status
      }));
      setRecentOrders(translatedOrders);

      const productsData = await fetchTopSellingProducts(5);
      setTopProducts(productsData);

      const usersData = await fetchRecentUsers(5);
      setRecentUsers(usersData);

      const startDate = new Date(Date.now() - periodFilter * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();
      const topProductsDTOData = await fetchTopSellingProductsDTO(startDate, endDate, 5);
      setTopProductsDTO(topProductsDTOData);

      const orderStatus = await fetchOrderCountByStatus();
      // Áp dụng ánh xạ trạng thái đơn hàng sang tiếng Việt
      const translatedOrderStatus = {};
      Object.keys(orderStatus).forEach(key => {
        translatedOrderStatus[orderStatusMap[key] || key] = orderStatus[key];
      });
      setOrderStatusData(translatedOrderStatus);

      const lowStockData = await fetchLowStockProducts(5);
      setLowStockProducts(lowStockData);

      setLoading(false);
    } catch (err) {
      console.error("🚨 Lỗi fetch dữ liệu:", err);
      setError("Không thể tải dữ liệu từ server. Vui lòng thử lại sau!");
      setLoading(false);
    }
  };

  // Chart options và style
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        usePointStyle: true,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#ddd',
        borderWidth: 1,
        boxPadding: 5,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    elements: {
      line: {
        tension: 0.4, // Đường cong mềm mại
      },
      point: {
        radius: 3,
        hoverRadius: 5,
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  const revenueChartData = {
    labels: stats?.revenueByTime ? Object.keys(stats.revenueByTime) : [],
    datasets: [
      {
        label: "Doanh thu (VND)",
        data: stats?.revenueByTime ? Object.values(stats.revenueByTime) : [],
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        borderWidth: 2,
      },
    ],
  };

  const regionLabels = [];
  const regionData = [];

  if (stats?.usersCountByRegion?.north > 0) {
    regionLabels.push("Miền Bắc");
    regionData.push(stats.usersCountByRegion.north);
  }
  if (stats?.usersCountByRegion?.central > 0) {
    regionLabels.push("Miền Trung");
    regionData.push(stats.usersCountByRegion.central);
  }
  if (stats?.usersCountByRegion?.south > 0) {
    regionLabels.push("Miền Nam");
    regionData.push(stats.usersCountByRegion.south);
  }
  if (stats?.usersCountByRegion?.foreign > 0) {
    regionLabels.push("Nước ngoài");
    regionData.push(stats.usersCountByRegion.foreign);
  }

  const ordersChartData = {
    labels: stats?.ordersByTime ? Object.keys(stats.ordersByTime) : [],
    datasets: [
      {
        label: "Số đơn hàng",
        data: stats?.ordersByTime ? Object.values(stats.ordersByTime) : [],
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: true,
        borderWidth: 2,
      },
    ],
  };

  const orderStatusChartData = {
    labels: Object.keys(orderStatusData),
    datasets: [
      {
        data: Object.values(orderStatusData),
        backgroundColor: [
          "#3B82F6", // Xanh dương
          "#10B981", // Xanh lá
          "#F59E0B", // Cam
          "#8B5CF6", // Tím
          "#EC4899", // Hồng
          "#EF4444", // Đỏ
          "#6B7280", // Xám
        ],
        borderWidth: 0,
        hoverOffset: 5,
      },
    ],
  };

  // Định nghĩa cột cho các bảng
  const orderColumns = [
    { key: 'id', label: 'ID' },
    {
      key: 'totalPrice',
      label: 'Tổng tiền',
      render: (order) =>
        order.totalPrice !== undefined && order.totalPrice !== null
          ? `${Number(order.totalPrice).toLocaleString("vi-VN")} VND`
          : "0 VND"
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (order) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'Đã giao hàng' || order.status === 'Hoàn thành' ? 'bg-green-100 text-green-800' :
          order.status === 'Đang vận chuyển' ? 'bg-blue-100 text-blue-800' :
            order.status === 'Chờ xác nhận' || order.status === 'Đang xử lý' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
          }`}>
          {order.status}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      render: (order) => order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : 'N/A'
    },
  ];

  const productColumns = [
    { key: 'name', label: 'Tên sản phẩm' },
    {
      key: 'soldQuantity',
      label: 'Số lượng bán',
      render: (product) => (
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(100, product.soldQuantity / 10 * 100)}%` }}></div>
          </div>
          <span className="ml-2">{product.soldQuantity || 0}</span>
        </div>
      )
    },
  ];

  const weeklyProductColumns = [
    { key: 'productName', label: 'Tên sản phẩm' },
    {
      key: 'totalSold',
      label: 'Số lượng bán',
      render: (product) => (
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full" style={{ width: `${Math.min(100, product.totalSold / 5 * 100)}%` }}></div>
          </div>
          <span className="ml-2">{product.totalSold || 0}</span>
        </div>
      )
    },
  ];

  const userColumns = [
    { key: 'fullName', label: 'Tên' },
    { key: 'email', label: 'Email' },
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      render: (user) => user.createdAt ? new Date(user.createdAt).toLocaleString("vi-VN") : 'N/A'
    },
  ];

  const lowStockColumns = [
    { key: 'productId', label: 'ID' },
    { key: 'name', label: 'Tên sản phẩm' },
    {
      key: 'stock',
      label: 'Số lượng tồn',
      render: (product) => (
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className={`h-2 rounded-full ${product.stock < 5 ? 'bg-red-500' : 'bg-orange-400'}`}
              style={{ width: `${Math.min(100, product.stock * 10)}%` }}></div>
          </div>
          <span className={`ml-2 ${product.stock < 5 ? 'text-red-500 font-bold' : 'text-orange-500'}`}>
            {product.stock || 0}
          </span>
        </div>
      )
    },
  ];

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang xác thực...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="p-6 bg-gray-50 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Quản Lý</h1>
          <p className="text-gray-500 mt-1">Xem tổng quan về cửa hàng của bạn</p>
        </div>

        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <label className="text-sm text-gray-600">Thời gian:</label>
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(Number(e.target.value))}
            className="bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={7}>7 ngày qua</option>
            <option value={30}>30 ngày qua</option>
            <option value={90}>90 ngày qua</option>
          </select>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="ml-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center shadow-md transition-all"
            onClick={() => fetchDashboardData()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Làm mới
          </motion.button>
        </div>
      </div>

      {error && (
        <motion.div
          className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700">{error}</p>
          </div>
          <button
            className="mt-2 text-red-700 hover:text-red-900 text-sm font-medium"
            onClick={() => fetchDashboardData()}
          >
            Thử lại
          </button>
        </motion.div>
      )}

      {/* Tab navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex flex-wrap space-x-8">
          <button
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "overview" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            onClick={() => setActiveTab("overview")}
          >
            Tổng quan
          </button>
          <button
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "orders" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            onClick={() => setActiveTab("orders")}
          >
            Đơn hàng
          </button>
          <button
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "products" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            onClick={() => setActiveTab("products")}
          >
            Sản phẩm
          </button>
          <button
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "customers" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            onClick={() => setActiveTab("customers")}
          >
            Khách hàng
          </button>
        </nav>
      </div>

      {/* Content containers based on active tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon="🛒"
              title="Tổng đơn hàng"
              value={stats?.totalOrders || 0}
              trend={comparisons.orders}
              color="bg-gradient-to-br from-blue-50 to-white"
            />
            <StatCard
              icon="💰"
              title="Tổng doanh thu"
              value={stats?.totalRevenue ? `${Number(stats.totalRevenue).toLocaleString("vi-VN")} VND` : "0 VND"}
              trend={comparisons.revenue}
              color="bg-gradient-to-br from-green-50 to-white"
            />
            <StatCard
              icon="📈"
              title="Lợi nhuận thực tế"
              value={profit ? `${Number(profit).toLocaleString("vi-VN")} VND` : "0 VND"}
              trend={comparisons.revenue + 2}
              color="bg-gradient-to-br from-pink-50 to-white"
            />
            <StatCard
              icon="📦"
              title="SP bán chạy"
              value={stats?.topSellingProductsCount || 0}
              trend={comparisons.products}
              color="bg-gradient-to-br from-yellow-50 to-white"
            />
            <StatCard
              icon="👥"
              title="Người dùng mới"
              value={stats?.newUsersCount || 0}
              trend={comparisons.users}
              color="bg-gradient-to-br from-purple-50 to-white"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Doanh thu theo thời gian" loading={loading}>
              <Line data={revenueChartData} options={chartOptions} />
            </ChartCard>
            <ChartCard title="Đơn hàng theo thời gian" loading={loading}>
              <Line data={ordersChartData} options={chartOptions} />
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ChartCard title="Phân bố trạng thái đơn hàng" loading={loading}>
              <Pie
                data={orderStatusChartData}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        boxWidth: 12,
                        usePointStyle: true,
                      }
                    },
                  },
                  cutout: '40%',
                }}
              />
            </ChartCard>
            <div className="lg:col-span-2">
              <DataTable
                title="Đơn hàng gần đây"
                data={recentOrders}
                columns={orderColumns}
                loading={loading}
                emptyMessage="Không có đơn hàng nào"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="space-y-6">
          <DataTable
            title="Đơn hàng gần đây"
            data={recentOrders}
            columns={orderColumns}
            loading={loading}
            emptyMessage="Không có đơn hàng nào"
          />

          <ChartCard title="Phân bố trạng thái đơn hàng" loading={loading}>
            <Pie
              data={orderStatusChartData}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 20,
                      boxWidth: 12,
                      usePointStyle: true,
                    }
                  },
                  datalabels: {
                    formatter: (value, ctx) => {
                      let sum = 0;
                      let dataArr = ctx.chart.data.datasets[0].data;
                      dataArr.forEach(data => {
                        sum += data;
                      });
                      let percentage = (value * 100 / sum).toFixed(1) + "%";
                      return percentage;
                    },
                    color: '#fff',
                    font: {
                      weight: 'bold',
                      size: 12
                    }
                  }
                },
              }}
            />
          </ChartCard>

          <ChartCard title="Đơn hàng theo thời gian" loading={loading}>
            <Line data={ordersChartData} options={chartOptions} />
          </ChartCard>
        </div>
      )}

      {activeTab === "products" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DataTable
              title="Sản phẩm bán chạy (Top 5)"
              data={topProducts}
              columns={productColumns}
              loading={loading}
              emptyMessage="Không có dữ liệu sản phẩm"
            />

            <DataTable
              title={`Sản phẩm bán chạy (${periodFilter} ngày qua)`}
              data={topProductsDTO}
              columns={weeklyProductColumns}
              loading={loading}
              emptyMessage="Không có dữ liệu sản phẩm trong khoảng thời gian này"
            />
          </div>

          <DataTable
            title="Sản phẩm tồn kho thấp"
            data={lowStockProducts}
            columns={lowStockColumns}
            loading={loading}
            emptyMessage="Không có sản phẩm tồn kho thấp"
          />

          <ChartCard title="Doanh thu theo thời gian" loading={loading}>
            <Line data={revenueChartData} options={chartOptions} />
          </ChartCard>
        </div>
      )}

      {activeTab === "customers" && (
        <div className="space-y-6">
          <DataTable
            title="Khách hàng mới"
            data={recentUsers}
            columns={userColumns}
            loading={loading}
            emptyMessage="Không có khách hàng mới"
          />

          {/* Biểu đồ khách hàng theo vùng miền */}
          <ChartCard title="Thống kê khách hàng theo khu vực" loading={loading}>
            <Bar
              data={{
                labels: [
                  stats?.usersCountByRegion?.north ? "Miền Bắc" : null,
                  stats?.usersCountByRegion?.central ? "Miền Trung" : null,
                  stats?.usersCountByRegion?.centralHighlands ? "Tây Nguyên" : null,
                  stats?.usersCountByRegion?.south ? "Miền Nam" : null,
                ].filter(Boolean),
                datasets: [
                  {
                    label: "Số lượng khách hàng",
                    data: [
                      stats?.usersCountByRegion?.north || 0,
                      stats?.usersCountByRegion?.central || 0,
                      stats?.usersCountByRegion?.centralHighlands || 0,
                      stats?.usersCountByRegion?.south || 0,
                    ],
                    backgroundColor: [
                      "rgba(59, 130, 246, 0.6)",
                      "rgba(16, 185, 129, 0.6)",
                      "rgba(139, 92, 246, 0.6)",
                      "rgba(245, 158, 11, 0.6)",
                    ],
                    borderWidth: 1
                  }
                ]
              }}
              options={{
                ...chartOptions,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: "Số lượng khách hàng"
                    }
                  }
                }
              }}
            />
          </ChartCard>
        </div>
      )}

      {/* Thông báo khi không có dữ liệu */}
      {!loading && (!stats || (stats && Object.keys(stats).length === 0)) && (
        <motion.div
          className="text-center p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="inline-flex rounded-full bg-blue-50 p-4">
            <div className="rounded-full stroke-blue-600 bg-blue-100 p-4">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
          <h3 className="mt-5 text-lg font-medium text-gray-900">Không có dữ liệu</h3>
          <p className="mt-2 text-gray-500">Không có dữ liệu thống kê cho khoảng thời gian đã chọn.</p>
          <div className="mt-6">
            <button
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => fetchDashboardData()}
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Làm mới dữ liệu
            </button>
          </div>
        </motion.div>
      )}

      {/* Loading overlay */}
      {loading && (
        <motion.div
          className="fixed inset-0 bg-gray-900 bg-opacity-30 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="bg-white p-6 rounded-lg shadow-xl flex items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-3"></div>
            <p className="text-gray-700">Đang tải dữ liệu...</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Dashboard;