import { Bar } from 'react-chartjs-2';
import { Box, Typography } from '@mui/material';
import { useMemo, useState, useEffect } from 'react';

const BarChartSafe = ({
    dataSource = [],
    labelField = "productName",
    valueField = "totalSold",
    title = 'Top sản phẩm',
    unit = 'sản phẩm',
    height = 300,
}) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => setIsMounted(true), 0);
        return () => clearTimeout(timeout);
    }, []);

    const chartData = useMemo(() => {
        if (!Array.isArray(dataSource) || dataSource.length === 0) return null;

        return {
            labels: dataSource.map(item => item?.[labelField] || 'Không rõ'),
            datasets: [
                {
                    label: title,
                    data: dataSource.map(item => item[valueField] ?? 0),
                    backgroundColor: '#42A5F5',
                    borderColor: '#115293',
                    borderWidth: 1,
                }
            ]
        };
    }, [dataSource, labelField, valueField, title]);

    if (!isMounted || !chartData || chartData.labels.length === 0) {
        return (
            <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    Không có dữ liệu
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ height }}>
            <Bar
                key={JSON.stringify(chartData.labels)}
                data={chartData}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (context) =>
                                    `${context.dataset.label}: ${context.parsed.x?.toLocaleString() || 0} ${unit}`
                            }
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: `Số lượng ${unit}`
                            }
                        },
                        y: {
                            ticks: {
                                callback: function (value) {
                                    const label = this.getLabelForValue(value);
                                    return typeof label === 'string' && label.length > 30
                                        ? label.slice(0, 30) + '...'
                                        : label;
                                }
                            }
                        }
                    }
                }}
            />
        </Box>
    );
};

export default BarChartSafe;
