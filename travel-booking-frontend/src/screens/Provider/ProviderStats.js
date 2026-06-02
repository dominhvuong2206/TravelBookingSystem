import { useEffect, useMemo, useState } from "react";
import { Alert, Button, ButtonGroup, Card, Col, Form, Row, Spinner, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { RevenueBarChart, ServiceRevenueChart, formatCurrency } from "../../components/RevenueCharts";
import { authApis, endpoints } from "../../configs/Apis";
import styles from "./ProviderStatsStyle";

const periodConfig = {
    month: {
        label: "Theo tháng",
        endpoint: "provider-stats-revenue",
        keyLabel: (key) => `Tháng ${key}`,
        count: 12,
        needsYear: true,
    },
    quarter: {
        label: "Theo quý",
        endpoint: "provider-stats-revenue-quarter",
        keyLabel: (key) => `Quý ${key}`,
        count: 4,
        needsYear: true,
    },
    year: {
        label: "Theo năm",
        endpoint: "provider-stats-revenue-year",
        keyLabel: (key) => `Năm ${key}`,
        needsYear: false,
    },
};

const MetricCard = ({ label, value, icon, color }) => (
    <Col lg={3} sm={6}>
        <Card style={styles.card} className="h-100">
            <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                    <div>
                        <div style={styles.metricLabel}>{label}</div>
                        <p style={{ ...styles.metricValue, color }}>{value}</p>
                    </div>
                    <FontAwesomeIcon icon={icon} style={{ fontSize: 26, color }} />
                </div>
            </Card.Body>
        </Card>
    </Col>
);

const ProviderStats = () => {
    const [summary, setSummary] = useState(null);
    const [serviceStats, setServiceStats] = useState([]);
    const [revenue, setRevenue] = useState(null);
    const [period, setPeriod] = useState("month");
    const [year, setYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(false);
    const [revenueLoading, setRevenueLoading] = useState(false);
    const [err, setErr] = useState("");

    useEffect(() => {
        const loadOverview = async () => {
            try {
                setLoading(true);
                setErr("");
                const [summaryRes, servicesRes] = await Promise.all([
                    authApis().get(endpoints["provider-stats-summary"]),
                    authApis().get(endpoints["provider-stats-services"]),
                ]);
                setSummary(summaryRes.data);
                setServiceStats(servicesRes.data || []);
            } catch (ex) {
                console.error(ex);
                setErr("Không tải được thống kê nhà cung cấp.");
            } finally {
                setLoading(false);
            }
        };

        loadOverview();
    }, []);

    useEffect(() => {
        const loadRevenue = async () => {
            try {
                setRevenueLoading(true);
                setErr("");
                const config = periodConfig[period];
                const query = config.needsYear ? `?year=${year}` : "";
                const res = await authApis().get(`${endpoints[config.endpoint]}${query}`);
                setRevenue(res.data);
            } catch (ex) {
                console.error(ex);
                setErr("Không tải được doanh thu.");
            } finally {
                setRevenueLoading(false);
            }
        };

        loadRevenue();
    }, [period, year]);

    const revenueRows = useMemo(() => {
        const config = periodConfig[period];
        const values = revenue?.values || revenue?.byMonth || {};

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

        return rows.length > 0 ? rows : [{ key: year, label: `Năm ${year}`, value: 0 }];
    }, [period, revenue, year]);

    const sortedServiceStats = useMemo(() => (
        [...serviceStats].sort((a, b) => Number(b.paidRevenue || 0) - Number(a.paidRevenue || 0))
    ), [serviceStats]);

    const topServiceRevenue = Math.max(...serviceStats.map(item => Number(item.paidRevenue || 0)), 1);

    if (loading)
        return <div className="text-center mt-5"><Spinner animation="border" /></div>;

    return <div style={styles.page}>
        <div style={styles.header}>
            <div>
                <h3 style={styles.title}>Thống kê nhà cung cấp</h3>
                <p style={styles.subtitle}>Theo dõi doanh thu, booking và hiệu quả kinh doanh theo từng dịch vụ.</p>
            </div>
        </div>

        {err && <Alert variant="danger">{err}</Alert>}

        <Row className="g-3">
            <MetricCard label="Tổng dịch vụ" value={Number(summary?.totalServices || 0).toLocaleString("vi-VN")} icon="fa-solid fa-ticket" color="#2563eb" />
            <MetricCard label="Tổng booking" value={Number(summary?.totalBookings || 0).toLocaleString("vi-VN")} icon="fa-solid fa-user-group" color="#16a34a" />
            <MetricCard label="Booking chờ xác nhận" value={Number(summary?.pendingBookings || 0).toLocaleString("vi-VN")} icon="fa-solid fa-clock" color="#d97706" />
            <MetricCard label="Doanh thu đã thanh toán" value={formatCurrency(summary?.paidRevenue)} icon="fa-solid fa-wallet" color="#dc2626" />
        </Row>

        <Card style={styles.card} className="mt-4">
            <Card.Body>
                <div style={styles.toolbar}>
                    <Card.Title className="mb-0" style={styles.tableTitle}>Doanh thu theo kỳ</Card.Title>
                    <div className="d-flex gap-2 flex-wrap">
                        <ButtonGroup style={styles.periodButtons}>
                            {Object.entries(periodConfig).map(([key, config]) => (
                                <Button
                                    key={key}
                                    variant={period === key ? "primary" : "outline-primary"}
                                    onClick={() => setPeriod(key)}
                                >
                                    {config.label}
                                </Button>
                            ))}
                        </ButtonGroup>
                        {periodConfig[period].needsYear && <Form.Select style={{ width: 120 }} value={year} onChange={e => setYear(Number(e.target.value))}>
                            {[0, 1, 2, 3, 4].map(offset => {
                                const item = new Date().getFullYear() - offset;
                                return <option key={item} value={item}>{item}</option>;
                            })}
                        </Form.Select>}
                    </div>
                </div>

                {revenueLoading ? <div className="text-center py-4"><Spinner size="sm" /></div> :
                    <RevenueBarChart rows={revenueRows} title="Doanh thu đã thanh toán" />}
            </Card.Body>
        </Card>

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

export default ProviderStats;
