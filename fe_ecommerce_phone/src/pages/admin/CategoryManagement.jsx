import React, { useEffect, useState, useCallback, useRef } from "react";
import apiCategory from "../../api/apiCategory";
import {
    Button,
    TextField,
    IconButton,
    Tooltip,
    Divider,
    Paper,
    Typography,
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Snackbar,
    Alert,
    Skeleton,
    Chip,
    InputAdornment,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Fade
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Edit,
    Trash2,
    Save,
    X,
    ArrowUpDown,
    Search,
    RefreshCw,
    Info,
    SortAsc,
    SortDesc,
    List,
    MoreVertical,
    Filter,
    XCircle
} from "lucide-react";

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [newCategory, setNewCategory] = useState("");
    const [editingCategory, setEditingCategory] = useState(null);
    const [sortBy, setSortBy] = useState("id");
    const [sortOrder, setSortOrder] = useState("asc");
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });
    const [viewMode, setViewMode] = useState("table");
    const [categoryInfoOpen, setCategoryInfoOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Refs
    const newCategoryInputRef = useRef(null);
    const editInputRef = useRef(null);

    // Menu states
    const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
    const [actionMenuCategory, setActionMenuCategory] = useState(null);
    const [sortMenuAnchor, setSortMenuAnchor] = useState(null);

    // Focus vào field khi component load
    useEffect(() => {
        if (newCategoryInputRef.current) {
            setTimeout(() => {
                newCategoryInputRef.current.focus();
            }, 500);
        }
    }, []);

    // Focus vào field chỉnh sửa
    useEffect(() => {
        if (editingCategory && editInputRef.current) {
            editInputRef.current.focus();
        }
    }, [editingCategory]);

    // Lấy dữ liệu
    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiCategory.getAllCategories();
            setCategories(data);
            applyFilters(data, searchTerm);
            setNotification({
                open: true,
                message: "Dữ liệu đã được cập nhật",
                severity: "success"
            });
        } catch (error) {
            console.error("Lỗi khi tải danh mục:", error);
            setNotification({
                open: true,
                message: "Không thể tải dữ liệu. Vui lòng thử lại sau.",
                severity: "error"
            });
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Lọc và sắp xếp
    const applyFilters = useCallback((data, term) => {
        let results = [...data];

        // Áp dụng tìm kiếm
        if (term.trim()) {
            results = results.filter(
                cat => cat.name.toLowerCase().includes(term.toLowerCase()) ||
                    cat.id.toString().includes(term)
            );
        }

        setFilteredCategories(results);
    }, []);

    // Theo dõi thay đổi của searchTerm
    useEffect(() => {
        applyFilters(categories, searchTerm);
    }, [categories, searchTerm, applyFilters]);

    // Sắp xếp categories
    const sortedCategories = [...filteredCategories].sort((a, b) => {
        if (sortBy === "id") {
            return sortOrder === "asc" ? a.id - b.id : b.id - a.id;
        } else if (sortBy === "name") {
            return sortOrder === "asc"
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
        }
        return 0;
    });

    // Toggle thứ tự sắp xếp
    const toggleSortOrder = () => {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    };

    // Thêm danh mục mới
    const handleAddCategory = async () => {
        if (!newCategory.trim()) {
            setNotification({
                open: true,
                message: "Vui lòng nhập tên danh mục",
                severity: "warning"
            });
            return;
        }

        setIsLoading(true);
        try {
            await apiCategory.createCategory(newCategory);
            await fetchCategories();
            setNewCategory("");
            setNotification({
                open: true,
                message: "Đã thêm danh mục thành công",
                severity: "success"
            });

            // Focus lại vào input để thêm tiếp
            if (newCategoryInputRef.current) {
                newCategoryInputRef.current.focus();
            }
        } catch (error) {
            console.error("Lỗi khi thêm danh mục:", error);
            setNotification({
                open: true,
                message: "Không thể thêm danh mục. Vui lòng thử lại sau.",
                severity: "error"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Cập nhật danh mục
    const handleUpdateCategory = async (id) => {
        if (!editingCategory.name.trim()) {
            setNotification({
                open: true,
                message: "Tên danh mục không được để trống",
                severity: "warning"
            });
            return;
        }

        setIsLoading(true);
        try {
            await apiCategory.updateCategory(id, editingCategory.name);
            await fetchCategories();
            setEditingCategory(null);
            setNotification({
                open: true,
                message: "Đã cập nhật danh mục thành công",
                severity: "success"
            });
        } catch (error) {
            console.error("Lỗi khi cập nhật danh mục:", error);
            setNotification({
                open: true,
                message: "Không thể cập nhật danh mục. Vui lòng thử lại sau.",
                severity: "error"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Xử lý xóa danh mục
    const openDeleteConfirm = (category) => {
        setCategoryToDelete(category);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteCategory = async () => {
        if (!categoryToDelete) return;

        setIsLoading(true);
        try {
            await apiCategory.deleteCategory(categoryToDelete.id);
            await fetchCategories();
            setNotification({
                open: true,
                message: "Đã xóa danh mục thành công",
                severity: "success"
            });
        } catch (error) {
            console.error("Lỗi khi xóa danh mục:", error);
            setNotification({
                open: true,
                message: "Không thể xóa danh mục. Vui lòng thử lại sau.",
                severity: "error"
            });
        } finally {
            setDeleteConfirmOpen(false);
            setCategoryToDelete(null);
            setIsLoading(false);
        }
    };

    // Hủy chỉnh sửa
    const cancelEdit = () => {
        setEditingCategory(null);
    };

    // Xem thông tin chi tiết danh mục
    const openCategoryInfo = (category) => {
        setSelectedCategory(category);
        setCategoryInfoOpen(true);
    };

    // Xử lý menu
    const handleActionMenuOpen = (event, category) => {
        setActionMenuAnchor(event.currentTarget);
        setActionMenuCategory(category);
    };

    const handleActionMenuClose = () => {
        setActionMenuAnchor(null);
        setActionMenuCategory(null);
    };

    const handleSortMenuOpen = (event) => {
        setSortMenuAnchor(event.currentTarget);
    };

    const handleSortMenuClose = () => {
        setSortMenuAnchor(null);
    };

    const handleSetSort = (field, order) => {
        setSortBy(field);
        setSortOrder(order);
        handleSortMenuClose();
    };

    // Đóng thông báo
    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    // Xóa tìm kiếm
    const clearSearch = () => {
        setSearchTerm("");
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
    };

    const tableAnimation = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5 } }
    };

    // Render card view
    const renderCardView = () => (
        <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {sortedCategories.map((category) => (
                <motion.div
                    key={category.id}
                    variants={itemVariants}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                    <Box className="p-4">
                        {editingCategory?.id === category.id ? (
                            <Box className="mb-2">
                                <TextField
                                    fullWidth
                                    size="small"
                                    variant="outlined"
                                    value={editingCategory.name}
                                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                    inputRef={editInputRef}
                                    autoFocus
                                    onKeyPress={(e) => e.key === 'Enter' && handleUpdateCategory(category.id)}
                                />
                            </Box>
                        ) : (
                            <Box className="flex justify-between items-center mb-2">
                                <Typography variant="h6" className="font-medium text-gray-800">
                                    {category.name}
                                </Typography>
                                <Chip
                                    label={`ID: ${category.id}`}
                                    size="small"
                                    className="bg-gray-100 text-gray-600"
                                />
                            </Box>
                        )}

                        <Box className="flex justify-between mt-4">
                            {editingCategory?.id === category.id ? (
                                <>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                        onClick={() => handleUpdateCategory(category.id)}
                                        startIcon={<Save size={16} />}
                                    >
                                        Lưu
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        className="border-gray-300 text-gray-700"
                                        onClick={cancelEdit}
                                        startIcon={<X size={16} />}
                                    >
                                        Hủy
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                                        onClick={() => setEditingCategory(category)}
                                        startIcon={<Edit size={16} />}
                                    >
                                        Sửa
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        className="border-red-600 text-red-600 hover:bg-red-50"
                                        onClick={() => openDeleteConfirm(category)}
                                        startIcon={<Trash2 size={16} />}
                                    >
                                        Xóa
                                    </Button>
                                </>
                            )}
                        </Box>
                    </Box>
                </motion.div>
            ))}
        </motion.div>
    );

    // Render table view
    const renderTableView = () => (
        <motion.div
            variants={tableAnimation}
            initial="hidden"
            animate="visible"
        >
            <Paper elevation={1} className="overflow-hidden rounded-xl">
                <Box className="overflow-x-auto">
                    <table className="w-full text-black">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 text-left font-medium text-gray-600">ID</th>
                                <th className="p-4 text-left font-medium text-gray-600">Tên danh mục</th>
                                <th className="p-4 text-center font-medium text-gray-600">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <tr key={index}>
                                        <td className="p-4"><Skeleton variant="text" width={40} /></td>
                                        <td className="p-4"><Skeleton variant="text" width="80%" /></td>
                                        <td className="p-4 text-center"><Skeleton variant="rectangular" width={120} height={36} /></td>
                                    </tr>
                                ))
                            ) : sortedCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-gray-500">
                                        {searchTerm ? (
                                            <Box className="flex flex-col items-center">
                                                <Search size={48} className="text-gray-300 mb-2" />
                                                <Typography variant="body1">Không tìm thấy danh mục phù hợp với "{searchTerm}"</Typography>
                                                <Button
                                                    size="small"
                                                    className="mt-2 text-blue-600"
                                                    onClick={clearSearch}
                                                >
                                                    Xóa tìm kiếm
                                                </Button>
                                            </Box>
                                        ) : (
                                            <Box className="flex flex-col items-center">
                                                <List size={48} className="text-gray-300 mb-2" />
                                                <Typography variant="body1">Chưa có danh mục nào. Hãy thêm danh mục mới.</Typography>
                                            </Box>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                <AnimatePresence>
                                    {sortedCategories.map((category) => (
                                        <motion.tr
                                            key={category.id}
                                            variants={itemVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit={{ opacity: 0, height: 0 }}
                                            className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="p-4 text-gray-700">{category.id}</td>
                                            <td className="p-4">
                                                {editingCategory?.id === category.id ? (
                                                    <Box className="flex gap-2 items-center">
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            variant="outlined"
                                                            value={editingCategory.name}
                                                            onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                                            className="bg-white"
                                                            inputRef={editInputRef}
                                                            onKeyPress={(e) => e.key === 'Enter' && handleUpdateCategory(category.id)}
                                                        />
                                                    </Box>
                                                ) : (
                                                    <Box
                                                        className="flex items-center cursor-pointer hover:text-blue-600"
                                                        onClick={() => openCategoryInfo(category)}
                                                    >
                                                        <Typography className="font-medium">{category.name}</Typography>
                                                        <Info size={14} className="ml-2 text-gray-400 hover:text-blue-500" />
                                                    </Box>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <Box className="flex gap-2 justify-center">
                                                    {editingCategory?.id === category.id ? (
                                                        <>
                                                            <Tooltip title="Lưu thay đổi" arrow>
                                                                <Button
                                                                    size="small"
                                                                    variant="contained"
                                                                    className="bg-green-600 hover:bg-green-700"
                                                                    onClick={() => handleUpdateCategory(category.id)}
                                                                    startIcon={<Save size={16} />}
                                                                >
                                                                    Lưu
                                                                </Button>
                                                            </Tooltip>
                                                            <Tooltip title="Hủy chỉnh sửa" arrow>
                                                                <Button
                                                                    size="small"
                                                                    variant="outlined"
                                                                    className="border-gray-300 text-gray-700"
                                                                    onClick={cancelEdit}
                                                                >
                                                                    Hủy
                                                                </Button>
                                                            </Tooltip>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Tooltip title="Chỉnh sửa" arrow>
                                                                <IconButton
                                                                    size="small"
                                                                    className="bg-blue-50 hover:bg-blue-100 text-blue-600"
                                                                    onClick={() => setEditingCategory(category)}
                                                                >
                                                                    <Edit size={18} />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Xóa" arrow>
                                                                <IconButton
                                                                    size="small"
                                                                    className="bg-red-50 hover:bg-red-100 text-red-600"
                                                                    onClick={() => openDeleteConfirm(category)}
                                                                >
                                                                    <Trash2 size={18} />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Thêm tùy chọn" arrow>
                                                                <IconButton
                                                                    size="small"
                                                                    className="bg-gray-50 hover:bg-gray-100 text-gray-600"
                                                                    onClick={(e) => handleActionMenuOpen(e, category)}
                                                                >
                                                                    <MoreVertical size={18} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </>
                                                    )}
                                                </Box>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            )}
                        </tbody>
                    </table>
                </Box>
            </Paper>
        </motion.div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-8 bg-white shadow-lg rounded-3xl my-10"
        >
            <Box className="flex justify-between items-center mb-6">
                <Typography variant="h4" component="h2" className="text-black font-bold">
                    Quản lý danh mục
                </Typography>
                <Tooltip title="Làm mới dữ liệu" arrow>
                    <IconButton
                        onClick={fetchCategories}
                        className="bg-gray-100 hover:bg-gray-200"
                        disabled={isLoading}
                    >
                        <RefreshCw size={20} className={`text-gray-700 ${isLoading ? 'animate-spin' : ''}`} />
                    </IconButton>
                </Tooltip>
            </Box>
            <Divider className="mb-6" />

            <Paper elevation={0} className="bg-gray-50 p-6 rounded-xl mb-6">
                <Typography variant="subtitle1" className="text-gray-700 mb-3 font-medium">
                    Thêm danh mục mới
                </Typography>
                <Box className="flex gap-4 items-center">
                    <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Nhập tên danh mục mới"
                        className="flex-1 bg-white rounded-lg"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                        inputRef={newCategoryInputRef}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Plus size={18} className="text-gray-400" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        variant="contained"
                        onClick={handleAddCategory}
                        className="bg-black hover:bg-gray-800 text-white normal-case"
                        disabled={isLoading || !newCategory.trim()}
                    >
                        Thêm mới
                    </Button>
                </Box>
            </Paper>

            <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <Box className="w-full sm:w-auto">
                    <TextField
                        placeholder="Tìm kiếm danh mục..."
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search size={18} className="text-gray-400" />
                                </InputAdornment>
                            ),
                            endAdornment: searchTerm && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={clearSearch}>
                                        <XCircle size={16} className="text-gray-400" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                <Box className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                    <Box className="flex items-center gap-2">
                        <Typography variant="body2" className="text-gray-600 hidden sm:inline">
                            Hiển thị:
                        </Typography>
                        <Tooltip title="Dạng bảng" arrow>
                            <IconButton
                                size="small"
                                onClick={() => setViewMode("table")}
                                className={viewMode === "table" ? "bg-black text-white" : "bg-gray-100 text-gray-600"}
                            >
                                <List size={18} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Dạng thẻ" arrow>
                            <IconButton
                                size="small"
                                onClick={() => setViewMode("card")}
                                className={viewMode === "card" ? "bg-black text-white" : "bg-gray-100 text-gray-600"}
                            >
                                <Filter size={18} />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Box>
                        <Button
                            variant="outlined"
                            size="small"
                            endIcon={<ArrowUpDown size={16} />}
                            onClick={handleSortMenuOpen}
                            className="border-gray-300 text-gray-700 whitespace-nowrap"
                        >
                            Sắp xếp
                        </Button>
                        <Menu
                            anchorEl={sortMenuAnchor}
                            open={Boolean(sortMenuAnchor)}
                            onClose={handleSortMenuClose}
                            TransitionComponent={Fade}
                        >
                            <MenuItem onClick={() => handleSetSort("id", "asc")}>
                                <ListItemIcon>
                                    <SortAsc size={18} />
                                </ListItemIcon>
                                <ListItemText>ID (tăng dần)</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={() => handleSetSort("id", "desc")}>
                                <ListItemIcon>
                                    <SortDesc size={18} />
                                </ListItemIcon>
                                <ListItemText>ID (giảm dần)</ListItemText>
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={() => handleSetSort("name", "asc")}>
                                <ListItemIcon>
                                    <SortAsc size={18} />
                                </ListItemIcon>
                                <ListItemText>Tên A-Z</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={() => handleSetSort("name", "desc")}>
                                <ListItemIcon>
                                    <SortDesc size={18} />
                                </ListItemIcon>
                                <ListItemText>Tên Z-A</ListItemText>
                            </MenuItem>
                        </Menu>
                    </Box>
                </Box>
            </Box>

            <Box className="mb-4">
                <Chip
                    label={`${filteredCategories.length} danh mục${searchTerm ? ` phù hợp với "${searchTerm}"` : ''}`}
                    className="bg-gray-100 text-gray-700"
                />
            </Box>

            {viewMode === "table" ? renderTableView() : renderCardView()}

            {/* Dialog xác nhận xóa */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                TransitionComponent={Fade}
            >
                <DialogTitle className="text-lg font-medium text-red-600">
                    Xác nhận xóa
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bạn có chắc chắn muốn xóa danh mục "<span className="font-medium">{categoryToDelete?.name}</span>"?
                        <br />Hành động này không thể hoàn tác.
                    </DialogContentText>
                </DialogContent>
                <DialogActions className="p-4">
                    <Button
                        onClick={() => setDeleteConfirmOpen(false)}
                        className="text-gray-700 normal-case"
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleDeleteCategory}
                        className="bg-red-600 hover:bg-red-700 text-white normal-case"
                        variant="contained"
                        startIcon={<Trash2 size={16} />}
                    >
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog thông tin danh mục */}
            <Dialog
                open={categoryInfoOpen}
                onClose={() => setCategoryInfoOpen(false)}
                TransitionComponent={Fade}
            >
                <DialogTitle className="font-medium">
                    Chi tiết danh mục
                </DialogTitle>
                <DialogContent>
                    {selectedCategory && (
                        <Box>
                            <Typography variant="subtitle1" className="font-medium text-gray-800 mb-1">
                                {selectedCategory.name}
                            </Typography>
                            <Typography variant="body2" className="text-gray-600 mb-4">
                                ID: {selectedCategory.id}
                            </Typography>
                            <Divider className="my-2" />
                            <Box className="mt-4">
                                <Typography variant="body2" className="text-gray-500">
                                    * Thông tin thêm về danh mục sẽ được hiển thị ở đây.
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setCategoryInfoOpen(false)}
                        className="text-gray-700"
                    >
                        Đóng
                    </Button>
                    {selectedCategory && (
                        <Button
                            onClick={() => {
                                setCategoryInfoOpen(false);
                                setEditingCategory(selectedCategory);
                            }}
                            startIcon={<Edit size={16} />}
                            className="text-blue-600"
                        >
                            Chỉnh sửa
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Menu hành động khác */}
            <Menu
                anchorEl={actionMenuAnchor}
                open={Boolean(actionMenuAnchor)}
                onClose={handleActionMenuClose}
                TransitionComponent={Fade}
            >
                <MenuItem onClick={() => {
                    openCategoryInfo(actionMenuCategory);
                    handleActionMenuClose();
                }}>
                    <ListItemIcon>
                        <Info size={18} />
                    </ListItemIcon>
                    <ListItemText>Xem chi tiết</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => {
                    setEditingCategory(actionMenuCategory);
                    handleActionMenuClose();
                }}>
                    <ListItemIcon>
                        <Edit size={18} />
                    </ListItemIcon>
                    <ListItemText>Chỉnh sửa</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => {
                    openDeleteConfirm(actionMenuCategory);
                    handleActionMenuClose();
                }}>
                    <ListItemIcon>
                        <Trash2 size={18} className="text-red-600" />
                    </ListItemIcon>
                    <ListItemText className="text-red-600">Xóa</ListItemText>
                </MenuItem>
            </Menu>

            {/* Thông báo */}
            <Snackbar
                open={notification.open}
                autoHideDuration={4000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    variant="filled"
                    elevation={6}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </motion.div>
    );
};

export default CategoryManagement;