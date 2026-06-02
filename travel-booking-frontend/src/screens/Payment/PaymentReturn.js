import { useEffect, useState } from "react";
import { Alert, Button, Card, Spinner } from "react-bootstrap";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { authApis, endpoints } from "../../configs/Apis";
import styles from "./PaymentReturnStyle";

const methodName = {
    stripe: "Stripe",
    paypal: "PayPal",
    momo: "MoMo",
    zalopay: "ZaloPay",
};

const paymentStatusText = {
    UNPAID: "Chưa thanh toán",
    PAID: "Đã thanh toán",
};

const bookingStatusText = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    CANCELLED: "Đã hủy",
};

const transactionStatusText = {
    PENDING: "Chờ thanh toán",
    PAID: "Đã thanh toán",
    FAILED: "Thất bại",
    REFUNDED: "Đã hoàn tiền",
};

const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")} VNĐ`;

const InfoItem = ({ label, value, highlight = false }) => (
    <div style={styles.item}>
        <span style={styles.label}>{label}</span>
        <span style={highlight ? styles.highlight : styles.value}>{value || "Chưa cập nhật"}</span>
    </div>
);

const PaymentReturn = () => {
    const { method, bookingId } = useParams();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("pending");
    const [message, setMessage] = useState("");
    const [booking, setBooking] = useState(null);
    const [transaction, setTransaction] = useState(null);

    useEffect(() => {
        const loadPaymentDetails = async () => {
            if (!bookingId)
                return;

            const [bookingRes, paymentRes] = await Promise.all([
                authApis().get(endpoints["booking-details"](bookingId)),
                authApis().get(`${endpoints["payments"]}?page=1`),
            ]);

            setBooking(bookingRes.data);
            const found = paymentRes.data?.find(p => Number(p.bookingId?.id) === Number(bookingId));
            setTransaction(found || null);
        };

        const confirmPayment = async () => {
            try {
                setLoading(true);

                if (method === "stripe") {
                    const sessionId = searchParams.get("session_id");
                    if (!sessionId)
                        throw new Error("Thiếu mã phiên thanh toán Stripe.");

                    const res = await authApis().post(endpoints["stripe-confirm"], { sessionId });
                    if (res.data?.status === "paid") {
                        setStatus("success");
                        setMessage("Thanh toán Stripe đã hoàn tất.");
                    } else {
                        setStatus("pending");
                        setMessage("Stripe chưa xác nhận thanh toán hoàn tất.");
                    }
                } else if (method === "paypal") {
                    const paypalOrderId = searchParams.get("token");
                    if (!paypalOrderId)
                        throw new Error("Thiếu mã đơn PayPal.");

                    const res = await authApis().post(endpoints["paypal-capture"], {
                        paypalOrderId,
                        bookingId,
                    });
                    if (res.data?.status === "COMPLETED") {
                        setStatus("success");
                        setMessage(res.data?.alreadyCaptured
                            ? "PayPal đã ghi nhận thanh toán trước đó."
                            : "Thanh toán PayPal đã hoàn tất.");
                    } else {
                        setStatus("pending");
                        setMessage("PayPal chưa xác nhận thanh toán hoàn tất.");
                    }
                } else if (method === "momo") {
                    const resultCode = searchParams.get("resultCode");
                    setStatus(resultCode === "0" ? "success" : "pending");
                    setMessage(resultCode === "0"
                        ? "MoMo đã ghi nhận thanh toán. Hệ thống sẽ cập nhật sau khi nhận IPN."
                        : "MoMo chưa hoàn tất thanh toán.");
                } else if (method === "zalopay") {
                    setStatus("pending");
                    setMessage("ZaloPay sẽ cập nhật trạng thái sau khi hệ thống nhận phản hồi.");
                } else {
                    throw new Error("Phương thức thanh toán không hợp lệ.");
                }

                await loadPaymentDetails();
            } catch (ex) {
                console.error(ex);
                setStatus("error");
                setMessage(ex.response?.data?.error || ex.message || "Không xác nhận được thanh toán.");

                try {
                    await loadPaymentDetails();
                } catch (loadError) {
                    console.error(loadError);
                }
            } finally {
                setLoading(false);
            }
        };

        confirmPayment();
    }, [method, bookingId, searchParams]);

    const success = status === "success";
    const service = booking?.serviceId;
    const serviceId = service?.id;
    const transactionCode = transaction?.providerTransactionId || searchParams.get("token") || searchParams.get("session_id");

    return <div style={styles.page}>
        <Card style={styles.card}>
            <Card.Body style={styles.body}>
                {loading ? <>
                    <div style={{ ...styles.icon, ...styles.pendingIcon }}>
                        <Spinner size="sm" />
                    </div>
                    <h3 style={styles.title}>Đang xác nhận thanh toán</h3>
                    <p style={styles.text}>Vui lòng chờ hệ thống kiểm tra phản hồi từ {methodName[method] || method}.</p>
                </> : <>
                    <div style={{ ...styles.icon, ...(success ? styles.successIcon : styles.pendingIcon) }}>
                        <FontAwesomeIcon icon={success ? "fa-solid fa-check" : "fa-solid fa-clock"} />
                    </div>
                    <h3 style={styles.title}>{success ? "Thanh toán thành công" : "Trạng thái thanh toán"}</h3>
                    {message && <Alert variant={status === "error" ? "danger" : success ? "success" : "info"}>{message}</Alert>}

                    <div style={styles.summary}>
                        <InfoItem label="Mã booking" value={bookingId ? `#${bookingId}` : "Chưa cập nhật"} />
                        <InfoItem label="Dịch vụ" value={booking?.serviceNameSnapshot || service?.name} />
                        <InfoItem label="Phương thức" value={methodName[method] || method} />
                        <InfoItem label="Số tiền" value={money(transaction?.amount || booking?.totalPrice)} highlight />
                        <InfoItem label="Trạng thái thanh toán" value={transactionStatusText[transaction?.status] || paymentStatusText[booking?.paymentStatus] || transaction?.status || booking?.paymentStatus} />
                        <InfoItem label="Trạng thái booking" value={bookingStatusText[booking?.status] || booking?.status} />
                        <InfoItem label="Mã giao dịch" value={transactionCode} />
                        <InfoItem label="Ngày tạo" value={transaction?.createdDate ? new Date(transaction.createdDate).toLocaleString("vi-VN") : ""} />
                    </div>

                    {success && <div style={styles.note}>
                        <FontAwesomeIcon icon="fa-solid fa-receipt" className="me-2" />
                        Giao dịch đã được lưu trong hệ thống. Bạn có thể đối chiếu lại trong trang giao dịch hoặc theo dõi trạng thái booking.
                    </div>}

                    <div style={styles.actions}>
                        <Button as={Link} to="/my-payments" variant="primary">Xem giao dịch</Button>
                        <Button as={Link} to="/my-bookings" variant="outline-secondary">Xem booking</Button>
                        {serviceId && <Button as={Link} to={`/products/${serviceId}`} variant="outline-secondary">Chi tiết dịch vụ</Button>}
                        <Button as={Link} to="/" variant="outline-dark">Về trang chủ</Button>
                    </div>
                </>}
            </Card.Body>
        </Card>
    </div>;
};

export default PaymentReturn;
