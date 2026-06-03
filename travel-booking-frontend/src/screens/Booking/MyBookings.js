import { useEffect, useState } from "react";
import { useContext } from "react";
import { Alert, Badge, Button, Spinner, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { authApis, endpoints } from "../../configs/Apis";
import { ChatContext } from "../../configs/Contexts";

const PAGE_SIZE = 20;

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

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const { openBookingChat } = useContext(ChatContext);

    const loadBookings = async () => {
        try {
            setLoading(true);
            const [bookingsRes, countRes] = await Promise.all([
                authApis().get(`${endpoints["bookings"]}?page=${page}`),
                authApis().get(endpoints["bookings-count"]),
            ]);
            setBookings(bookingsRes.data);
            setCount(countRes.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBookings();
    }, [page]);

    const cancelBooking = async (booking) => {
        if (!window.confirm(`Hủy booking #${booking.id}?`))
            return;
        await authApis().put(endpoints["cancel-booking"](booking.id));
        setMessage("Đã hủy booking.");
        loadBookings();
    };

    const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

    if (loading)
        return <div className="text-center mt-5"><Spinner animation="border" /></div>;

    return <div className="mt-4">
        <h3 className="mb-3">Booking của tôi</h3>
        {message && <Alert variant="success" dismissible onClose={() => setMessage("")}>{message}</Alert>}

        {bookings.length === 0 ? <Alert variant="info">Bạn chưa có booking nào.</Alert> : <Table bordered hover responsive>
            <thead className="table-light">
                <tr>
                    <th>ID</th>
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
                    const serviceId = booking.serviceId?.id || booking.serviceId;
                    return <tr key={booking.id}>
                        <td>{booking.id}</td>
                        <td>
                            {serviceId ? <Link to={`/services/${serviceId}`} className="fw-semibold text-decoration-none">
                                {booking.serviceNameSnapshot}
                            </Link> : booking.serviceNameSnapshot}
                        </td>
                        <td>{booking.quantity}</td>
                        <td>{Number(booking.totalPrice || 0).toLocaleString()} VNĐ</td>
                        <td>{booking.paymentMethod} - {paymentStatusText[booking.paymentStatus] || booking.paymentStatus}</td>
                        <td><Badge bg={status.bg}>{status.text}</Badge></td>
                        <td>{booking.createdDate ? new Date(booking.createdDate).toLocaleString("vi-VN") : ""}</td>
                        <td>
                            <div className="d-flex gap-2 flex-wrap">
                                <Button size="sm" variant="outline-primary" onClick={() => openBookingChat(booking)}>
                                    Chat
                                </Button>
                                {booking.status === "PENDING" && <Button size="sm" variant="outline-danger" onClick={() => cancelBooking(booking)}>
                                    Hủy
                                </Button>}
                            </div>
                        </td>
                    </tr>;
                })}
            </tbody>
        </Table>}

        {count > PAGE_SIZE && <div className="d-flex justify-content-center align-items-center gap-2 my-4">
            <Button size="sm" variant="outline-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Trước
            </Button>
            <span>Trang {page}/{totalPages}</span>
            <Button size="sm" variant="outline-secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Sau
            </Button>
        </div>}
    </div>;
};

export default MyBookings;

