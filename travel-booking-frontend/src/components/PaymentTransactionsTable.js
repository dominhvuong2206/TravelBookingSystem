import { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Form, Spinner, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { authApis } from "../configs/Apis";

const PAGE_SIZE = 20;

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

const formatCurrency = (value) => new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
}).format(Number(value || 0));

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
    const [actionId, setActionId] = useState(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const queryString = useCallback(() => {
        const params = new URLSearchParams({ page: String(page) });
        if (showFilters && status)
            params.set("status", status);
        if (showFilters && paymentMethod)
            params.set("paymentMethod", paymentMethod);
        return params.toString();
    }, [page, paymentMethod, showFilters, status]);

    const loadPayments = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const query = queryString();
            const [paymentsResponse, countResponse] = await Promise.all([
                authApis().get(`${listEndpoint}?${query}`),
                authApis().get(`${countEndpoint}${showFilters ? `?${query}` : ""}`),
            ]);
            setPayments(paymentsResponse.data || []);
            setTotal(Number(countResponse.data || 0));
        } catch (requestError) {
            console.error(requestError);
            setError("Không thể tải lịch sử giao dịch. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }, [countEndpoint, listEndpoint, queryString, showFilters]);

    useEffect(() => {
        loadPayments();
    }, [loadPayments]);

    const markPaid = async (transaction) => {
        if (!markPaidEndpoint)
            return;

        try {
            setActionId(transaction.id);
            setError("");
            await authApis().put(markPaidEndpoint(transaction.id));
            setMessage(`Đã xác nhận giao dịch ${transaction.providerTransactionId || `#${transaction.id}`} là đã thanh toán.`);
            await loadPayments();
        } catch (requestError) {
            console.error(requestError);
            const data = requestError?.response?.data;
            setError(typeof data === "string" && data.trim() ? data : "Không thể xác nhận giao dịch.");
        } finally {
            setActionId(null);
        }
    };

    const changeFilter = (setter, value) => {
        setter(value);
        setPage(1);
    };

    const clearFilters = () => {
        setStatus("");
        setPaymentMethod("");
        setPage(1);
    };

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const hasFilters = Boolean(status || paymentMethod);

    return <div className="mt-4 mb-5">
        <div className="d-flex justify-content-between align-items-end gap-3 flex-wrap mb-4">
            <div>
                <p className="text-primary fw-bold small mb-1">TRANSACTION CENTER</p>
                <h1 className="h3 fw-bold mb-1">{title}</h1>
                <p className="text-muted mb-0">Theo dõi và đối soát trạng thái thanh toán của các booking.</p>
            </div>
            <Button variant="outline-secondary" disabled={loading} onClick={loadPayments}>
                <FontAwesomeIcon icon="fa-solid fa-rotate" className="me-2" />Làm mới
            </Button>
        </div>

        {message && <Alert variant="success" onClose={() => setMessage("")} dismissible>{message}</Alert>}
        {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}

        <Card className="border-0 shadow-sm">
            {showFilters && <Card.Header className="bg-white border-0 pt-3">
                <div className="d-flex gap-2 flex-wrap align-items-center">
                    <Form.Select aria-label="Lọc theo trạng thái" style={{ maxWidth: 220 }} value={status} onChange={(event) => changeFilter(setStatus, event.target.value)}>
                        <option value="">Tất cả trạng thái</option>
                        {Object.entries(statusText).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </Form.Select>
                    <Form.Select aria-label="Lọc theo phương thức" style={{ maxWidth: 220 }} value={paymentMethod} onChange={(event) => changeFilter(setPaymentMethod, event.target.value)}>
                        <option value="">Tất cả phương thức</option>
                        {Object.entries(methodText).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </Form.Select>
                    {hasFilters && <Button variant="link" className="text-decoration-none" onClick={clearFilters}>Xóa bộ lọc</Button>}
                    <span className="ms-auto text-muted small">{total.toLocaleString("vi-VN")} giao dịch</span>
                </div>
            </Card.Header>}
            <Card.Body className="p-0">
                {loading ? <div className="text-center py-5"><Spinner animation="border" /><div className="text-muted mt-2">Đang tải giao dịch...</div></div> : payments.length === 0 ? <Alert variant="light" className="border m-3">Chưa có giao dịch phù hợp với bộ lọc.</Alert> : <Table bordered hover responsive className="align-middle mb-0">
                    <thead className="table-light">
                        <tr>
                            <th>Mã giao dịch</th>
                            <th>Dịch vụ</th>
                            <th>Khách hàng</th>
                            <th>Phương thức</th>
                            <th className="text-end">Số tiền</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                            {canMarkPaid && <th>Thao tác</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map((payment) => <tr key={payment.id}>
                            <td><code>{payment.providerTransactionId || `#${payment.id}`}</code></td>
                            <td>{payment.bookingId?.serviceNameSnapshot || <span className="text-muted">Không xác định</span>}</td>
                            <td>{payment.bookingId?.customerId?.username || <span className="text-muted">Không xác định</span>}</td>
                            <td>{methodText[payment.paymentMethod] || payment.paymentMethod}</td>
                            <td className="text-end fw-semibold">{formatCurrency(payment.amount)}</td>
                            <td><Badge bg={statusVariant[payment.status] || "secondary"} text={payment.status === "PENDING" ? "dark" : undefined}>{statusText[payment.status] || payment.status}</Badge></td>
                            <td>{payment.createdDate ? new Date(payment.createdDate).toLocaleString("vi-VN") : ""}</td>
                            {canMarkPaid && <td>
                                {payment.bookingId?.status !== "CANCELLED" && payment.status !== "PAID" ? <Button size="sm" variant="success" disabled={actionId !== null} onClick={() => markPaid(payment)}>
                                    {actionId === payment.id ? <Spinner size="sm" /> : "Xác nhận đã trả"}
                                </Button> : <span className="text-muted small">Không có thao tác</span>}
                            </td>}
                        </tr>)}
                    </tbody>
                </Table>}
            </Card.Body>
            {!loading && payments.length > 0 && totalPages > 1 && <Card.Footer className="bg-white d-flex gap-2 align-items-center justify-content-end">
                <Button size="sm" variant="outline-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Trước</Button>
                <span className="small text-muted">Trang {page}/{totalPages}</span>
                <Button size="sm" variant="outline-secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Sau</Button>
            </Card.Footer>}
        </Card>
    </div>;
};

export default PaymentTransactionsTable;