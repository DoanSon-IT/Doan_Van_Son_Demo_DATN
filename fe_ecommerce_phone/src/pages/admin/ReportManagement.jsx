import React, { useState, useMemo, useEffect } from "react";
import {
    Box,
    Typography,
    Paper,
    TextField,
    MenuItem,
    CircularProgress,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    Stack,
    IconButton,
    Tooltip,
    Card,
    CardContent,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Snackbar,
    Alert,
    Tabs,
    Tab
} from "@mui/material";
import { Line, Pie, Bar, Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip as ChartTooltip,
    Legend,
    Filler
} from "chart.js";
import GetApp from '@mui/icons-material/GetApp';
import BarChart from '@mui/icons-material/BarChart';
import Refresh from '@mui/icons-material/Refresh';
import ViewModule from '@mui/icons-material/ViewModule';
import AttachMoney from '@mui/icons-material/AttachMoney';
import TrendingUp from '@mui/icons-material/TrendingUp';
import Description from '@mui/icons-material/Description';
import ShowChart from "@mui/icons-material/ShowChart";
import Inventory from '@mui/icons-material/Inventory';
import Category from "@mui/icons-material/Category";
import FormatListBulleted from '@mui/icons-material/FormatListBulleted';
import apiReport from "../../api/apiReport";
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import DoughnutChartSafe from '../../components/admin/ui/DoughnutChartSafe';
import BarChartSafe from '../../components/admin/ui/BarChartSafe';
import LineChartSafe from '../../components/admin/ui/LineChartSafe';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    ChartTooltip,
    Legend,
    Filler
);

// Chart color palette
const CHART_COLORS = {
    primary: {
        main: 'rgba(63, 81, 181, 0.7)',
        light: 'rgba(63, 81, 181, 0.4)',
        border: 'rgba(63, 81, 181, 1)'
    },
    secondary: {
        main: 'rgba(156, 39, 176, 0.7)',
        light: 'rgba(156, 39, 176, 0.4)',
        border: 'rgba(156, 39, 176, 1)'
    },
    success: {
        main: 'rgba(76, 175, 80, 0.7)',
        light: 'rgba(76, 175, 80, 0.4)',
        border: 'rgba(76, 175, 80, 1)'
    },
    info: {
        main: 'rgba(33, 150, 243, 0.7)',
        light: 'rgba(33, 150, 243, 0.4)',
        border: 'rgba(33, 150, 243, 1)'
    },
    warning: {
        main: 'rgba(255, 152, 0, 0.7)',
        light: 'rgba(255, 152, 0, 0.4)',
        border: 'rgba(255, 152, 0, 1)'
    },
    error: {
        main: 'rgba(244, 67, 54, 0.7)',
        light: 'rgba(244, 67, 54, 0.4)',
        border: 'rgba(244, 67, 54, 1)'
    },
    categoryColors: [
        'rgba(63, 81, 181, 0.7)',
        'rgba(156, 39, 176, 0.7)',
        'rgba(76, 175, 80, 0.7)',
        'rgba(33, 150, 243, 0.7)',
        'rgba(255, 152, 0, 0.7)',
        'rgba(244, 67, 54, 0.7)',
        'rgba(121, 85, 72, 0.7)',
        'rgba(0, 150, 136, 0.7)'
    ]
};

// Status color mapping
const STATUS_COLORS = {
    "COMPLETED": "success",
    "PENDING": "info",
    "CONFIRMED": "warning",
    "CANCELLED": "error",
    "SHIPPED": "info"
};

const STATUS_TRANSLATIONS = {
    "COMPLETED": "Hoàn thành",
    "PENDING": "Chờ xử lý",
    "CONFIRMED": "Đã xác nhận",
    "CANCELLED": "Đã hủy",
    "SHIPPED": "Đã gửi hàng"
};

const ReportDashboard = () => {
    // =============== STATE MANAGEMENT ===============
    const [activeTab, setActiveTab] = useState(0);
    const [viewMode, setViewMode] = useState('dashboard');
    const [timeFrame, setTimeFrame] = useState("day");
    const [startDate, setStartDate] = useState(subDays(new Date(), 30));
    const [endDate, setEndDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState({
        profitData: [],
        revenueData: [],
        categoryRevenue: [],
        topProducts: [],
        orderStats: {},
        lowStockItems: []
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'info'
    });

    // dùng cho API yêu cầu LocalDate
    const formattedStartDate = format(startDate, 'yyyy-MM-dd');
    const formattedEndDate = format(endDate, 'yyyy-MM-dd');

    // dùng cho API yêu cầu LocalDateTime
    const formattedStartDateTime = `${formattedStartDate}T00:00:00`;
    const formattedEndDateTime = `${formattedEndDate}T23:59:59`;

    // =============== PREDEFINED DATE RANGES ===============
    const dateRanges = useMemo(() => [
        {
            label: "Hôm nay",
            value: "today",
            getRange: () => {
                const today = new Date();
                return { start: today, end: today };
            }
        },
        {
            label: "7 ngày qua",
            value: "last7Days",
            getRange: () => {
                return { start: subDays(new Date(), 6), end: new Date() };
            }
        },
        {
            label: "30 ngày qua",
            value: "last30Days",
            getRange: () => {
                return { start: subDays(new Date(), 29), end: new Date() };
            }
        },
        {
            label: "Tháng này",
            value: "thisMonth",
            getRange: () => {
                const now = new Date();
                return {
                    start: startOfMonth(now),
                    end: endOfMonth(now)
                };
            }
        }
    ], []);

    // =============== DATA FETCHING ===============
    const fetchDashboardData = async () => {
        if (!startDate || !endDate) {
            showSnackbar('Vui lòng chọn khoảng thời gian', 'warning');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const [
                profitStats,
                dailyRevenue,
                categoryData,
                topProductsData,
                orderStatusData,
                lowStockData
            ] = await Promise.all([
                apiReport.getProfitStats(timeFrame, formattedStartDate, formattedEndDate),
                apiReport.getDailyRevenue(formattedStartDate, formattedEndDate),
                apiReport.getRevenueByCategory(formattedStartDate, formattedEndDate),
                apiReport.getTopProducts(formattedStartDateTime, formattedEndDateTime, 10),
                apiReport.getOrdersByStatus(formattedStartDateTime, formattedEndDateTime),
                apiReport.getLowStockProducts(5)
            ]);

            setDashboardData({
                profitData: profitStats || [],
                revenueData: dailyRevenue || [],
                categoryRevenue: categoryData || [],
                topProducts: topProductsData || [],
                orderStats: orderStatusData || {},
                lowStockItems: lowStockData || []
            });

            showSnackbar('Dữ liệu báo cáo đã được cập nhật', 'success');
        } catch (err) {
            console.error("Failed to fetch dashboard data:", err);
            setError(err.message || "Không thể tải dữ liệu báo cáo");
            showSnackbar('Không thể tải dữ liệu báo cáo', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Handle date range selection
    const handleDateRangeChange = (rangeValue) => {
        const range = dateRanges.find(r => r.value === rangeValue);
        if (range) {
            const { start, end } = range.getRange();
            setStartDate(start);
            setEndDate(end);
        }
    };

    // =============== EXPORT FUNCTIONS ===============
    const exportReport = async (type) => {
        setLoading(true);
        try {
            let blob;
            const fileName = `Báo_Cáo_${type}_${format(new Date(), 'yyyyMMdd')}`;

            switch (type) {
                case 'pdf':
                    blob = await apiReport.exportPdf(formattedStartDateTime, formattedEndDateTime);
                    downloadFile(blob, `${fileName}.pdf`, 'application/pdf');
                    break;
                case 'excel':
                    blob = await apiReport.exportExcel(formattedStartDateTime, formattedEndDateTime);
                    downloadFile(blob, `${fileName}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                    break;
                case 'word':
                    blob = await apiReport.exportWord(formattedStartDateTime, formattedEndDateTime);
                    downloadFile(blob, `${fileName}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                    break;
                default:
                    throw new Error("Định dạng không được hỗ trợ");
            }

            showSnackbar(`Xuất báo cáo ${type.toUpperCase()} thành công`, 'success');
        } catch (err) {
            console.error(`Export ${type} error:`, err);
            showSnackbar(`Không thể xuất báo cáo ${type.toUpperCase()}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const downloadFile = (blob, fileName, mimeType) => {
        const url = window.URL.createObjectURL(new Blob([blob], { type: mimeType }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    // =============== UTILITY FUNCTIONS ===============
    const showSnackbar = (message, severity = 'info') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // =============== CHART DATA PREPARATION ===============
    const revenueAndProfitChart = {
        labels: dashboardData.profitData.map(p => p.period),
        datasets: [
            {
                label: 'Doanh thu',
                data: dashboardData.profitData.map(p => p.totalRevenue),
                borderColor: CHART_COLORS.primary.border,
                backgroundColor: CHART_COLORS.primary.light,
                borderWidth: 2,
                fill: true,
                tension: 0.4
            },
            {
                label: 'Lợi nhuận',
                data: dashboardData.profitData.map(p => p.totalProfit),
                borderColor: CHART_COLORS.success.border,
                backgroundColor: CHART_COLORS.success.light,
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }
        ]
    };

    const topProductsChart = {
        labels: dashboardData.topProducts.map(p => p.name),
        datasets: [
            {
                label: 'Doanh số bán ra',
                data: dashboardData.topProducts.map(p => p.quantity),
                backgroundColor: CHART_COLORS.secondary.main,
                borderColor: CHART_COLORS.secondary.border,
                borderWidth: 1
            }
        ]
    };

    const orderStatusChart = {
        labels: Object.keys(dashboardData.orderStats),
        datasets: [
            {
                data: Object.values(dashboardData.orderStats),
                backgroundColor: Object.keys(dashboardData.orderStats).map(status => {
                    const colorKey = STATUS_COLORS[status] || 'info';
                    return CHART_COLORS[colorKey].main;
                }),
                borderWidth: 1
            }
        ]
    };

    const categoryRevenueChart = {
        labels: dashboardData.categoryRevenue.map(c => c.category),
        datasets: [
            {
                data: dashboardData.categoryRevenue.map(c => c.totalRevenue),
                backgroundColor: CHART_COLORS.categoryColors,
                borderWidth: 1
            }
        ]
    };

    // =============== COMPONENT RENDER ===============
    const totalRevenue = dashboardData.profitData.reduce((sum, item) => sum + (item.totalRevenue || 0), 0);
    const totalProfit = dashboardData.profitData.reduce((sum, item) => sum + (item.totalProfit || 0), 0);
    const totalOrders = Object.values(dashboardData.orderStats).reduce((sum, count) => sum + count, 0);
    const avgProfitMargin = isNaN(totalProfit / totalRevenue)
        ? "0.00"
        : (totalProfit / totalRevenue * 100).toFixed(2);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const formatPeriodLabel = (period) => {
        switch (timeFrame) {
            case 'day':
                return format(new Date(period), 'dd/MM/yyyy');
            case 'month':
                return format(new Date(period), 'MM/yyyy');
            case 'year':
                return period;
            default:
                return period;
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    return (
        <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
            {/* Header and Filters Section */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <Typography variant="h4" fontWeight="500" sx={{ mb: 1 }}>
                            Báo Cáo Kinh Doanh
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {`${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={3}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Khoảng thời gian</InputLabel>
                                    <Select
                                        label="Khoảng thời gian"
                                        onChange={(e) => handleDateRangeChange(e.target.value)}
                                        defaultValue=""
                                    >
                                        {dateRanges.map(range => (
                                            <MenuItem key={range.value} value={range.value}>
                                                {range.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    label="Từ ngày"
                                    type="date"
                                    size="small"
                                    fullWidth
                                    value={format(startDate, 'yyyy-MM-dd')}
                                    onChange={(e) => setStartDate(new Date(e.target.value))}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    label="Đến ngày"
                                    type="date"
                                    value={format(endDate, 'yyyy-MM-dd')}
                                    onChange={(e) => setEndDate(new Date(e.target.value))}
                                    size="small"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={3}>
                                <Stack direction="row" spacing={1}>
                                    <Button
                                        variant="contained"
                                        startIcon={<Refresh />}
                                        onClick={fetchDashboardData}
                                        disabled={loading}
                                        sx={{ flexGrow: 1 }}
                                    >
                                        {loading ? <CircularProgress size={24} /> : "Cập nhật"}
                                    </Button>
                                    <Tooltip title="Thay đổi chế độ xem">
                                        <IconButton
                                            color="primary"
                                            onClick={() => setViewMode(viewMode === 'dashboard' ? 'table' : 'dashboard')}
                                        >
                                            {viewMode === 'dashboard' ? <FormatListBulleted /> : <ViewModule />}
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>

            {/* Error message if any */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Main Content Area */}
            {viewMode === 'dashboard' ? (
                <>
                    {/* Summary Cards */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Tổng doanh thu
                                        </Typography>
                                        <AttachMoney sx={{ color: 'primary.main' }} />
                                    </Box>
                                    <Typography variant="h5" fontWeight="600">
                                        {formatCurrency(totalRevenue)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {`Thời gian: ${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Tổng lợi nhuận
                                        </Typography>
                                        <TrendingUp sx={{ color: 'success.main' }} />
                                    </Box>
                                    <Typography variant="h5" fontWeight="600">
                                        {formatCurrency(totalProfit)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Biên lợi nhuận: {avgProfitMargin}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Tổng đơn hàng
                                        </Typography>
                                        <Description sx={{ color: 'info.main' }} />
                                    </Box>
                                    <Typography variant="h5" fontWeight="600">
                                        {totalOrders}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {Object.entries(dashboardData.orderStats).map(([status, count]) => (
                                            `${STATUS_TRANSLATIONS[status] || status}: ${count}`
                                        )).join(' | ')}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Sản phẩm tồn ít
                                        </Typography>
                                        <Inventory sx={{ color: 'warning.main' }} />
                                    </Box>
                                    <Typography variant="h5" fontWeight="600">
                                        {dashboardData.lowStockItems.length}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Cần bổ sung hàng tồn kho
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Chart Section */}
                    <Grid container spacing={3}>
                        {/* Revenue and Profit Trend */}
                        <Grid item xs={12} md={8}>
                            <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight="500" sx={{ mb: 2 }}>
                                        Xu hướng doanh thu và lợi nhuận
                                    </Typography>
                                    <Box sx={{ height: 350 }}>
                                        {dashboardData.profitData.length > 0 ? (
                                            <Line
                                                data={revenueAndProfitChart}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: {
                                                            position: 'top',
                                                        },
                                                        tooltip: {
                                                            callbacks: {
                                                                label: function (context) {
                                                                    let label = context.dataset.label || '';
                                                                    if (label) {
                                                                        label += ': ';
                                                                    }
                                                                    if (context.parsed.y !== null) {
                                                                        label += formatCurrency(context.parsed.y);
                                                                    }
                                                                    return label;
                                                                }
                                                            }
                                                        }
                                                    },
                                                    scales: {
                                                        x: {
                                                            grid: {
                                                                display: false,
                                                            }
                                                        },
                                                        y: {
                                                            ticks: {
                                                                callback: function (value) {
                                                                    return formatCurrency(value).slice(0, -6) + ' tr';
                                                                }
                                                            }
                                                        }
                                                    }
                                                }}
                                            />
                                        ) : loading ? (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                                <CircularProgress />
                                            </Box>
                                        ) : (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                                <Typography color="text.secondary">Không có dữ liệu</Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Order Status Distribution */}
                        <Grid item xs={12} md={4}>
                            <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight="500" sx={{ mb: 2 }}>
                                        Phân bố trạng thái đơn hàng
                                    </Typography>
                                    <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        {Object.keys(dashboardData.orderStats).length > 0 ? (
                                            <>
                                                <Doughnut
                                                    data={orderStatusChart}
                                                    options={{
                                                        responsive: true,
                                                        maintainAspectRatio: false,
                                                        plugins: {
                                                            legend: {
                                                                position: 'bottom',
                                                            },
                                                            tooltip: {
                                                                callbacks: {
                                                                    label: function (context) {
                                                                        const label = context.label || '';
                                                                        const value = context.raw || 0;
                                                                        const percentage = ((value / totalOrders) * 100).toFixed(1);
                                                                        return `${label}: ${value} (${percentage}%)`;
                                                                    }
                                                                }
                                                            }
                                                        },
                                                        cutout: '65%'
                                                    }}
                                                />
                                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                                                    {Object.entries(dashboardData.orderStats).map(([status, count]) => (
                                                        <Chip
                                                            key={status}
                                                            label={`${STATUS_TRANSLATIONS[status] || status}: ${count}`}
                                                            color={STATUS_COLORS[status] || "default"}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    ))}
                                                </Box>
                                            </>
                                        ) : loading ? (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                                <CircularProgress />
                                            </Box>
                                        ) : (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                                <Typography color="text.secondary">Không có dữ liệu</Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Category Revenue */}
                        <Grid item xs={12} md={6}>
                            <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight="500" sx={{ mb: 2 }}>
                                        Doanh thu theo danh mục
                                    </Typography>
                                    <Box sx={{ height: 300 }}>
                                        {loading ? (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                                <CircularProgress />
                                            </Box>
                                        ) : (
                                            <DoughnutChartSafe
                                                dataSource={dashboardData.categoryRevenue}
                                                labelField="category"
                                                valueField="totalRevenue"
                                                title="Doanh thu theo danh mục"
                                            />
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Top Products */}
                        <Grid item xs={12} md={6}>
                            <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight="500" sx={{ mb: 2 }}>
                                        Top sản phẩm bán chạy
                                    </Typography>
                                    <Box sx={{ height: 300 }}>
                                        {loading ? (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                                <CircularProgress />
                                            </Box>
                                        ) : (
                                            <BarChartSafe
                                                dataSource={dashboardData.topProducts}
                                                labelField="productName"
                                                valueField="totalSold"
                                                title="Top sản phẩm bán chạy"
                                                unit="sản phẩm"
                                            />
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Low Stock Products */}
                        <Grid item xs={12}>
                            <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6" fontWeight="500">
                                            Sản phẩm tồn kho thấp
                                        </Typography>
                                        <Chip
                                            icon={<Inventory fontSize="small" />}
                                            label="Cần nhập thêm"
                                            color="warning"
                                            size="small"
                                        />
                                    </Box>
                                    <TableContainer component={Paper} elevation={0} variant="outlined">
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Mã sản phẩm</TableCell>
                                                    <TableCell>Tên sản phẩm</TableCell>
                                                    <TableCell>Danh mục</TableCell>
                                                    <TableCell align="right">Tồn kho</TableCell>
                                                    <TableCell align="right">Mức tối thiểu</TableCell>
                                                    <TableCell align="right">Cần nhập thêm</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {dashboardData.lowStockItems.length > 0 ? (
                                                    dashboardData.lowStockItems.map((item) => (
                                                        <TableRow key={item.productId} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                            <TableCell>{item.productId}</TableCell>
                                                            <TableCell>{item.name}</TableCell>
                                                            <TableCell>{item.category}</TableCell>
                                                            <TableCell align="right">
                                                                <Typography color="error.main" fontWeight="medium">
                                                                    {item.currentStock}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="right">{item.minStock}</TableCell>
                                                            <TableCell align="right">{(item.minStock ?? 0) - (item.currentStock ?? 0)}</TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : loading ? (
                                                    <TableRow>
                                                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                                            <CircularProgress size={24} />
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                                            <Typography color="text.secondary">Không có sản phẩm tồn kho thấp</Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </>
            ) : (
                /* Table View Mode */
                <Paper sx={{ p: 2, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                    <Tabs
                        value={activeTab}
                        onChange={(e, newValue) => setActiveTab(newValue)}
                        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
                    >
                        <Tab icon={<ShowChart />} iconPosition="start" label="Doanh thu & Lợi nhuận" />
                        <Tab icon={<Category />} iconPosition="start" label="Danh mục" />
                        <Tab icon={<BarChart />} iconPosition="start" label="Top sản phẩm" />
                        <Tab icon={<Inventory />} iconPosition="start" label="Tồn kho thấp" />
                    </Tabs>

                    {/* Revenue & Profit Table */}
                    {activeTab === 0 && (
                        <TableContainer>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6">Báo cáo doanh thu và lợi nhuận</Typography>
                                <Box>
                                    <Button
                                        startIcon={<GetApp />}
                                        onClick={() => exportReport('word')}
                                        size="small"
                                        sx={{ mr: 1 }}
                                    >
                                        Word
                                    </Button>
                                    <Button
                                        startIcon={<GetApp />}
                                        onClick={() => exportReport('excel')}
                                        size="small"
                                        sx={{ mr: 1 }}
                                    >
                                        Excel
                                    </Button>
                                    <Button
                                        startIcon={<GetApp />}
                                        onClick={() => exportReport('pdf')}
                                        size="small"
                                    >
                                        PDF
                                    </Button>
                                </Box>
                            </Box>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Thời gian</TableCell>
                                        <TableCell align="right">Doanh thu</TableCell>
                                        <TableCell align="right">Chi phí</TableCell>
                                        <TableCell align="right">Lợi nhuận</TableCell>
                                        <TableCell align="right">Biên lợi nhuận</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {dashboardData.profitData.length > 0 ? (
                                        dashboardData.profitData.map((item) => (
                                            <TableRow key={item.period}>
                                                <TableCell>{formatPeriodLabel(item.period)}</TableCell>
                                                <TableCell align="right">{formatCurrency(item.totalRevenue)}</TableCell>
                                                <TableCell align="right">{formatCurrency(item.totalCost ?? 0)}</TableCell>
                                                <TableCell align="right">{formatCurrency(item.totalProfit ?? 0)}</TableCell>
                                                <TableCell align="right">
                                                    {item.totalRevenue > 0
                                                        ? ((item.totalProfit / item.totalRevenue) * 100).toFixed(2) + '%'
                                                        : '0.00%'}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                                <CircularProgress size={24} />
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                                <Typography color="text.secondary">Không có dữ liệu</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {dashboardData.profitData.length > 0 && (
                                        <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                                            <TableCell><strong>Tổng</strong></TableCell>
                                            <TableCell align="right"><strong>{formatCurrency(totalRevenue)}</strong></TableCell>
                                            <TableCell align="right">
                                                <strong>
                                                    {formatCurrency(dashboardData.profitData.reduce((sum, item) => sum + (item.totalCost || 0), 0))}
                                                </strong>
                                            </TableCell>
                                            <TableCell align="right"><strong>{formatCurrency(totalProfit)}</strong></TableCell>
                                            <TableCell align="right">{!isNaN(avgProfitMargin) ? `${avgProfitMargin}%` : '0.00%'}</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* Category Revenue Table */}
                    {activeTab === 1 && (
                        <TableContainer>
                            <Typography variant="h6" sx={{ mb: 2 }}>Doanh thu theo danh mục</Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Danh mục</TableCell>
                                        <TableCell align="right">Doanh thu</TableCell>
                                        <TableCell align="right">Phần trăm</TableCell>
                                        <TableCell align="right">Số đơn hàng</TableCell>
                                        <TableCell align="right">Số sản phẩm</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {dashboardData.categoryRevenue.length > 0 ? (
                                        dashboardData.categoryRevenue.map((item) => (
                                            <TableRow key={item.category}>
                                                <TableCell>{item.category}</TableCell>
                                                <TableCell align="right">{formatCurrency(item.totalRevenue)}</TableCell>
                                                <TableCell align="right">
                                                    {item.totalRevenue > 0
                                                        ? ((item.totalProfit / item.totalRevenue) * 100).toFixed(2) + '%'
                                                        : '0.00%'}
                                                </TableCell>
                                                <TableCell align="right">{item.orderCount || 0}</TableCell>
                                                <TableCell align="right">{item.productCount || 0}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                                <CircularProgress size={24} />
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                                <Typography color="text.secondary">Không có dữ liệu</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* Top Products Table */}
                    {activeTab === 2 && (
                        <TableContainer>
                            <Typography variant="h6" sx={{ mb: 2 }}>Top sản phẩm bán chạy</Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Mã sản phẩm</TableCell>
                                        <TableCell>Tên sản phẩm</TableCell>
                                        <TableCell>Danh mục</TableCell>
                                        <TableCell align="right">Số lượng bán</TableCell>
                                        <TableCell align="right">Doanh thu</TableCell>
                                        <TableCell align="right">Lợi nhuận</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {dashboardData.topProducts.length > 0 ? (
                                        dashboardData.topProducts.map((item) => (
                                            <TableRow key={item.productId}>
                                                <TableCell>{item.productId}</TableCell>
                                                <TableCell>{item.productName}</TableCell>
                                                <TableCell>{item.category}</TableCell>
                                                <TableCell align="right">{item.totalSold ?? 0}</TableCell>
                                                <TableCell align="right">{formatCurrency(item.revenue ?? 0)}</TableCell>
                                                <TableCell align="right">{formatCurrency(item.profit ?? 0)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                                <CircularProgress size={24} />
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                                <Typography color="text.secondary">Không có dữ liệu</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* Low Stock Table */}
                    {activeTab === 3 && (
                        <TableContainer>
                            <Typography variant="h6" sx={{ mb: 2 }}>Sản phẩm tồn kho thấp</Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Mã sản phẩm</TableCell>
                                        <TableCell>Tên sản phẩm</TableCell>
                                        <TableCell>Danh mục</TableCell>
                                        <TableCell align="right">Tồn kho</TableCell>
                                        <TableCell align="right">Mức tối thiểu</TableCell>
                                        <TableCell align="right">Cần nhập thêm</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {dashboardData.lowStockItems.length > 0 ? (
                                        dashboardData.lowStockItems.map((item) => (
                                            <TableRow key={item.productId}>
                                                <TableCell>{item.productId}</TableCell>
                                                <TableCell>{item.name}</TableCell>
                                                <TableCell>{item.category}</TableCell>
                                                <TableCell align="right">{item.currentStock}</TableCell>
                                                <TableCell align="right">{item.minStock ?? 0}</TableCell>
                                                <TableCell align="right">{(item.minStock ?? 0) - (item.currentStock ?? 0)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                                <CircularProgress size={24} />
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                                <Typography color="text.secondary">Không có sản phẩm tồn kho thấp</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            )}

            {/* Export Report Dialog (you could implement a modal dialog here) */}

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    elevation={6}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ReportDashboard;