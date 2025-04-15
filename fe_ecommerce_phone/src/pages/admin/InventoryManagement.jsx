import React, { useState, useEffect, useCallback } from "react";
import apiInventory from "../../api/apiInventory";
import apiProduct from "../../api/apiProduct";
import { Input } from "../../components/admin/ui/Input";
import { Button } from "../../components/admin/ui/Button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "../../components/admin/ui/Select";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import debounce from "lodash/debounce";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "../../components/admin/ui/Card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import { AlertCircle, Search, Filter, Calendar, PackageOpen, ArrowDown, ArrowUp, RefreshCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/admin/ui/Tabs";
import { Badge } from "../../components/admin/ui/Badge";

const InventoryManagement = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [quantityChange, setQuantityChange] = useState("");
    const [reason, setReason] = useState("");
    const [inventoryData, setInventoryData] = useState([]);
    const [logs, setLogs] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [inventorySummary, setInventorySummary] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [statusFilter, setStatusFilter] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const [adjustQuantity, setAdjustQuantity] = useState("");
    const [adjustReason, setAdjustReason] = useState("");
    const [isAdjusting, setIsAdjusting] = useState(false);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const fetchInventorySummary = async () => {
        try {
            setIsLoading(true);
            const data = await apiInventory.getInventorySummary();
            setInventorySummary(data);
        } catch (error) {
            toast.error("Lỗi khi lấy thống kê tồn kho!");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const today = new Date().toISOString().slice(0, 10);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        setStartDate(sevenDaysAgo);
        setEndDate(today);
        fetchProducts();
        fetchInventoryReport();
        fetchInventorySummary();
    }, [page, statusFilter]);

    useEffect(() => {
        if (searchKeyword === "" && !selectedProduct) {
            fetchInventoryReport();
        }
    }, [searchKeyword, selectedProduct]);

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const data = await apiProduct.getAllProducts("", 0, 200);
            setProducts(data.content || []);
        } catch (error) {
            toast.error("Lỗi khi lấy danh sách sản phẩm!");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchInventoryReport = async () => {
        try {
            setIsLoading(true);
            const statusParam = statusFilter === "" ? null : statusFilter;
            const data = await apiInventory.getInventoryReport(searchKeyword, statusParam, page, 10);
            setInventoryData(data.content || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            toast.error("Lỗi khi lấy báo cáo tồn kho!");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchInventoryLogs = async (productId) => {
        if (!productId) return;
        if (!startDate || !endDate) {
            toast.error("Vui lòng chọn ngày hợp lệ!");
            return;
        }
        setIsLoading(true);
        const formattedStartDate = formatToISODateTime(startDate);
        const formattedEndDate = formatToISODateTime(endDate, true);
        try {
            const data = await apiInventory.getInventoryLogs(productId, formattedStartDate, formattedEndDate, 0, 10);
            setLogs(data.content || []);
            setActiveTab("logs");
        } catch (error) {
            toast.error(error.message || "Lỗi khi lấy lịch sử tồn kho!");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdjustInventory = async () => {
        if (!selectedProduct || !selectedProduct.id) {
            toast.warning("Vui lòng chọn sản phẩm!");
            return;
        }

        if (!adjustQuantity) {
            toast.warning("Vui lòng nhập số lượng!");
            return;
        }

        if (!adjustReason) {
            toast.warning("Vui lòng nhập lý do điều chỉnh!");
            return;
        }

        try {
            setIsAdjusting(true);
            await apiInventory.adjustInventory(selectedProduct.id, adjustQuantity, adjustReason);
            toast.success("Điều chỉnh tồn kho thành công!");
            setAdjustQuantity("");
            setAdjustReason("");
            // Refresh data
            fetchInventoryReport();
            fetchInventoryLogs(selectedProduct.id);
        } catch (error) {
            toast.error(error.message || "Lỗi khi điều chỉnh tồn kho!");
        } finally {
            setIsAdjusting(false);
        }
    };

    const handleSearchChange = useCallback(
        debounce((keyword) => {
            setSearchKeyword(keyword);
            setPage(0);
            if (keyword) {
                const filtered = products.filter((p) =>
                    p.name?.toLowerCase().includes(keyword.toLowerCase()) ||
                    p.productId?.toString().includes(keyword)
                );
                setFilteredProducts(filtered);
            } else {
                setFilteredProducts([]);
                fetchInventoryReport();
            }
        }, 300),
        [products]
    );

    const handleSelectProduct = async (product) => {
        const productId = product.id || product.productId;
        const productName = product.name || product.productName;

        if (!productId) {
            toast.warning("Sản phẩm không hợp lệ!");
            return;
        }

        // Tạo object thống nhất
        const normalizedProduct = {
            id: productId,
            name: productName,
            categoryName: product.categoryName,
            quantity: product.quantity,
            minQuantity: product.minQuantity || 5,
        };

        setSelectedProduct(normalizedProduct);
        setSearchKeyword(productName);
        setFilteredProducts([]);

        try {
            setIsLoading(true);
            const formattedStartDate = formatToISODateTime(startDate);
            const formattedEndDate = formatToISODateTime(endDate, true);

            const data = await apiInventory.getInventoryLogs(productId, formattedStartDate, formattedEndDate, 0, 10);
            setLogs(data.content || []);
            setActiveTab("logs");
            toast.success(`Đã chọn sản phẩm "${productName}"`);
        } catch (error) {
            toast.error(error.message || "Không lấy được lịch sử điều chỉnh!");
        } finally {
            setIsLoading(false);
        }
    };

    const formatToISODateTime = (dateStr, endOfDay = false) => {
        if (!dateStr) return null;
        return endOfDay ? `${dateStr}T23:59:59` : `${dateStr}T00:00:00`;
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setPage(newPage);
        }
    };

    const refreshData = () => {
        fetchInventoryReport();
        fetchInventorySummary();
        if (selectedProduct) {
            fetchInventoryLogs(selectedProduct.id || selectedProduct.productId);
        }
        toast.info("Đã làm mới dữ liệu!");
    };

    const getStatusBadge = (quantity, minQuantity = 5) => {
        if (quantity === 0) {
            return <Badge variant="destructive">Hết hàng</Badge>;
        } else if (quantity < minQuantity) {
            return <Badge variant="warning" className="bg-yellow-500">Sắp hết</Badge>;
        } else {
            return <Badge variant="outline" className="bg-green-100 text-green-800">Còn hàng</Badge>;
        }
    };

    const renderInventorySummaryChart = () => {
        if (!inventorySummary) return null;

        const data = [
            { name: 'Còn hàng', value: inventorySummary.inStock },
            { name: 'Sắp hết', value: inventorySummary.lowStock },
            { name: 'Hết hàng', value: inventorySummary.outOfStock }
        ];

        return (
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} sản phẩm`, '']} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        );
    };

    const renderLogChart = () => {
        if (!logs || logs.length === 0) return null;

        // Process log data for chart
        const chartData = logs.map(log => ({
            time: new Date(log.timestamp).toLocaleDateString(),
            quantity: log.newQuantity,
            change: log.newQuantity - log.oldQuantity
        })).reverse(); // Show oldest first

        return (
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip
                        formatter={(value, name) => [
                            value,
                            name === 'quantity' ? 'Số lượng' : 'Thay đổi'
                        ]}
                    />
                    <Bar dataKey="quantity" fill="#4f46e5" name="Số lượng" />
                    <Bar dataKey="change" fill="#10b981" name="Thay đổi" />
                </BarChart>
            </ResponsiveContainer>
        );
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Quản lý Tồn kho</h1>
                <Button onClick={refreshData} variant="outline" className="flex items-center gap-2">
                    <RefreshCcw size={16} />
                    Làm mới
                </Button>
            </div>

            {inventorySummary && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-blue-50 border-blue-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg text-blue-700 flex items-center gap-2">
                                <PackageOpen size={20} />
                                Tổng sản phẩm
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-blue-700">{inventorySummary.totalProducts}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg text-green-700 flex items-center gap-2">
                                <ArrowUp size={20} />
                                Còn hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-green-700">{inventorySummary.inStock}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-yellow-50 border-yellow-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg text-yellow-700 flex items-center gap-2">
                                <AlertCircle size={20} />
                                Sắp hết hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-yellow-600">{inventorySummary.lowStock}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-50 border-red-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg text-red-700 flex items-center gap-2">
                                <ArrowDown size={20} />
                                Hết hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-red-600">{inventorySummary.outOfStock}</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                    <TabsTrigger value="products">Danh sách sản phẩm</TabsTrigger>
                    <TabsTrigger value="logs" disabled={!selectedProduct}>
                        {selectedProduct ? "Lịch sử điều chỉnh" : "Chọn sản phẩm trước"}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    {renderInventorySummaryChart()}

                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin tồn kho</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">
                                Hệ thống quản lý tồn kho giúp bạn theo dõi số lượng sản phẩm, lịch sử điều chỉnh
                                và cảnh báo khi sản phẩm sắp hết hàng.
                            </p>
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="font-medium">Sản phẩm cần nhập thêm:</h3>
                                    <ul className="mt-2 space-y-1">
                                        {inventoryData
                                            .filter(item => item.quantity < (item.minQuantity || 5))
                                            .slice(0, 5)
                                            .map(item => (
                                                <li key={item.productId} className="text-sm flex justify-between">
                                                    <span>{item.productName}</span>
                                                    <span className="text-red-500 font-medium">{item.quantity} trong kho</span>
                                                </li>
                                            ))
                                        }
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="font-medium">Phân tích tồn kho:</h3>
                                    <ul className="mt-2 space-y-1 text-sm">
                                        <li className="flex justify-between">
                                            <span>% Sản phẩm còn hàng:</span>
                                            <span className="text-green-500 font-medium">
                                                {inventorySummary ?
                                                    ((inventorySummary.inStock / inventorySummary.totalProducts) * 100).toFixed(1) + '%'
                                                    : '0%'}
                                            </span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>% Sản phẩm sắp hết:</span>
                                            <span className="text-yellow-500 font-medium">
                                                {inventorySummary ?
                                                    ((inventorySummary.lowStock / inventorySummary.totalProducts) * 100).toFixed(1) + '%'
                                                    : '0%'}
                                            </span>
                                        </li>
                                        <li className="flex justify-between">
                                            <span>% Sản phẩm hết hàng:</span>
                                            <span className="text-red-500 font-medium">
                                                {inventorySummary ?
                                                    ((inventorySummary.outOfStock / inventorySummary.totalProducts) * 100).toFixed(1) + '%'
                                                    : '0%'}
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="products">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                <span>Danh sách sản phẩm</span>
                                <div className="text-sm font-normal">
                                    {selectedProduct && (
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="bg-blue-100 text-blue-800 px-3 py-1">
                                                {selectedProduct.name || selectedProduct.productName}
                                            </Badge>
                                            <button
                                                onClick={() => {
                                                    setSelectedProduct(null);
                                                    setSearchKeyword("");
                                                    setFilteredProducts([]);
                                                    setPage(0);
                                                }}
                                                className="text-red-500 hover:text-red-700 text-lg font-bold"
                                                title="Xoá lựa chọn"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="relative flex-1">
                                        <Input
                                            type="text"
                                            placeholder="Tìm kiếm sản phẩm..."
                                            value={searchKeyword}
                                            onChange={(e) => {
                                                setSearchKeyword(e.target.value);
                                                handleSearchChange(e.target.value);
                                            }}
                                            className="pr-10 h-10" // tăng padding bên phải
                                        />
                                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        {/* {searchKeyword && (
                                            <button
                                                onClick={() => {
                                                    setSearchKeyword("");
                                                    setSelectedProduct(null);
                                                    setFilteredProducts([]);
                                                    fetchInventoryReport();
                                                }}
                                                className="absolute right-7 top-1.5 text-red-500 hover:text-red-700"
                                                title="Xoá tìm kiếm"
                                            >
                                                ✕
                                            </button>
                                        )} */}
                                    </div>
                                    <div className="w-full md:w-64 flex items-center gap-2">
                                        <Filter size={16} className="text-gray-500" />
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Lọc theo trạng thái" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">Tất cả</SelectItem>
                                                <SelectItem value="IN_STOCK">Còn hàng</SelectItem>
                                                <SelectItem value="LOW_STOCK">Sắp hết hàng</SelectItem>
                                                <SelectItem value="OUT_OF_STOCK">Hết hàng</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {filteredProducts.length > 0 && (
                                    <div className="bg-gray-50 p-3 rounded-md">
                                        <div className="text-sm font-medium mb-2">Kết quả tìm kiếm:</div>
                                        <ul className="divide-y">
                                            {filteredProducts.map(product => (
                                                <li
                                                    key={product.id}
                                                    className="py-2 px-1 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                                                >
                                                    <span>{product.name}</span>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleSelectProduct(product)}
                                                        title="Xem chi tiết & lịch sử điều chỉnh"
                                                    >
                                                        Chọn
                                                    </Button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="overflow-x-auto border rounded-md">
                                    <table className="w-full border-collapse table-auto">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="p-2 text-left">ID</th>
                                                <th className="p-2 text-left">Tên sản phẩm</th>
                                                <th className="p-2 text-left">Danh mục</th>
                                                <th className="p-2 text-left">Số lượng</th>
                                                <th className="p-2 text-left">Trạng thái</th>
                                                <th className="p-2 text-left">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {isLoading ? (
                                                <tr>
                                                    <td colSpan={6} className="text-center p-4">
                                                        Đang tải dữ liệu...
                                                    </td>
                                                </tr>
                                            ) : inventoryData.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="text-center p-4">
                                                        Không có dữ liệu
                                                    </td>
                                                </tr>
                                            ) : (
                                                inventoryData.map((item) => (
                                                    <tr
                                                        key={item.productId}
                                                        className={`border-b hover:bg-gray-50 ${selectedProduct?.id === item.productId || selectedProduct?.productId === item.productId
                                                            ? "bg-blue-50"
                                                            : ""
                                                            }`}
                                                    >
                                                        <td className="p-2">{item.productId}</td>
                                                        <td className="p-2 font-medium">{item.productName || "Không xác định"}</td>
                                                        <td className="p-2">{item.categoryName || "Chưa có"}</td>
                                                        <td className={`p-2 font-medium ${item.quantity === 0
                                                            ? "text-red-500"
                                                            : item.quantity < (item.minQuantity || 5)
                                                                ? "text-yellow-500"
                                                                : "text-green-600"
                                                            }`}>
                                                            {item.quantity}
                                                        </td>
                                                        <td className="p-2">
                                                            {getStatusBadge(item.quantity, item.minQuantity)}
                                                        </td>
                                                        <td className="p-2">
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleSelectProduct(item)}
                                                                >
                                                                    Chọn
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex justify-between items-center mt-4">
                                    <Button
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page === 0 || isLoading}
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-1"
                                    >
                                        <ChevronLeft size={16} /> Trang trước
                                    </Button>
                                    <span className="text-sm text-gray-600">
                                        Trang {page + 1} / {totalPages}
                                    </span>
                                    <Button
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page + 1 >= totalPages || isLoading}
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-1"
                                    >
                                        Trang sau <ChevronRight size={16} />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="logs">
                    {selectedProduct && (
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex justify-between items-center">
                                        <span>Thông tin sản phẩm</span>
                                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                            ID: {selectedProduct.id || selectedProduct.productId}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="font-semibold text-lg">
                                                {selectedProduct.name || selectedProduct.productName}
                                            </h3>
                                            <p className="text-gray-600">
                                                Danh mục: {selectedProduct.categoryName || "Chưa phân loại"}
                                            </p>
                                            <p className="text-gray-600">
                                                Số lượng hiện tại: <span className="font-medium">{selectedProduct.quantity}</span>
                                            </p>
                                            <div className="text-gray-600">
                                                Trạng thái: {getStatusBadge(selectedProduct.quantity, selectedProduct.minQuantity)}
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-md">
                                            <h3 className="font-medium mb-2">Điều chỉnh tồn kho</h3>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-sm text-gray-600 block mb-1">
                                                        Thay đổi số lượng
                                                    </label>
                                                    <Input
                                                        type="number"
                                                        value={adjustQuantity}
                                                        onChange={(e) => setAdjustQuantity(e.target.value)}
                                                        placeholder="Nhập số lượng (+ hoặc -)"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Nhập số dương để thêm, âm để giảm
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="text-sm text-gray-600 block mb-1">
                                                        Lý do điều chỉnh
                                                    </label>
                                                    <Input
                                                        value={adjustReason}
                                                        onChange={(e) => setAdjustReason(e.target.value)}
                                                        placeholder="Nhập lý do điều chỉnh"
                                                    />
                                                </div>
                                                <Button
                                                    onClick={handleAdjustInventory}
                                                    disabled={isAdjusting || !adjustQuantity || !adjustReason}
                                                    className="w-full"
                                                >
                                                    {isAdjusting ? "Đang xử lý..." : "Cập nhật tồn kho"}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        Lịch sử điều chỉnh tồn kho
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                                            <div className="w-full sm:w-auto">
                                                <label className="text-sm text-gray-600 block mb-1">
                                                    Từ ngày
                                                </label>
                                                <div className="flex items-center">
                                                    <Calendar size={16} className="text-gray-400 mr-2" />
                                                    <Input
                                                        type="date"
                                                        value={startDate}
                                                        onChange={(e) => setStartDate(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="w-full sm:w-auto">
                                                <label className="text-sm text-gray-600 block mb-1">
                                                    Đến ngày
                                                </label>
                                                <div className="flex items-center">
                                                    <Calendar size={16} className="text-gray-400 mr-2" />
                                                    <Input
                                                        type="date"
                                                        value={endDate}
                                                        onChange={(e) => setEndDate(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => fetchInventoryLogs(selectedProduct.id || selectedProduct.productId)}
                                                variant="outline"
                                                className="flex items-center gap-2"
                                            >
                                                <Search size={16} />
                                                Xem lịch sử
                                            </Button>
                                        </div>

                                        {renderLogChart()}

                                        <div className="overflow-x-auto border rounded-md mt-4">
                                            <table className="w-full border-collapse table-auto">
                                                <thead>
                                                    <tr className="bg-gray-100">
                                                        <th className="p-2 text-left">Thời gian</th>
                                                        <th className="p-2 text-left">Số lượng cũ</th>
                                                        <th className="p-2 text-left">Số lượng mới</th>
                                                        <th className="p-2 text-left">Thay đổi</th>
                                                        <th className="p-2 text-left">Lý do</th>
                                                        <th className="p-2 text-left">Người thực hiện</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {isLoading ? (
                                                        <tr>
                                                            <td colSpan={6} className="text-center p-4">
                                                                Đang tải dữ liệu...
                                                            </td>
                                                        </tr>
                                                    ) : logs.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={6} className="text-center p-4">
                                                                Không có lịch sử điều chỉnh trong khoảng thời gian này
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        logs.map((log, index) => (
                                                            <tr key={index} className="border-b hover:bg-gray-50">
                                                                <td className="p-2">
                                                                    {new Date(log.timestamp).toLocaleString('vi-VN')}
                                                                </td>
                                                                <td className="p-2 font-medium">{log.oldQuantity}</td>
                                                                <td className="p-2 font-medium">{log.newQuantity}</td>
                                                                <td className={`p-2 font-medium ${log.newQuantity > log.oldQuantity
                                                                    ? "text-green-600"
                                                                    : log.newQuantity < log.oldQuantity
                                                                        ? "text-red-500"
                                                                        : ""
                                                                    }`}>
                                                                    {log.newQuantity - log.oldQuantity > 0 ? "+" : ""}
                                                                    {log.newQuantity - log.oldQuantity}
                                                                </td>
                                                                <td className="p-2">{log.reason || "Không có lý do"}</td>
                                                                <td className="p-2">{log.createdBy || "Hệ thống"}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default InventoryManagement;
