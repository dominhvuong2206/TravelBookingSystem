import { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Form, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MySpinner from "../../components/MySpinner";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { formatDate } from "../../utils/dateUtils";
import styles, { bookingResponsive } from "./BookingStyle";

const paymentMethods = [
    { value: "CASH", label: "Tiền mặt trực tiếp" },
    { value: "PAYPAL", label: "PayPal" },
    { value: "STRIPE", label: "Stripe" },
    { value: "MOMO", label: "MoMo" },
    { value: "ZALOPAY", label: "ZaloPay" },
];

const currency = (value) => `${Number(value || 0).toLocaleString()} VNĐ`;

const InfoItem = ({ icon, label, value }) => (
    <div style={styles.infoItem}>
        <span style={styles.infoIcon}><FontAwesomeIcon icon={icon} /></span>
        <span>
            <span style={styles.infoLabel}>{label}</span>
            <span style={styles.infoValue} className="d-block">{value || "Chưa cập nhật"}</span>
        </span>
    </div>
);

const Booking = () => {
    const { serviceId } = useParams();
    const nav = useNavigate();
    const [service, setService] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState("CASH");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [err, setErr] = useState("");

    useEffect(() => {
        const loadService = async () => {
            try {
                setLoading(true);
                const res = await Apis.get(endpoints["product-details"](serviceId));
                setService(res.data);
            } catch (ex) {
                console.error(ex);
                setErr("Không tải được dịch vụ.");
            } finally {
                setLoading(false);
            }
        };
        loadService();
    }, [serviceId]);

    const submit = async (e) => {
        e.preventDefault();

        if (quantity <= 0) {
            setErr("Số lượng phải lớn hơn 0.");
            return;
        }

        if (service.availableSlots !== null && service.availableSlots !== undefined && Number(quantity) > Number(service.availableSlots)) {
            setErr("Số lượng đặt vượt quá số chỗ còn lại.");
            return;
        }

        try {
            setSubmitting(true);
            setErr("");
            const res = await authApis().post(endpoints["bookings"], {
                serviceId,
                quantity: String(quantity),
                paymentMethod,
                note,
            });
            const gatewayEndpoints = {
                PAYPAL: endpoints["paypal-create"],
                STRIPE: endpoints["stripe-create"],
                MOMO: endpoints["momo-create"],
                ZALOPAY: endpoints["zalopay-create"],
            };

            if (gatewayEndpoints[paymentMethod]) {
                const paymentRes = await authApis().post(gatewayEndpoints[paymentMethod], {
                    bookingId: res.data.id,
                });

                if (paymentRes.data?.payUrl) {
                    window.location.href = paymentRes.data.payUrl;
                    return;
                }

                setErr("Không nhận được đường dẫn thanh toán.");
                return;
            }

            nav("/my-bookings", { state: { createdBookingId: res.data.id } });
        } catch (ex) {
            console.error(ex);
            const data = ex.response?.data;
            setErr(typeof data === "string" ? data : data?.error || "Đặt dịch vụ thất bại.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading)
        return <MySpinner />;

    if (!service)
        return <Alert variant="warning" className="mt-3">Không tìm thấy dịch vụ.</Alert>;

    const total = Number(service.price || 0) * Number(quantity || 0);
    const soldOut = Number(service.availableSlots || 0) <= 0;

    return <div style={styles.page}>
        <style>{bookingResponsive}</style>
        <h3 style={styles.title}>Đặt dịch vụ</h3>
        {err && <Alert variant="danger">{err}</Alert>}

        <Row className="g-4">
            <Col lg={7}>
                <Card style={styles.serviceCard}>
                    {service.image && <Card.Img variant="top" src={service.image} style={styles.image} />}
                    <Card.Body style={styles.body}>
                        <Card.Title style={styles.serviceTitle}>{service.name}</Card.Title>
                        <Card.Text style={styles.serviceDesc}>{service.description}</Card.Text>
                        <div style={styles.infoGrid} className="booking-responsive-grid">
                            <InfoItem icon="fa-solid fa-location-dot" label="Địa điểm" value={service.location} />
                            <InfoItem icon="fa-solid fa-plane" label="Khởi hành từ" value={service.departureLocation} />
                            <InfoItem icon="fa-solid fa-calendar-days" label="Ngày khởi hành" value={formatDate(service.departureDate)} />
                            <InfoItem icon="fa-solid fa-user-group" label="Số chỗ còn" value={soldOut ? "Hết chỗ" : `${service.availableSlots ?? 0} chỗ`} />
                        </div>
                    </Card.Body>
                </Card>
            </Col>

            <Col lg={5}>
                <Card style={styles.formCard} className="booking-responsive-form">
                    <Card.Body style={styles.formBody}>
                        <h5 style={styles.formTitle}>
                            <FontAwesomeIcon icon="fa-solid fa-credit-card" className="text-primary" />
                            Thông tin đặt dịch vụ
                        </h5>

                        <Form onSubmit={submit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Số lượng</Form.Label>
                                <Form.Control
                                    type="number"
                                    min={1}
                                    max={service.availableSlots || undefined}
                                    value={quantity}
                                    onChange={e => setQuantity(e.target.value)}
                                    disabled={soldOut}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Phương thức thanh toán</Form.Label>
                                <Form.Select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                                    {paymentMethods.map(method => <option value={method.value} key={method.value}>{method.label}</option>)}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Ghi chú</Form.Label>
                                <Form.Control as="textarea" rows={3} value={note} onChange={e => setNote(e.target.value)} />
                            </Form.Group>

                            <div style={styles.totalBox}>
                                <div style={styles.totalLabel}>Tổng tiền</div>
                                <div style={styles.totalValue}>{currency(total)}</div>
                            </div>

                            <Button type="submit" variant="success" disabled={submitting || soldOut} style={styles.submitButton}>
                                {submitting ? <><FontAwesomeIcon icon="fa-solid fa-spinner" spin className="me-2" />Đang đặt...</> : <><FontAwesomeIcon icon="fa-solid fa-circle-check" className="me-2" />Xác nhận đặt dịch vụ</>}
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    </div>;
};

export default Booking;
