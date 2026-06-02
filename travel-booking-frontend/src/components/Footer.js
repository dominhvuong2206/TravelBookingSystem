import { useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./FooterStyle";

const Footer = () => {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);
    const year = new Date().getFullYear();

    const subscribe = (e) => {
        e.preventDefault();
        setSubscribed(true);
        setEmail("");
    };

    return (
        <footer style={styles.footer}>
            <Container>
                <Row className="g-4 py-5">
                    <Col md={4} lg={3}>
                        <div style={styles.brand}>Travel Booking</div>
                        <p style={styles.tagline}>
                            Nền tảng tìm kiếm, đặt dịch vụ và quản lý giao dịch du lịch trực tuyến cho khách hàng, nhà cung cấp và quản trị viên.
                        </p>
                        <div style={styles.contactItem}>
                            <FontAwesomeIcon icon="fa-solid fa-location-dot" style={styles.icon} />
                            TP. Hồ Chí Minh, Việt Nam
                        </div>
                        <div style={styles.contactItem}>
                            <FontAwesomeIcon icon="fa-solid fa-envelope" style={styles.icon} />
                            support@travelbooking.vn
                        </div>
                        <div style={styles.contactItem}>
                            <FontAwesomeIcon icon="fa-solid fa-headset" style={styles.icon} />
                            Hỗ trợ 24/7
                        </div>
                    </Col>

                    <Col xs={6} md={4} lg={2}>
                        <div style={styles.colTitle}>Khám phá</div>
                        <Link to="/" style={styles.link}>Trang chủ</Link>
                        <Link to="/?cateId=1" style={styles.link}>Tour du lịch</Link>
                        <Link to="/?cateId=2" style={styles.link}>Khách sạn</Link>
                        <Link to="/?cateId=3" style={styles.link}>Vé máy bay</Link>
                    </Col>

                    <Col xs={6} md={4} lg={2}>
                        <div style={styles.colTitle}>Tài khoản</div>
                        <Link to="/profile" style={styles.link}>Hồ sơ cá nhân</Link>
                        <Link to="/my-bookings" style={styles.link}>Đơn đặt dịch vụ</Link>
                        <Link to="/my-payments" style={styles.link}>Giao dịch</Link>
                        <Link to="/compare" style={styles.link}>So sánh</Link>
                    </Col>

                    <Col md={6} lg={2}>
                        <div style={styles.colTitle}>Thanh toán</div>
                        <div className="d-flex gap-2 flex-wrap">
                            {["Tiền mặt", "PayPal", "Stripe", "MoMo", "ZaloPay"].map(method => (
                                <span style={styles.paymentBadge} key={method}>{method}</span>
                            ))}
                        </div>
                    </Col>

                    <Col md={6} lg={3}>
                        <div style={styles.newsletterBox}>
                            <div style={styles.colTitle}>Nhận thông tin dịch vụ mới</div>
                            <p style={styles.tagline}>Theo dõi ưu đãi, tour mới và lịch khởi hành phù hợp.</p>
                            <Form onSubmit={subscribe} className="d-flex gap-2">
                                <Form.Control
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="Email của bạn"
                                    style={styles.input}
                                    required
                                />
                                <Button type="submit">
                                    <FontAwesomeIcon icon="fa-solid fa-paper-plane" />
                                </Button>
                            </Form>
                            {subscribed && <div className="text-info small mt-2">Đã ghi nhận email của bạn.</div>}
                        </div>
                    </Col>
                </Row>

                <div style={styles.divider} />
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 py-3">
                    <span style={styles.copy}>© {year} Travel Booking</span>
                    <span style={styles.copy}>Minh bạch giao dịch · Bảo mật tài khoản · Quản lý dịch vụ tập trung</span>
                </div>
            </Container>
        </footer>
    );
};

export default Footer;
