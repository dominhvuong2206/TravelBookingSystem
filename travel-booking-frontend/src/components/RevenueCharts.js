import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Tooltip,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import styles from "./RevenueChartsStyle";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export const formatCurrency = (value) => `${Number(value || 0).toLocaleString("vi-VN")} VNĐ`;

const palette = ["#2563eb", "#0ea5e9", "#14b8a6", "#22c55e", "#f59e0b", "#ef4444", "#64748b"];

const hasValues = (items, valueKey = "value") => items.some(item => Number(item[valueKey] || 0) > 0);

const moneyTooltip = {
    callbacks: {
        label: (context) => `${context.dataset.label || "Doanh thu"}: ${formatCurrency(context.parsed.y ?? context.parsed.x ?? context.raw)}`,
    },
};

export const RevenueBarChart = ({ rows, title = "Doanh thu" }) => {
    if (!hasValues(rows))
        return <div style={styles.emptyChart}>Chưa có dữ liệu doanh thu.</div>;

    const data = {
        labels: rows.map(row => row.label),
        datasets: [{
            label: title,
            data: rows.map(row => Number(row.value || 0)),
            backgroundColor: "#2563eb",
            borderRadius: 8,
            maxBarThickness: 46,
        }],
    };

    return <div style={styles.chartBox}>
        <Bar data={data} options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: moneyTooltip },
            scales: {
                y: { beginAtZero: true, ticks: { callback: value => Number(value).toLocaleString("vi-VN") } },
                x: { grid: { display: false } },
            },
        }} />
    </div>;
};

export const CountBarChart = ({ rows, title = "Số booking" }) => {
    if (!hasValues(rows))
        return <div style={styles.emptyChart}>Chưa có dữ liệu booking.</div>;

    const data = {
        labels: rows.map(row => row.label),
        datasets: [{
            label: title,
            data: rows.map(row => Number(row.value || 0)),
            backgroundColor: "#16a34a",
            borderRadius: 8,
            maxBarThickness: 46,
        }],
    };

    return <div style={styles.chartBox}>
        <Bar data={data} options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: context => `${context.dataset.label}: ${Number(context.parsed.y || 0).toLocaleString("vi-VN")}`,
                    },
                },
            },
            scales: {
                y: { beginAtZero: true, ticks: { precision: 0, callback: value => Number(value).toLocaleString("vi-VN") } },
                x: { grid: { display: false } },
            },
        }} />
    </div>;
};

export const ServiceRevenueChart = ({ services }) => {
    const rows = [...services]
        .sort((a, b) => Number(b.paidRevenue || 0) - Number(a.paidRevenue || 0))
        .filter(item => Number(item.paidRevenue || 0) > 0)
        .slice(0, 12);

    if (!hasValues(rows, "paidRevenue"))
        return <div style={styles.emptyChart}>Chưa có doanh thu theo dịch vụ.</div>;

    const data = {
        labels: rows.map(item => item.serviceName),
        datasets: [{
            label: "Doanh thu đã thanh toán",
            data: rows.map(item => Number(item.paidRevenue || 0)),
            backgroundColor: rows.map((_, index) => palette[index % palette.length]),
            borderRadius: 8,
            maxBarThickness: 30,
        }],
    };

    return <div style={styles.serviceChartBox}>
        <Bar data={data} options={{
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: moneyTooltip },
            scales: {
                x: { beginAtZero: true, ticks: { callback: value => Number(value).toLocaleString("vi-VN") } },
                y: { grid: { display: false } },
            },
        }} />
    </div>;
};

export const DoughnutSummaryChart = ({ labels, values, title, currency = false }) => {
    const rows = labels.map((label, index) => ({ label, value: Number(values[index] || 0) }));

    if (!hasValues(rows))
        return <div style={styles.emptyChart}>Chưa có dữ liệu.</div>;

    const data = {
        labels,
        datasets: [{
            label: title,
            data: values,
            backgroundColor: labels.map((_, index) => palette[index % palette.length]),
            borderWidth: 0,
        }],
    };

    return <div style={styles.doughnutBox}>
        <Doughnut data={data} options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: "58%",
            plugins: {
                legend: { position: "bottom", labels: { boxWidth: 12, usePointStyle: true } },
                tooltip: {
                    callbacks: {
                        label: context => `${context.label}: ${currency ? formatCurrency(context.raw) : Number(context.raw || 0).toLocaleString("vi-VN")}`,
                    },
                },
            },
        }} />
    </div>;
};
