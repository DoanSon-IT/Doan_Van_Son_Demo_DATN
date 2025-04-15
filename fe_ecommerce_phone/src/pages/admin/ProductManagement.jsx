import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import apiProduct from "../../api/apiProduct";
import apiCategory from "../../api/apiCategory";
import apiInventory from "../../api/apiInventory";
import apiSupplier from "../../api/apiSupplier";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/admin/ui/Card";
import { Input } from "../../components/admin/ui/Input";
import { Label } from "../../components/admin/ui/Label";
import { Textarea } from "../../components/admin/ui/Textarea";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "../../components/admin/ui/Select";
import { Button } from "../../components/admin/ui/Button";
import AppContext from "../../context/AppContext";
import debounce from "lodash/debounce";
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 10;

function ProductManagement() {
    const { auth, authLoading } = useContext(AppContext);
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [filters, setFilters] = useState({
        searchKeyword: "",
        minPrice: "",
        maxPrice: "",
        sortBy: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [showDiscountAllForm, setShowDiscountAllForm] = useState(false);
    const [showDiscountSelectedForm, setShowDiscountSelectedForm] = useState(false);
    const [productData, setProductData] = useState({
        name: "",
        description: "",
        costPrice: "",
        sellingPrice: "",
        discountedPrice: "",
        discountStartDate: null,
        discountEndDate: null,
        stock: "",
        soldQuantity: 0,
        isFeatured: false,
        categoryId: "",
        supplierId: "",
        images: [],
    });

    useEffect(() => {
        const fetchProductWhenEditing = async () => {
            if (editingProduct) {
                try {
                    const fullProduct = await apiProduct.getProductById(editingProduct);
                    setProductData({
                        name: fullProduct.name || "",
                        description: fullProduct.description || "",
                        costPrice: fullProduct.costPrice || "",
                        sellingPrice: fullProduct.sellingPrice || "",
                        discountedPrice: fullProduct.discountedPrice || "",
                        discountStartDate: fullProduct.discountStartDate ? new Date(fullProduct.discountStartDate) : null,
                        discountEndDate: fullProduct.discountEndDate ? new Date(fullProduct.discountEndDate) : null,
                        stock: fullProduct.stock || 0,
                        soldQuantity: fullProduct.soldQuantity || 0,
                        isFeatured: fullProduct.isFeatured || false,
                        categoryId: fullProduct.category?.id?.toString() || "",
                        supplierId: fullProduct.supplier?.id?.toString() || "",
                        images: [] // Chỉ dùng preview, không đẩy ảnh cũ lên lại
                    });

                    setImagePreviews(fullProduct.images.map(img => img.imageUrl));
                } catch (error) {
                    console.error("❌ Lỗi khi lấy chi tiết sản phẩm để sửa:", error);
                }
            }
        };

        fetchProductWhenEditing();
    }, [editingProduct]);

    const [discountAllData, setDiscountAllData] = useState({
        percentage: "",
        startDateTime: null,
        endDateTime: null,
    });
    const [discountSelectedData, setDiscountSelectedData] = useState({
        selectedProductIds: [],
        percentage: "",
        startDateTime: null,
        endDateTime: null,
    });
    const [imagePreviews, setImagePreviews] = useState([]);
    const nameInputRef = useRef(null);

    if (authLoading) {
        return <div className="text-center mt-10 text-gray-500">🔐 Đang xác thực quyền truy cập...</div>;
    }

    if (!auth || !auth.roles?.includes("ADMIN")) {
        return (
            <div className="text-center mt-10 text-red-500 font-semibold">
                🚫 Bạn không có quyền truy cập trang này.
            </div>
        );
    }

    useEffect(() => {
        const initializeData = async () => {
            setIsLoading(true);
            try {
                await Promise.all([fetchProducts(), fetchCategories(), fetchSuppliers()]);
            } catch (error) {
                console.error("Lỗi khi khởi tạo dữ liệu:", error);
                toast.error("Lỗi khi tải dữ liệu, vui lòng thử lại!");
            } finally {
                setIsLoading(false);
            }
        };
        initializeData();
    }, [page, filters]);

    useEffect(() => {
        if (showForm && nameInputRef.current) {
            nameInputRef.current.focus();
        }
    }, [showForm]);

    const debouncedFetchProducts = useCallback(debounce(() => fetchProducts(), 500), []);

    const fetchProducts = async () => {
        try {
            const cleanFilters = {
                ...filters,
                minPrice: filters.minPrice === "" ? null : Number(filters.minPrice),
                maxPrice: filters.maxPrice === "" ? null : Number(filters.maxPrice),
                page,
                size: ITEMS_PER_PAGE,
            };

            const res = await apiProduct.getFilteredProducts(cleanFilters);
            setProducts(res.content);
            setTotalPages(res.totalPages);
        } catch (error) {
            console.error("❌ Lỗi khi tải sản phẩm:", error);
            toast.error("Không thể tải danh sách sản phẩm!");
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await apiCategory.getAllCategories();
            setCategories(res);
        } catch (error) {
            console.error("Lỗi khi tải danh mục:", error);
            toast.error("Không thể tải danh mục!");
        }
    };

    const fetchSuppliers = async () => {
        try {
            const res = await apiSupplier.getSuppliers();
            setSuppliers(res);
        } catch (error) {
            console.error("Lỗi khi tải nhà cung cấp:", error);
            toast.error("Không thể tải nhà cung cấp!");
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
        try {
            await apiProduct.deleteProduct(id);
            toast.success("Sản phẩm đã được xóa!");
            fetchProducts();
        } catch (error) {
            toast.error(error.message || "Lỗi khi xóa sản phẩm!");
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product.id);
        setProductData({
            name: product.name || "",
            description: product.description || "",
            costPrice: product.costPrice !== null ? String(product.costPrice) : "",
            sellingPrice: product.sellingPrice !== null ? String(product.sellingPrice) : "",
            discountedPrice: product.discountedPrice !== null ? String(product.discountedPrice) : "",
            discountStartDate: product.discountStartDate ? new Date(product.discountStartDate) : null,
            discountEndDate: product.discountEndDate ? new Date(product.discountEndDate) : null,
            stock: product.stock !== null ? String(product.stock) : "",
            soldQuantity: product.soldQuantity || 0,
            isFeatured: product.isFeatured ?? false,
            categoryId: product.category && product.category.id ? String(product.category.id) : "",
            supplierId: product.supplier && product.supplier.id ? String(product.supplier.id) : "",
            images: Array.isArray(product.images) ? product.images : [],
        });
        setImagePreviews(
            Array.isArray(product.images) ? product.images.map((img) => img.imageUrl || "") : []
        );
        setShowForm(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData((prev) => ({
            ...prev,
            [name]:
                value === "" && ["costPrice", "sellingPrice", "discountedPrice", "stock"].includes(name)
                    ? ""
                    : value,
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);

        setProductData((prev) => ({
            ...prev,
            images: [...(prev.images || []), ...files], 
        }));

        setImagePreviews((prev) => [
            ...prev,
            ...files.map((file) => URL.createObjectURL(file)),
        ]);
    };


    const handleRemoveImage = (index) => {
        setProductData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        const isNumeric = ["minPrice", "maxPrice"].includes(name);
        setFilters((prev) => ({
            ...prev,
            [name]: isNumeric && value === "" ? "" : value,
        }));
        setPage(0);
    };

    const formatDateTimeForBackend = (date) => {
        if (!date) return null;
        const d = new Date(date);
        const pad = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
            d.getMinutes()
        )}:${pad(d.getSeconds())}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate cơ bản
        if (!productData.name || !productData.costPrice || !productData.sellingPrice) {
            toast.error("Vui lòng nhập đầy đủ tên và giá sản phẩm!");
            return;
        }

        if (isNaN(productData.categoryId) || isNaN(productData.supplierId)) {
            toast.error("Danh mục hoặc nhà cung cấp không hợp lệ!");
            return;
        }

        if (Number(productData.costPrice) <= 0 || Number(productData.sellingPrice) <= 0) {
            toast.error("Giá nhập và giá bán phải lớn hơn 0!");
            return;
        }

        if (!productData.categoryId || !productData.supplierId) {
            toast.error("Vui lòng chọn danh mục và nhà cung cấp!");
            return;
        }

        setIsLoading(true);

        try {
            // Gói payload không có ảnh (ảnh upload sau)
            const productPayload = {
                name: productData.name,
                description: productData.description,
                costPrice: Number(productData.costPrice),
                sellingPrice: Number(productData.sellingPrice),
                discountedPrice: productData.discountedPrice
                    ? Number(productData.discountedPrice)
                    : null,
                discountStartDate: formatDateTimeForBackend(productData.discountStartDate),
                discountEndDate: formatDateTimeForBackend(productData.discountEndDate),
                stock: Number(productData.stock),
                soldQuantity: productData.soldQuantity !== "" ? Number(productData.soldQuantity) : 0,
                isFeatured: productData.isFeatured ?? false,
                category: { id: Number(productData.categoryId) },
                supplier: { id: Number(productData.supplierId) },
                images: [] // Không gửi ảnh trong giai đoạn này
            };

            console.log("🚀 Payload gửi lên:", productPayload);

            let response;

            if (editingProduct) {
                response = await apiProduct.updateProduct(editingProduct, productPayload);
                toast.success("Sản phẩm đã được cập nhật!");
            } else {
                response = await apiProduct.createProduct(productPayload);
                toast.success("Sản phẩm đã được thêm!");
            }

            // ✅ Upload ảnh nếu có & hợp lệ (sau khi đã có product ID)
            if (response?.id && Array.isArray(productData.images)) {
                const validFiles = productData.images.filter(
                    (file) => file instanceof File && file.type.startsWith("image/")
                );

                if (validFiles.length > 0) {
                    try {
                        await apiProduct.uploadProductImage(response.id, validFiles);
                    } catch (uploadErr) {
                        console.error("❌ Upload nhiều ảnh thất bại:", uploadErr);
                        toast.error(`Lỗi upload ảnh: ${uploadErr.message}`);
                    }
                }
            }

            // Reset form sau khi thành công
            setEditingProduct(null);
            setShowForm(false);
            setProductData({
                name: "",
                description: "",
                costPrice: "",
                sellingPrice: "",
                discountedPrice: "",
                discountStartDate: null,
                discountEndDate: null,
                stock: "",
                soldQuantity: 0,
                isFeatured: false,
                categoryId: "",
                supplierId: "",
                images: [],
            });
            setImagePreviews([]);
            fetchProducts();
        } catch (error) {
            console.error("🛑 Lỗi khi lưu sản phẩm:", {
                message: error.message,
                response: error.response?.data,
            });
            toast.error(error.response?.data?.message || error.message || "Lỗi không xác định khi lưu sản phẩm");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDiscountAllSubmit = async (e) => {
        e.preventDefault();
        if (!discountAllData.percentage || !discountAllData.startDateTime || !discountAllData.endDateTime) {
            toast.error("Vui lòng nhập đầy đủ thông tin giảm giá!");
            return;
        }
        try {
            await apiProduct.applyDiscountToAll({
                percentage: Number(discountAllData.percentage),
                fixedAmount: null,
                startDateTime: formatDateTimeForBackend(discountAllData.startDateTime),
                endDateTime: formatDateTimeForBackend(discountAllData.endDateTime),
            });
            toast.success("Đã áp dụng giảm giá cho tất cả sản phẩm!");
            setShowDiscountAllForm(false);
            fetchProducts();
        } catch (error) {
            toast.error(error.response?.data || "Lỗi khi áp dụng giảm giá!");
        }
    };

    const handleDiscountSelectedSubmit = async (e) => {
        e.preventDefault();
        if (
            discountSelectedData.selectedProductIds.length === 0 ||
            !discountSelectedData.percentage ||
            !discountSelectedData.startDateTime ||
            !discountSelectedData.endDateTime
        ) {
            toast.error("Vui lòng chọn sản phẩm và nhập đầy đủ thông tin giảm giá!");
            return;
        }
        try {
            await apiProduct.applyDiscountToSelected({
                productIds: discountSelectedData.selectedProductIds,
                percentage: Number(discountSelectedData.percentage),
                fixedAmount: null,
                startDateTime: formatDateTimeForBackend(discountSelectedData.startDateTime),
                endDateTime: formatDateTimeForBackend(discountSelectedData.endDateTime),
            });
            toast.success("Đã áp dụng giảm giá cho các sản phẩm được chọn!");
            setShowDiscountSelectedForm(false);
            fetchProducts();
        } catch (error) {
            toast.error(error.response?.data || "Lỗi khi áp dụng giảm giá!");
        }
    };

    const handleSelectProduct = (id) => {
        setDiscountSelectedData((prev) => {
            const selectedIds = prev.selectedProductIds.includes(id)
                ? prev.selectedProductIds.filter((pid) => pid !== id)
                : [...prev.selectedProductIds, id];
            return { ...prev, selectedProductIds: selectedIds };
        });
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingProduct(null);
        setProductData({
            name: "",
            description: "",
            costPrice: "",
            sellingPrice: "",
            discountedPrice: "",
            discountStartDate: null,
            discountEndDate: null,
            stock: "",
            soldQuantity: 0,
            isFeatured: false,
            categoryId: "",
            supplierId: "",
            images: [],
        });
        setImagePreviews([]);
    };

    const handleManageInventory = () => {
        navigate("/admin/inventory");
    };

    const getCurrentPrice = (product) => {
        const now = new Date();
        if (
            product.discountedPrice &&
            product.discountStartDate &&
            product.discountEndDate &&
            now >= new Date(product.discountStartDate) &&
            now <= new Date(product.discountEndDate)
        ) {
            return product.discountedPrice;
        }
        return product.sellingPrice;
    };

    return (
        <div className="max-w-screen-xl mx-auto p-6 bg-white shadow rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">
                    Quản lý Sản phẩm{" "}
                    <span className="bg-black text-white text-sm px-2 py-1 rounded-full">{products.length}</span>
                </h2>
                <div className="space-x-2">
                    <Button onClick={() => setShowDiscountAllForm(true)}>Áp dụng giảm giá tất cả</Button>
                    <Button onClick={() => setShowDiscountSelectedForm(true)}>Giảm giá sản phẩm chọn</Button>
                    <Button onClick={handleManageInventory}>Quản lý tồn kho</Button>
                    <Button onClick={() => setShowForm(!showForm)}>
                        {showForm ? "Quay lại danh sách" : "➕ Thêm sản phẩm mới"}
                    </Button>
                </div>
            </div>

            {showForm ? (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="w-full max-w-2xl mx-auto">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">
                                {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={handleSubmit}
                                className="space-y-4"
                                onKeyPress={(e) => e.key === "Enter" && handleSubmit(e)}
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="name">Tên sản phẩm</Label>
                                    <input
                                        ref={nameInputRef}
                                        name="name"
                                        value={productData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Mô tả sản phẩm</Label>
                                    <Textarea
                                        name="description"
                                        value={productData.description}
                                        onChange={handleChange}
                                        className="h-32"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="costPrice">Giá nhập (VNĐ)</Label>
                                        <Input
                                            name="costPrice"
                                            type="number"
                                            value={productData.costPrice}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="sellingPrice">Giá bán (VNĐ)</Label>
                                        <Input
                                            name="sellingPrice"
                                            type="number"
                                            value={productData.sellingPrice}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="discountedPrice">Giá giảm (VNĐ)</Label>
                                    <Input
                                        name="discountedPrice"
                                        type="number"
                                        value={productData.discountedPrice}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="discountStartDate">Ngày giờ bắt đầu giảm giá</Label>
                                        <DatePicker
                                            selected={productData.discountStartDate}
                                            onChange={(date) => setProductData((prev) => ({ ...prev, discountStartDate: date }))}
                                            dateFormat="dd/MM/yyyy HH:mm"
                                            timeFormat="HH:mm"
                                            showTimeSelect
                                            placeholderText="Chọn ngày giờ (dd/mm/yyyy hh:mm)"
                                            className="w-full p-2 border rounded"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="discountEndDate">Ngày giờ kết thúc giảm giá</Label>
                                        <DatePicker
                                            selected={productData.discountEndDate}
                                            onChange={(date) => setProductData((prev) => ({ ...prev, discountEndDate: date }))}
                                            dateFormat="dd/MM/yyyy HH:mm"
                                            timeFormat="HH:mm"
                                            showTimeSelect
                                            placeholderText="Chọn ngày giờ (dd/mm/yyyy hh:mm)"
                                            className="w-full p-2 border rounded"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="stock">Tồn kho</Label>
                                    <Input
                                        name="stock"
                                        type="number"
                                        value={productData.stock}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="isFeatured">Nổi bật</Label>
                                    <input
                                        type="checkbox"
                                        name="isFeatured"
                                        checked={productData.isFeatured ?? false}
                                        onChange={(e) =>
                                            setProductData((prev) => ({ ...prev, isFeatured: e.target.checked }))
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Danh mục</Label>
                                    <Select
                                        onValueChange={(value) => setProductData((prev) => ({ ...prev, categoryId: value }))}
                                        value={productData.categoryId ? String(productData.categoryId) : ""}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn danh mục" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={String(category.id)}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="supplier">Nhà cung cấp</Label>
                                    <Select
                                        onValueChange={(value) => setProductData((prev) => ({ ...prev, supplierId: value }))}
                                        value={productData.supplierId ? String(productData.supplierId) : ""}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn nhà cung cấp" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {suppliers.map((supplier) => (
                                                <SelectItem key={supplier.id} value={String(supplier.id)}>
                                                    {supplier.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="image">Ảnh sản phẩm</Label>
                                    <Input type="file" accept="image/*" multiple onChange={handleFileChange} />
                                    {imagePreviews.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {imagePreviews.map((preview, index) => (
                                                <div key={index} className="relative">
                                                    <img src={preview} alt="Preview" className="w-24 h-24 object-cover" />
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="absolute725 top-0 right-0"
                                                        onClick={() => handleRemoveImage(index)}
                                                    >
                                                        X
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? "Đang xử lý..." : "Lưu sản phẩm"}
                                    </Button>
                                    <Button type="button" variant="outline" className="w-full" onClick={handleCancel}>
                                        Hủy
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>
            ) : showDiscountAllForm ? (
                <Card className="w-full max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Áp dụng giảm giá tất cả sản phẩm</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleDiscountAllSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="percentage">Phần trăm giảm giá (%)</Label>
                                <Input
                                    type="number"
                                    name="percentage"
                                    value={discountAllData.percentage}
                                    onChange={(e) =>
                                        setDiscountAllData((prev) => ({ ...prev, percentage: e.target.value }))
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="startDateTime">Ngày giờ bắt đầu</Label>
                                <DatePicker
                                    selected={discountAllData.startDateTime}
                                    onChange={(date) => setDiscountAllData((prev) => ({ ...prev, startDateTime: date }))}
                                    dateFormat="dd/MM/yyyy HH:mm"
                                    timeFormat="HH:mm"
                                    showTimeSelect
                                    placeholderText="Chọn ngày giờ (dd/mm/yyyy hh:mm)"
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDateTime">Ngày giờ kết thúc</Label>
                                <DatePicker
                                    selected={discountAllData.endDateTime}
                                    onChange={(date) => setDiscountAllData((prev) => ({ ...prev, endDateTime: date }))}
                                    dateFormat="dd/MM/yyyy HH:mm"
                                    timeFormat="HH:mm"
                                    showTimeSelect
                                    placeholderText="Chọn ngày giờ (dd/mm/yyyy hh:mm)"
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? "Đang xử lý..." : "Áp dụng"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setShowDiscountAllForm(false)}
                                >
                                    Hủy
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            ) : showDiscountSelectedForm ? (
                <Card className="w-full max-w-3xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Áp dụng giảm giá cho sản phẩm được chọn</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleDiscountSelectedSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Chọn sản phẩm</Label>
                                <div className="max-h-40 overflow-y-auto border p-2 rounded">
                                    {products.map((product) => (
                                        <div key={product.id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={discountSelectedData.selectedProductIds.includes(product.id)}
                                                onChange={() => handleSelectProduct(product.id)}
                                            />
                                            <span>{product.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="percentage">Phần trăm giảm giá (%)</Label>
                                <Input
                                    type="number"
                                    name="percentage"
                                    value={discountSelectedData.percentage}
                                    onChange={(e) =>
                                        setDiscountSelectedData((prev) => ({ ...prev, percentage: e.target.value }))
                                    }
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDateTime">Ngày giờ bắt đầu</Label>
                                    <DatePicker
                                        selected={discountSelectedData.startDateTime}
                                        onChange={(date) =>
                                            setDiscountSelectedData((prev) => ({ ...prev, startDateTime: date }))
                                        }
                                        dateFormat="dd/MM/yyyy HH:mm"
                                        timeFormat="HH:mm"
                                        showTimeSelect
                                        placeholderText="Chọn ngày giờ (dd/mm/yyyy hh:mm)"
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endDateTime">Ngày giờ kết thúc</Label>
                                    <DatePicker
                                        selected={discountSelectedData.endDateTime}
                                        onChange={(date) =>
                                            setDiscountSelectedData((prev) => ({ ...prev, endDateTime: date }))
                                        }
                                        dateFormat="dd/MM/yyyy HH:mm"
                                        timeFormat="HH:mm"
                                        showTimeSelect
                                        placeholderText="Chọn ngày giờ (dd/mm/yyyy hh:mm)"
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? "Đang xử lý..." : "Áp dụng"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setShowDiscountSelectedForm(false)}
                                >
                                    Hủy
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            ) : (
                <div>
                    <div className="mb-4 grid grid-cols-4 gap-4">
                        <div className="relative">
                            <Input
                                name="searchKeyword"
                                placeholder="Tìm kiếm sản phẩm..."
                                value={filters.searchKeyword}
                                onChange={handleFilterChange}
                            />
                            {filters.searchKeyword && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                    onClick={() => setFilters((prev) => ({ ...prev, searchKeyword: "" }))}
                                >
                                    X
                                </Button>
                            )}
                        </div>
                        <Input
                            name="minPrice"
                            type="number"
                            placeholder="Giá tối thiểu"
                            value={filters.minPrice}
                            onChange={handleFilterChange}
                        />
                        <Input
                            name="maxPrice"
                            type="number"
                            placeholder="Giá tối đa"
                            value={filters.maxPrice}
                            onChange={handleFilterChange}
                        />
                        <Select
                            onValueChange={(value) => setFilters((prev) => ({ ...prev, sortBy: value }))}
                            value={filters.sortBy}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sắp xếp theo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Mới nhất ↓</SelectItem>
                                <SelectItem value="bestselling">Bán chạy ↓</SelectItem>
                                <SelectItem value="priceasc">Giá ↑</SelectItem>
                                <SelectItem value="pricedesc">Giá ↓</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {isLoading ? (
                        <div className="space-y-4">
                            {Array(5)
                                .fill()
                                .map((_, index) => (
                                    <div key={index} className="flex space-x-4 animate-pulse">
                                        <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                                        <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                                        <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                                        <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                                    </div>
                                ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-gray-500">Không có sản phẩm nào để hiển thị.</p>
                            <Button onClick={() => setShowForm(true)} className="mt-4">
                                Thêm sản phẩm đầu tiên
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse table-auto min-w-[600px]">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-2 text-left">Tên sản phẩm</th>
                                        <th className="p-2 text-left">Giá bán</th>
                                        <th className="p-2 text-left">Giá hiện tại</th>
                                        <th className="p-2 text-left">Tồn kho</th>
                                        <th className="p-2 text-left">Nổi bật</th>
                                        <th className="p-2 text-left">Danh mục</th>
                                        <th className="p-2 text-left">NCC</th>
                                        <th className="p-2 text-left">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="p-2">{product.name}</td>
                                            <td className="p-2">{product.sellingPrice.toLocaleString()} VNĐ</td>
                                            <td className="p-2">
                                                {product.discountedPrice &&
                                                    new Date() >= new Date(product.discountStartDate) &&
                                                    new Date() <= new Date(product.discountEndDate) ? (
                                                    <>
                                                        <span className="line-through text-gray-500">
                                                            {product.sellingPrice.toLocaleString()} VNĐ
                                                        </span>
                                                        <br />
                                                        <span className="text-red-600 font-semibold">
                                                            {product.discountedPrice.toLocaleString()} VNĐ
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span>{product.sellingPrice.toLocaleString()} VNĐ</span>
                                                )}
                                            </td>
                                            <td className="p-2">{product.stock}</td>
                                            <td className="p-2">{product.isFeatured ? "Có" : "Không"}</td>
                                            <td className="p-2">{product.category?.name || "Không có"}</td>
                                            <td className="p-2">{product.supplier?.name || "Không có"}</td>
                                            <td className="p-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditProduct(product)}
                                                    className="mr-2"
                                                >
                                                    Sửa
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                >
                                                    Xóa
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="mt-4 flex justify-center gap-2">
                        <Button onClick={() => setPage((prev) => Math.max(0, prev - 1))} disabled={page === 0}>
                            Trước
                        </Button>
                        <span>Trang {page + 1} / {totalPages}</span>
                        <Button onClick={() => setPage((prev) => prev + 1)} disabled={page >= totalPages - 1}>
                            Sau
                        </Button>
                    </div>
                </div>
            )}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </div>
    );
}

export default ProductManagement;
