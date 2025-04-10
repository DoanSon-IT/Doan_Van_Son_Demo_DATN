import { Line } from 'react-chartjs-2';
import { Box, Typography } from '@mui/material';
import { useMemo, useState, useEffect } from 'react';

const LineChartSafe = ({
    dataSource = [],
    labelField = 'date',
    valueField = 'revenue',
    title = 'Biểu đồ đường',
    unit = '₫',
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
                    label: title,
                    data: dataSource.map(item => item[valueField]),
                    borderColor: '#1976d2',
                    backgroundColor: 'rgba(25, 118, 210, 0.2)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointHoverRadius: 6
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
        <Line
            key={JSON.stringify(chartData.labels)}
            data={chartData}
            options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) =>
                                `${context.dataset.label}: ${Number(context.parsed.y || 0).toLocaleString()} ${unit}`
                        }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Thời gian'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: `Giá trị (${unit})`
                        }
                    }
                }
            }}
            height={height}
        />
    );
};

export default LineChartSafe;
