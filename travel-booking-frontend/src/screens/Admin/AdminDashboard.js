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
            <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                    <div>
                        <div style={styles.metricLabel}>{label}</div>
                        <p style={{ ...styles.metricValue, color }}>{value}</p>
                    </div>
                    <FontAwesomeIcon icon={icon} style={{ fontSize: 24, color }} />
                </div>
            </Card.Body>
        </Card>
    </Col>
);

const toRows = (data, config, fallbackYear) => {
    const values = data?.values || data?.byMonth || {};

    if (config.count) {
        return Array.from({ length: config.count }, (_, i) => {
            const key = i + 1;
            return { key, label: config.keyLabel(key), value: Number(values[key] || 0) };
        });
    }

    const rows = Object.entries(values).map(([key, value]) => ({
        key,
        label: config.keyLabel(key),
        value: Number(value || 0),
    }));

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
    const [err, setErr] = useState("");
    const nav = useNavigate();

    useEffect(() => {
        const loadOverview = async () => {
            try {
                setLoading(true);
                setErr("");
                const [summaryRes, servicesRes] = await Promise.all([
                    authApis().get(endpoints["admin-stats-summary"]),
                    authApis().get(endpoints["admin-stats-services"]),
                ]);
                setSummary(summaryRes.data);
                setServiceStats(servicesRes.data || []);
            } catch (ex) {
                console.error(ex);
                setErr("Không tải được báo cáo tổng quan hệ thống.");
            } finally {
                setLoading(false);
            }
        };

        loadOverview();
    }, []);

    useEffect(() => {
        const loadReports = async () => {
            try {
                setReportLoading(true);
                setErr("");
                const config = periodConfig[period];
                const query = config.needsYear ? `?year=${year}` : "";
                const [revenueRes, frequencyRes] = await Promise.all([
                    authApis().get(`${endpoints[config.revenueEndpoint]}${query}`),
                    authApis().get(`${endpoints[config.frequencyEndpoint]}${query}`),
                ]);
                setRevenue(revenueRes.data);
                setFrequency(frequencyRes.data);
            } catch (ex) {
                console.error(ex);
                setErr("Không tải được dữ liệu báo cáo.");
            } finally {
                setReportLoading(false);
            }
        };

        loadReports();
    }, [period, year]);

    const config = periodConfig[period];
    const revenueRows = useMemo(() => toRows(revenue, config, year), [revenue, config, year]);
    const frequencyRows = useMemo(() => toRows(frequency, config, year), [frequency, config, year]);

    const transactionStatusCounts = summary?.transactionStatusCounts || {};
    const revenueByPaymentMethod = summary?.revenueByPaymentMethod || {};
    const statusLabels = Object.keys(statusText).map(key => statusText[key]);
    const statusValues = Object.keys(statusText).map(key => Number(transactionStatusCounts[key] || 0));
    const methodLabels = Object.keys(methodText).map(key => methodText[key]);
    const methodValues = Object.keys(methodText).map(key => Number(revenueByPaymentMethod[key] || 0));

    const sortedServiceStats = useMemo(() => (
        [...serviceStats].sort((a, b) => Number(b.paidRevenue || 0) - Number(a.paidRevenue || 0))
    ), [serviceStats]);

    const topServiceRevenue = Math.max(...serviceStats.map(item => Number(item.paidRevenue || 0)), 1);

    if (loading)
        return <div className="text-center mt-5"><Spinner animation="border" /></div>;

    return <div style={styles.page}>
        <div style={styles.header}>
            <div>
                <h3 style={styles.title}>Báo cáo tổng quan hệ thống</h3>
                <p style={styles.subtitle}>Theo dõi dịch vụ đang hoạt động, tần suất booking, doanh thu chung và các chỉ số phục vụ quản lý.</p>
            </div>
            <div className="d-flex gap-2 flex-wrap">
                <Button variant="outline-primary" onClick={() => nav("/admin/users")}>Quản lý người dùng</Button>
                <Button variant="outline-warning" onClick={() => nav("/admin/users")}>Duyệt provider</Button>
                <Button variant="outline-success" onClick={() => nav("/admin/payments")}>Giao dịch</Button>
            </div>
        </div>

        {err && <Alert variant="danger">{err}</Alert>}

        <Row className="g-3">
            <MetricCard label="Dịch vụ hoạt động" value={Number(summary?.activeServices || 0).toLocaleString("vi-VN")} icon="fa-solid fa-ticket" color="#2563eb" />
            <MetricCard label="Tổng dịch vụ" value={Number(summary?.totalServices || 0).toLocaleString("vi-VN")} icon="fa-solid fa-layer-group" color="#0ea5e9" />
            <MetricCard label="Tổng booking" value={Number(summary?.totalBookings || 0).toLocaleString("vi-VN")} icon="fa-solid fa-calendar-check" color="#16a34a" />
            <MetricCard label="Doanh thu chung" value={formatCurrency(summary?.paidRevenue)} icon="fa-solid fa-wallet" color="#dc2626" />
            <MetricCard label="Provider chờ duyệt" value={Number(summary?.pendingProviders || 0).toLocaleString("vi-VN")} icon="fa-solid fa-user-clock" color="#d97706" />
        </Row>

        <Card style={styles.card} className="mt-4">
            <Card.Body>
                <div style={styles.toolbar}>
                    <Card.Title className="mb-0" style={styles.tableTitle}>Tùy biến báo cáo theo kỳ</Card.Title>
                    <div className="d-flex gap-2 flex-wrap">
                        <ButtonGroup>
                            {Object.entries(periodConfig).map(([key, item]) => (
                                <Button key={key} variant={period === key ? "primary" : "outline-primary"} onClick={() => setPeriod(key)}>
                                    {item.label}
                                </Button>
                            ))}
                        </ButtonGroup>
                        {config.needsYear && <Form.Select style={{ width: 120 }} value={year} onChange={e => setYear(Number(e.target.value))}>
                            {[0, 1, 2, 3, 4].map(offset => {
                                const item = new Date().getFullYear() - offset;
                                return <option key={item} value={item}>{item}</option>;
                            })}
                        </Form.Select>}
                    </div>
                </div>

                {reportLoading ? <div className="text-center py-4"><Spinner size="sm" /></div> : <Row className="g-3">
                    <Col lg={6}>
                        <h5 className="mb-3">Tần suất đặt vé</h5>
                        <CountBarChart rows={frequencyRows} title="Số booking" />
                    </Col>
                    <Col lg={6}>
                        <h5 className="mb-3">Doanh thu chung</h5>
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
                <Card.Title style={styles.tableTitle}>Doanh thu theo từng dịch vụ</Card.Title>
                {serviceStats.length === 0 ? <p className="text-muted mb-0">Chưa có booking nào.</p> : <>
                    <ServiceRevenueChart services={serviceStats} />

                    <Table bordered hover responsive className="mt-4">
                        <thead className="table-light">
                            <tr>
                                <th>Dịch vụ</th>
                                <th className="text-end">Số booking</th>
                                <th className="text-end">Doanh thu đã thanh toán</th>
                                <th style={{ width: "28%" }}>Tỷ trọng doanh thu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedServiceStats.map(item => {
                                const paidRevenue = Number(item.paidRevenue || 0);
                                return <tr key={item.serviceId}>
                                    <td>{item.serviceName}</td>
                                    <td className="text-end">{Number(item.bookingCount || 0).toLocaleString("vi-VN")}</td>
                                    <td className="text-end fw-semibold">{formatCurrency(paidRevenue)}</td>
                                    <td>
                                        <div style={styles.progressTrack}>
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
