import { useEffect, useMemo, useState } from "react";
import { Alert, Card, Form, Spinner, Table } from "react-bootstrap";
import { RevenueBarChart, formatCurrency } from "./RevenueCharts";
import { authApis } from "../configs/Apis";

const RevenueByMonth = ({ endpoint, title }) => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    useEffect(() => {
        const loadRevenue = async () => {
            try {
                setLoading(true);
                setErr("");
                const res = await authApis().get(`${endpoint}?year=${year}`);
                setData(res.data);
            } catch (ex) {
                console.error(ex);
                setErr("Không tải được doanh thu theo tháng.");
            } finally {
                setLoading(false);
            }
        };
        loadRevenue();
    }, [endpoint, year]);

    const rows = useMemo(() => {
        const values = data?.values || data?.byMonth || {};
        return Array.from({ length: 12 }, (_, i) => {
            const month = i + 1;
            return {
                key: month,
                label: `Tháng ${month}`,
                value: Number(values[month] || 0),
            };
        });
    }, [data]);

    return <Card className="mt-4">
        <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <Card.Title className="mb-0">{title}</Card.Title>
                <Form.Select style={{ width: 120 }} value={year} onChange={e => setYear(Number(e.target.value))}>
                    {[0, 1, 2, 3, 4].map(offset => {
                        const item = new Date().getFullYear() - offset;
                        return <option key={item} value={item}>{item}</option>;
                    })}
                </Form.Select>
            </div>

            {err && <Alert variant="danger">{err}</Alert>}

            {loading ? <div className="text-center py-3"><Spinner size="sm" /></div> : data && <>
                <RevenueBarChart rows={rows} title="Doanh thu hệ thống" />

                <Table bordered hover responsive className="mt-4">
                    <thead className="table-light">
                        <tr>
                            <th>Tháng</th>
                            <th className="text-end">Doanh thu</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(row => <tr key={row.key}>
                            <td>{row.label}</td>
                            <td className="text-end">{row.value > 0 ? formatCurrency(row.value) : "-"}</td>
                        </tr>)}
                        <tr className="table-primary fw-bold">
                            <td>Tổng cộng</td>
                            <td className="text-end">{formatCurrency(data.total)}</td>
                        </tr>
                    </tbody>
                </Table>
            </>}
        </Card.Body>
    </Card>;
};

export default RevenueByMonth;
