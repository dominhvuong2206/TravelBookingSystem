import { useEffect, useState } from "react";
import { Alert, Badge, Button, Form, Table } from "react-bootstrap";
import MySpinner from "./MySpinner";
import { authApis } from "../configs/Apis";

const methodText = {
    CASH: "Tiền mặt",
    PAYPAL: "PayPal",
    STRIPE: "Stripe",
    MOMO: "MoMo",
    ZALOPAY: "ZaloPay",
};

const statusText = {
    PENDING: "Chờ thanh toán",
    PAID: "Đã thanh toán",
    FAILED: "Thất bại",
    REFUNDED: "Đã hoàn tiền",
};

const statusVariant = {
    PENDING: "warning",
    PAID: "success",
    FAILED: "danger",
    REFUNDED: "secondary",
};

const PaymentTransactionsTable = ({
    title,
    listEndpoint,
    countEndpoint,
    markPaidEndpoint,
    showFilters = false,
    canMarkPaid = false,
}) => {
    const [payments, setPayments] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [status, setStatus] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const queryString = () => {
        const params = new URLSearchParams({ page });
        if (showFilters && status)
            params.set("status", status);
        if (showFilters && paymentMethod)
            params.set("paymentMethod", paymentMethod);
        return params.toString();
    };

    const loadPayments = async () => {
        try {
            setLoading(true);
            setErr("");
            const query = queryString();
            const [paymentsRes, countRes] = await Promise.all([
                authApis().get(`${listEndpoint}?${query}`),
                authApis().get(`${countEndpoint}${showFilters ? `?${query}` : ""}`),
            ]);
            setPayments(paymentsRes.data);
            setTotal(countRes.data);
        } catch (ex) {
            console.error(ex);
            setErr("Không tải được lịch sử giao dịch.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPayments();
    }, [page, status, paymentMethod]);

    const markPaid = async (transactionId) => {
        if (!markPaidEndpoint)
            return;

        try {
            setErr("");
            await authApis().put(markPaidEndpoint(transactionId));
            loadPayments();
        } catch (ex) {
            console.error(ex);
            setErr("Không xác nhận được giao dịch.");
        }
    };

    const changeFilter = (setter, value) => {
        setter(value);
        setPage(1);
    };

    const totalPages = Math.max(1, Math.ceil(total / 20));

    return <div className="mt-4">
        <h3 className="mb-3">{title}</h3>
        {err && <Alert variant="danger">{err}</Alert>}

        {showFilters && <div className="d-flex gap-2 flex-wrap mb-3">
            <Form.Select style={{ maxWidth: 220 }} value={status} onChange={e => changeFilter(setStatus, e.target.value)}>
                <option value="">Tất cả trạng thái</option>
                {Object.entries(statusText).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </Form.Select>
            <Form.Select style={{ maxWidth: 220 }} value={paymentMethod} onChange={e => changeFilter(setPaymentMethod, e.target.value)}>
                <option value="">Tất cả phương thức</option>
                {Object.entries(methodText).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </Form.Select>
        </div>}

        {loading ? <MySpinner /> : payments.length === 0 ? <Alert variant="info">Chưa có giao dịch nào.</Alert> : <>
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Mã giao dịch</th>
                        <th>Dịch vụ</th>
                        <th>Khách hàng</th>
                        <th>Phương thức</th>
                        <th>Số tiền</th>
                        <th>Trạng thái</th>
                        <th>Ngày tạo</th>
                        {canMarkPaid && <th>Thao tác</th>}
                    </tr>
                </thead>
                <tbody>
                    {payments.map(p => <tr key={p.id}>
                        <td>{p.providerTransactionId}</td>
                        <td>{p.bookingId?.serviceNameSnapshot}</td>
                        <td>{p.bookingId?.customerId?.username}</td>
                        <td>{methodText[p.paymentMethod] || p.paymentMethod}</td>
                        <td>{Number(p.amount || 0).toLocaleString()} VNĐ</td>
                        <td>
                            <Badge bg={statusVariant[p.status] || "secondary"}>{statusText[p.status] || p.status}</Badge>
                        </td>
                        <td>{p.createdDate ? new Date(p.createdDate).toLocaleString("vi-VN") : ""}</td>
                        {canMarkPaid && <td>
                            {p.bookingId?.status !== "CANCELLED" && p.status !== "PAID" && <Button size="sm" variant="success" onClick={() => markPaid(p.id)}>
                                Xác nhận đã thanh toán
                            </Button>}
                        </td>}
                    </tr>)}
                </tbody>
            </Table>

            <div className="d-flex gap-2 align-items-center justify-content-end">
                <Button variant="outline-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Trước</Button>
                <span>Trang {page}/{totalPages}</span>
                <Button variant="outline-secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Sau</Button>
            </div>
        </>}
    </div>;
};

export default PaymentTransactionsTable;
