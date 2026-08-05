import { useEffect, useMemo, useState } from "react";
import { Alert, Button, ButtonGroup, Card, Col, Form, Row, Spinner, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import {
    CountBarChart,
    DoughnutSummaryChart,
    RevenueBarChart,
    ServiceRevenueChart,
    formatCurrency,
} from "../../components/RevenueCharts";
import { authApis, endpoints } from "../../configs/Apis";
import styles from "./AdminDashboardStyle";

const statusText = {
    PENDING: "Chờ thanh toán",
    PAID: "Đã thanh toán",
    FAILED: "Thất bại",
    REFUNDED: "Đã hoàn tiền",
};

const methodText = {
    CASH: "Tiền mặt",
    PAYPAL: "PayPal",
    STRIPE: "Stripe",
    MOMO: "MoMo",
    ZALOPAY: "ZaloPay",
};

const periodConfig = {
    month: {
        label: "Theo tháng",
        revenueEndpoint: "admin-stats-revenue",
        frequencyEndpoint: "admin-stats-booking-frequency",
        keyLabel: (key) => `Tháng ${key}`,
        count: 12,
        needsYear: true,
    },
    quarter: {
        label: "Theo quý",
        revenueEndpoint: "admin-stats-revenue-quarter",
        frequencyEndpoint: "admin-stats-booking-frequency-quarter",
        keyLabel: (key) => `Quý ${key}`,
        count: 4,
        needsYear: true,
    },
    year: {
        label: "Theo năm",
        revenueEndpoint: "admin-stats-revenue-year",
        frequencyEndpoint: "admin-stats-booking-frequency-year",
        keyLabel: (key) => `Năm ${key}`,
        needsYear: false,
    },
};

const MetricCard = ({ label, value, icon, color }) => (
    <Col xl={2} md={4} sm={6}>
        <Card style={styles.card} className="h-100">
            <Card.Body style={styles.metricBody}>
                <div style={{ ...styles.iconBox, color, backgroundColor: `${color}14` }}>
                    <FontAwesomeIcon icon={icon} />
                </div>
                <div style={styles.metricLabel}>{label}</div>
                <p style={{ ...styles.metricValue, color }}>{value}</p>
            </Card.Body>
        </Card>
    </Col>
);
const toRows = (data, config, fallbackYear) => {
    const values = data?.values || data?.byMonth || {};

    if (config.count) {
        return Array.from({ length: config.count }, (_, index) => {
            const key = index + 1;
            return { key, label: config.keyLabel(key), value: Number(values[key] || 0) };
        });
    }

    const rows = Object.entries(values)
        .map(([key, value]) => ({ key, label: config.keyLabel(key), value: Number(value || 0) }))
        .sort((first, second) => Number(first.key) - Number(second.key));

    return rows.length > 0 ? rows : [{ key: fallbackYear, label: `Năm ${fallbackYear}`, value: 0 }];
};

const AdminDashboard = () => {
    const [summary, setSummary] = useState(null);
    const [serviceStats, setServiceStats] = useState([]);
    const [revenue, setRevenue] = useState(null);
    const [frequency, setFrequency] = useState(null);
    const [period, setPeriod] = useState("month");
    const [year, setYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(false);
    const [reportLoading, setReportLoading] = useState(false);
    const [overviewError, setOverviewError] = useState("");
    const [reportError, setReportError] = useState("");
    const [refreshVersion, setRefreshVersion] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const loadOverview = async () => {
            try {
                setLoading(true);
                setOverviewError("");
                const [summaryResponse, servicesResponse] = await Promise.all([
                    authApis().get(endpoints["admin-stats-summary"]),
                    authApis().get(endpoints["admin-stats-services"]),
                ]);
                setSummary(summaryResponse.data);
                setServiceStats(servicesResponse.data || []);
            } catch (error) {
                console.error(error);
                setOverviewError("Không thể tải báo cáo tổng quan. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };

        loadOverview();
    }, [refreshVersion]);

    useEffect(() => {
        const loadReports = async () => {
            try {
                setReportLoading(true);
                setReportError("");
                const config = periodConfig[period];
                const query = config.needsYear ? `?year=${year}` : "";
                const [revenueResponse, frequencyResponse] = await Promise.all([
                    authApis().get(`${endpoints[config.revenueEndpoint]}${query}`),
                    authApis().get(`${endpoints[config.frequencyEndpoint]}${query}`),
                ]);
                setRevenue(revenueResponse.data);
                setFrequency(frequencyResponse.data);
            } catch (error) {
                console.error(error);
                setReportError("Không thể tải dữ liệu báo cáo cho kỳ đã chọn.");
            } finally {
                setReportLoading(false);
            }
        };

        loadReports();
    }, [period, refreshVersion, year]);

    const config = periodConfig[period];
    const revenueRows = useMemo(() => toRows(revenue, config, year), [config, revenue, year]);
    const frequencyRows = useMemo(() => toRows(frequency, config, year), [config, frequency, year]);
    const transactionStatusCounts = summary?.transactionStatusCounts || {};
    const revenueByPaymentMethod = summary?.revenueByPaymentMethod || {};
    const statusLabels = Object.keys(statusText).map((key) => statusText[key]);
    const statusValues = Object.keys(statusText).map((key) => Number(transactionStatusCounts[key] || 0));
    const methodLabels = Object.keys(methodText).map((key) => methodText[key]);
    const methodValues = Object.keys(methodText).map((key) => Number(revenueByPaymentMethod[key] || 0));

    const sortedServiceStats = useMemo(() => (
        [...serviceStats].sort((first, second) => Number(second.paidRevenue || 0) - Number(first.paidRevenue || 0))
    ), [serviceStats]);

    const topServiceRevenue = Math.max(...serviceStats.map((item) => Number(item.paidRevenue || 0)), 1);
    const number = (value) => Number(value || 0).toLocaleString("vi-VN");

    if (loading && !summary)
        return <div className="text-center py-5"><Spinner animation="border" role="status" /><div className="mt-2 text-muted">Đang tải bảng điều khiển...</div></div>;

    return <div style={styles.page}>
        <div style={styles.header}>
            <div>
                <p style={styles.eyebrow}>ADMIN CONSOLE</p>
                <h1 style={styles.title}>Tổng quan hệ thống</h1>
                <p style={styles.subtitle}>Theo dõi người dùng, dịch vụ, booking, giao dịch và doanh thu trên toàn nền tảng.</p>
            </div>
            <div className="d-flex gap-2 flex-wrap">
                <Button variant="outline-secondary" disabled={loading || reportLoading} onClick={() => setRefreshVersion((value) => value + 1)}>
                    <FontAwesomeIcon icon="fa-solid fa-rotate" className="me-2" />
                    Làm mới
                </Button>
                <Button variant="primary" onClick={() => navigate("/admin/users?tab=pending")}>
                    <FontAwesomeIcon icon="fa-solid fa-user-check" className="me-2" />
                    Duyệt provider
                </Button>
            </div>
        </div>

        {overviewError && <Alert variant="danger" className="d-flex justify-content-between align-items-center">
            <span>{overviewError}</span>
            <Button size="sm" variant="outline-danger" onClick={() => setRefreshVersion((value) => value + 1)}>Thử lại</Button>
        </Alert>}

        <Row className="g-3">
            <MetricCard label="Tổng người dùng" value={number(summary?.totalUsers)} icon="fa-solid fa-users" color="#7c3aed" />
            <MetricCard label="Provider chờ duyệt" value={number(summary?.pendingProviders)} icon="fa-solid fa-user-clock" color="#d97706" />
            <MetricCard label="Dịch vụ hoạt động" value={number(summary?.activeServices)} icon="fa-solid fa-ticket" color="#2563eb" />
            <MetricCard label="Tổng dịch vụ" value={number(summary?.totalServices)} icon="fa-solid fa-layer-group" color="#0ea5e9" />
            <MetricCard label="Tổng booking" value={number(summary?.totalBookings)} icon="fa-solid fa-calendar-check" color="#16a34a" />
            <MetricCard label="Doanh thu đã trả" value={formatCurrency(summary?.paidRevenue)} icon="fa-solid fa-wallet" color="#dc2626" />
        </Row>

        <Card style={styles.card} className="mt-4">
            <Card.Body>
                <div style={styles.toolbar}>
                    <div>
                        <Card.Title className="mb-1" style={styles.tableTitle}>Hiệu suất theo thời gian</Card.Title>
                        <p className="text-muted mb-0">So sánh tần suất booking và doanh thu đã thanh toán.</p>
                    </div>
                    <div className="d-flex gap-2 flex-wrap">
                        <ButtonGroup aria-label="Chọn kỳ báo cáo">
                            {Object.entries(periodConfig).map(([key, item]) => (
                                <Button key={key} variant={period === key ? "primary" : "outline-primary"} onClick={() => setPeriod(key)}>
                                    {item.label}
                                </Button>
                            ))}
                        </ButtonGroup>
                        {config.needsYear && <Form.Select aria-label="Chọn năm" style={{ width: 120 }} value={year} onChange={(event) => setYear(Number(event.target.value))}>
                            {[0, 1, 2, 3, 4].map((offset) => {
                                const item = new Date().getFullYear() - offset;
                                return <option key={item} value={item}>{item}</option>;
                            })}
                        </Form.Select>}
                    </div>
                </div>

                {reportError && <Alert variant="warning">{reportError}</Alert>}
                {reportLoading ? <div className="text-center py-5"><Spinner size="sm" /><span className="ms-2 text-muted">Đang tải báo cáo...</span></div> : <Row className="g-4">
                    <Col lg={6}>
                        <h5 className="mb-3">Tần suất booking</h5>
                        <CountBarChart rows={frequencyRows} title="Số booking" />
                    </Col>
                    <Col lg={6}>
                        <h5 className="mb-3">Doanh thu</h5>
                        <RevenueBarChart rows={revenueRows} title="Doanh thu đã thanh toán" />
                    </Col>
                </Row>}
            </Card.Body>
        </Card>

        <Row className="g-3 mt-1">
            <Col lg={6}>
                <Card style={styles.card} className="h-100">
                    <Card.Body>
                        <Card.Title style={styles.tableTitle}>Giao dịch theo trạng thái</Card.Title>
                        <DoughnutSummaryChart labels={statusLabels} values={statusValues} title="Số giao dịch" />
                    </Card.Body>
                </Card>
            </Col>
            <Col lg={6}>
                <Card style={styles.card} className="h-100">
                    <Card.Body>
                        <Card.Title style={styles.tableTitle}>Doanh thu theo phương thức</Card.Title>
                        <DoughnutSummaryChart labels={methodLabels} values={methodValues} title="Doanh thu" currency />
                    </Card.Body>
                </Card>
            </Col>
        </Row>

        <Card style={styles.card} className="mt-4">
            <Card.Body>
                <div style={styles.toolbar}>
                    <div>
                        <Card.Title className="mb-1" style={styles.tableTitle}>Hiệu suất dịch vụ</Card.Title>
                        <p className="text-muted mb-0">Xếp hạng dịch vụ theo doanh thu đã thanh toán.</p>
                    </div>
                    <Button variant="outline-primary" onClick={() => navigate("/admin/categories")}>Quản lý danh mục</Button>
                </div>

                {serviceStats.length === 0 ? <Alert variant="light" className="border mb-0">Chưa có dữ liệu booking theo dịch vụ.</Alert> : <>
                    <ServiceRevenueChart services={serviceStats} />
                    <Table bordered hover responsive className="mt-4 mb-0 align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Dịch vụ</th>
                                <th className="text-end">Booking</th>
                                <th className="text-end">Doanh thu đã trả</th>
                                <th style={{ width: "28%" }}>Tỷ trọng doanh thu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedServiceStats.map((item) => {
                                const paidRevenue = Number(item.paidRevenue || 0);
                                return <tr key={item.serviceId}>
                                    <td className="fw-semibold">{item.serviceName}</td>
                                    <td className="text-end">{number(item.bookingCount)}</td>
                                    <td className="text-end fw-semibold">{formatCurrency(paidRevenue)}</td>
                                    <td>
                                        <div style={styles.progressTrack} aria-label={`${Math.round((paidRevenue / topServiceRevenue) * 100)}%`}>
                                            <div style={{ ...styles.progressFill, width: `${Math.round((paidRevenue / topServiceRevenue) * 100)}%` }} />
                                        </div>
                                    </td>
                                </tr>;
                            })}
                        </tbody>
                    </Table>
                </>}
            </Card.Body>
        </Card>
    </div>;
};

export default AdminDashboard;