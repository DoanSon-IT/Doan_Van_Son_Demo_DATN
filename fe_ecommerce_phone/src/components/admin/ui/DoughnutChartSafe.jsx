import { Doughnut } from 'react-chartjs-2';
import { Box, Typography } from '@mui/material';
import { useMemo, useState, useEffect } from 'react';

const DoughnutChartSafe = ({
    dataSource = [],
    labelField = 'category',
    valueField = 'totalRevenue',
    title = 'Biểu đồ',
    height = 300
}) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => setIsMounted(true), 0);
        return () => clearTimeout(timeout);
    }, []);

    const chartData = useMemo(() => {
        if (!Array.isArray(dataSource) || dataSource.length === 0) return null;

        return {
            labels: dataSource.map(item => item[labelField]),
            datasets: [
                {
                    data: dataSource.map(item => item[valueField]),
                    backgroundColor: [
                        '#1976d2', '#4caf50', '#ff9800', '#e91e63', '#9c27b0',
                        '#3f51b5', '#00bcd4', '#ffc107', '#8bc34a', '#f44336'
                    ],
                    borderWidth: 1
                }
            ]
        };
    }, [dataSource, labelField, valueField]);

    if (!isMounted || !chartData || chartData.labels?.length === 0) {
        return (
            <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    Không có dữ liệu
                </Typography>
            </Box>
        );
    }

    return (
        <Doughnut
            data={chartData}
            options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                return `${label}: ${Number(value).toLocaleString()} ₫`;
                            }
                        }
                    }
                },
                cutout: '65%'
            }}
        />
    );
};

export default DoughnutChartSafe;
