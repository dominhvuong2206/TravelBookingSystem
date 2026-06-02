import { useRef, useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useNavigate } from "react-router-dom";
import MySpinner from "../../components/MySpinner";
import Apis, { endpoints } from "../../configs/Apis";
import styles from "./RegisterStyle";

const Register = () => {
    const [user, setUser] = useState({ userRole: "ROLE_CUSTOMER" });
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);
    const avatar = useRef();
    const nav = useNavigate();

    const updateUser = (field, value) => setUser({ ...user, [field]: value });

    const validate = () => {
        if (user.password !== user.confirm) {
            setErr("Mật khẩu không khớp.");
            return false;
        }

        if (user.userRole === "ROLE_PROVIDER" && (!user.companyName || !user.address)) {
            setErr("Nhà cung cấp cần nhập tên công ty và địa chỉ.");
            return false;
        }

        setErr("");
        return true;
    };

    const register = async (e) => {
        e.preventDefault();

        if (!validate())
            return;

        let form = new FormData();

        for (let key of Object.keys(user)) {
            if (key !== "confirm")
                form.append(key, user[key]);
        }

        if (avatar.current.files.length > 0)
            form.append("avatar", avatar.current.files[0]);

        try {
            setLoading(true);
            const res = await Apis.post(endpoints["register"], form, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            if (res.status === 201)
                nav("/login");
        } catch (ex) {
            console.error(ex);
            setErr("Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.");
        } finally {
            setLoading(false);
        }
    };

    return <div style={styles.page}>
        <div style={styles.card}>
            <div style={styles.header}>
                <div style={styles.iconWrap}>
                    <FontAwesomeIcon icon="fa-solid fa-user-plus" />
                </div>
                <div>
                    <h1 style={styles.title}>Đăng ký tài khoản</h1>
                    <p style={styles.subtitle}>Tạo tài khoản khách hàng hoặc nhà cung cấp dịch vụ du lịch.</p>
                </div>
            </div>

            {err && <Alert variant="danger">{err}</Alert>}

            <Form onSubmit={register}>
                <Form.Group className="mb-3" controlId="userRole">
                    <Form.Label>Vai trò</Form.Label>
                    <Form.Select value={user.userRole} onChange={e => updateUser("userRole", e.target.value)}>
                        <option value="ROLE_CUSTOMER">Khách hàng</option>
                        <option value="ROLE_PROVIDER">Nhà cung cấp dịch vụ</option>
                    </Form.Select>
                </Form.Group>

                <div style={styles.sectionTitle}>Thông tin cá nhân</div>
                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3" controlId="lastName">
                            <Form.Label>Họ và tên lót</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập họ và tên lót"
                                value={user.lastName || ""}
                                onChange={e => updateUser("lastName", e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3" controlId="firstName">
                            <Form.Label>Tên</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập tên"
                                value={user.firstName || ""}
                                onChange={e => updateUser("firstName", e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3" controlId="phone">
                            <Form.Label>Số điện thoại</Form.Label>
                            <Form.Control
                                type="tel"
                                placeholder="Nhập số điện thoại"
                                value={user.phone || ""}
                                onChange={e => updateUser("phone", e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3" controlId="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Nhập email"
                                value={user.email || ""}
                                onChange={e => updateUser("email", e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <div style={styles.sectionTitle}>Thông tin đăng nhập</div>
                <Row>
                    <Col md={4}>
                        <Form.Group className="mb-3" controlId="username">
                            <Form.Label>Tên đăng nhập</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nhập tên đăng nhập"
                                value={user.username || ""}
                                onChange={e => updateUser("username", e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group className="mb-3" controlId="password">
                            <Form.Label>Mật khẩu</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Nhập mật khẩu"
                                value={user.password || ""}
                                onChange={e => updateUser("password", e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group className="mb-3" controlId="confirm">
                            <Form.Label>Xác nhận mật khẩu</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Nhập lại mật khẩu"
                                value={user.confirm || ""}
                                onChange={e => updateUser("confirm", e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Col>
                </Row>

                {user.userRole === "ROLE_PROVIDER" && <>
                    <div style={styles.sectionTitle}>Thông tin nhà cung cấp</div>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="companyName">
                                <Form.Label>Tên công ty</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Tên công ty hoặc đơn vị cung cấp dịch vụ"
                                    value={user.companyName || ""}
                                    onChange={e => updateUser("companyName", e.target.value)}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="address">
                                <Form.Label>Địa chỉ</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Địa chỉ liên hệ"
                                    value={user.address || ""}
                                    onChange={e => updateUser("address", e.target.value)}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </>}

                <Form.Group className="mb-4" controlId="avatar">
                    <Form.Label>Ảnh đại diện</Form.Label>
                    <Form.Control ref={avatar} type="file" accept="image/*" required />
                </Form.Group>

                <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
                    <p style={styles.footerText}>
                        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                    </p>
                    {loading ? <MySpinner /> : <Button variant="primary" type="submit" style={styles.button}>
                        Đăng ký
                    </Button>}
                </div>
            </Form>
        </div>
    </div>;
};

export default Register;
