import { useCallback, useContext, useEffect, useState } from "react";
import { Alert, Badge, Button, Spinner, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { authApis, endpoints } from "../../configs/Apis";
import { ChatContext } from "../../configs/Contexts";

const statusBadge = {
    PENDING: { bg: "warning", text: "Chờ xác nhận" },
    CONFIRMED: { bg: "success", text: "Đã xác nhận" },
    CANCELLED: { bg: "secondary", text: "Đã hủy" },
};

const paymentStatusText = {
    PAID: "Đã thanh toán",
    UNPAID: "Chưa thanh toán",
    FAILED: "Thanh toán thất bại",
};

const paymentStatusVariant = {
    PAID: "success",
    UNPAID: "warning",
    FAILED: "danger",
};

const ServiceBookings = () => {
    const { serviceId } = useParams();
    const nav = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [err, setErr] = useState("");
    const { openBookingChat } = useContext(ChatContext);

    const loadBookings = useCallback(async () => {
        try {
            setLoading(true);
            const res = await authApis().get(endpoints["provider-service-bookings"](serviceId));
            setBookings(res.data);
        } catch (ex) {
            console.error(ex);
            setErr("Không tải được danh sách booking.");
        } finally {
            setLoading(false);
        }
    }, [serviceId]);

    useEffect(() => {
        loadBookings();
    }, [loadBookings]);

    const action = async (request, successMessage) => {
        try {
            setErr("");
            await request();
            setMessage(successMessage);
            loadBookings();
        } catch (ex) {
            console.error(ex);
            setErr(ex.response?.data || "Thao tác thất bại.");
        }
    };

    if (loading)
        return <div className="text-center mt-5"><Spinner animation="border" /></div>;

    return <div className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Booking của dịch vụ #{serviceId}</h3>
            <Button variant="outline-secondary" onClick={() => nav("/provider/services")}>Quay lại</Button>
        </div>

        {message && <Alert variant="success" dismissible onClose={() => setMessage("")}>{message}</Alert>}
        {err && <Alert variant="danger">{err}</Alert>}

        {bookings.length === 0 ? <Alert variant="info">Dịch vụ này chưa có booking.</Alert> : <Table bordered hover responsive>
            <thead className="table-light">
                <tr>
                    <th>ID</th>
                    <th>Khách hàng</th>
                    <th>Dịch vụ</th>
                    <th>Số lượng</th>
                    <th>Tổng tiền</th>
                    <th>Thanh toán</th>
                    <th>Trạng thái</th>
                    <th>Ngày đặt</th>
                    <th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                {bookings.map(booking => {
                    const status = statusBadge[booking.status] || { bg: "secondary", text: booking.status };
                    const canMarkPaid = booking.status !== "CANCELLED" && booking.paymentStatus !== "PAID" && booking.paymentStatus !== "FAILED";

                    return <tr key={booking.id}>
                        <td>{booking.id}</td>
                        <td>
                            <div>{booking.customerId?.firstName} {booking.customerId?.lastName}</div>
                            <div className="text-muted small">{booking.customerId?.email}</div>
                        </td>
                        <td>{booking.serviceNameSnapshot}</td>
                        <td>{booking.quantity}</td>
                        <td>{Number(booking.totalPrice || 0).toLocaleString()} VNĐ</td>
                        <td>
                            <Badge bg={paymentStatusVariant[booking.paymentStatus] || "secondary"}>
                                {paymentStatusText[booking.paymentStatus] || booking.paymentStatus}
                            </Badge>
                            <div className="small text-muted">{booking.paymentMethod}</div>
                        </td>
                        <td><Badge bg={status.bg}>{status.text}</Badge></td>
                        <td>{booking.createdDate ? new Date(booking.createdDate).toLocaleString("vi-VN") : ""}</td>
                        <td>
                            <div className="d-flex gap-2 flex-wrap">
                                <Button size="sm" variant="outline-primary" onClick={() => openBookingChat(booking)}>
                                    Chat
                                </Button>
                                {booking.status === "PENDING" && <Button size="sm" variant="success" onClick={() => action(
                                    () => authApis().put(endpoints["provider-confirm-booking"](booking.id)),
                                    "Đã xác nhận booking."
                                )}>Xác nhận</Button>}
                                {booking.status !== "CANCELLED" && <Button size="sm" variant="outline-danger" onClick={() => action(
                                    () => authApis().put(endpoints["provider-cancel-booking"](booking.id)),
                                    "Đã hủy booking."
                                )}>Hủy</Button>}
                                {canMarkPaid && <Button size="sm" variant="outline-primary" onClick={() => action(
                                    () => authApis().put(endpoints["provider-mark-booking-paid"](booking.id)),
                                    "Đã đánh dấu thanh toán."
                                )}>Đã thanh toán</Button>}
                            </div>
                        </td>
                    </tr>;
                })}
            </tbody>
        </Table>}
    </div>;
};

export default ServiceBookings;
