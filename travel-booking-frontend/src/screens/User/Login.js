import { useContext, useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import MySpinner from "../../components/MySpinner";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { MyUserContext } from "../../configs/Contexts";
import { normalizeRole } from "../../utils/authUtils";
import styles from "./LoginStyle";

const defaultPathByRole = {
    ROLE_ADMIN: "/admin/dashboard",
    ROLE_PROVIDER: "/provider/services",
    ROLE_CUSTOMER: "/",
};

const canAccessPath = (role, path) => {
    if (!path || path === "/403" || path === "/login" || path === "/register")
        return false;

    if (path.startsWith("/admin"))
        return role === "ROLE_ADMIN";

    if (path.startsWith("/provider"))
        return role === "ROLE_PROVIDER";

    if (path.startsWith("/my-bookings") || path.startsWith("/my-payments") || path.includes("/book"))
        return role === "ROLE_CUSTOMER";

    return true;
};

const Login = () => {
    const [user, setUser] = useState({});
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);
    const [, dispatch] = useContext(MyUserContext);
    const [q] = useSearchParams();
    const nav = useNavigate();

    const validate = () => {
        if (!user.username || !user.password) {
            setErr("Vui lòng nhập tên đăng nhập và mật khẩu.");
            return false;
        }

        setErr("");
        return true;
    };

    const login = async (e) => {
        e.preventDefault();

        if (!validate())
            return;

        try {
            setLoading(true);

            let res = await Apis.post(endpoints["login"], { ...user });
            let profile = await authApis(res.data.token).get(endpoints["profile"]);

            dispatch({
                type: "LOGIN",
                payload: {
                    user: profile.data,
                    token: res.data.token,
                },
            });

            const role = normalizeRole(profile.data);
            const fallback = defaultPathByRole[role] || "/";
            const next = q.get("next");
            const decodedNext = next ? decodeURIComponent(next) : "";

            nav(canAccessPath(role, decodedNext) ? decodedNext : fallback);
        } catch (ex) {
            console.error(ex);
            setErr("Tên đăng nhập hoặc mật khẩu không đúng.");
        } finally {
            setLoading(false);
        }
    };

    return <div style={styles.page}>
        <div style={styles.card}>
            <div style={styles.iconWrap}>
                <FontAwesomeIcon icon="fa-solid fa-right-to-bracket" />
            </div>
            <h1 style={styles.title}>Đăng nhập</h1>
            <p style={styles.subtitle}>Truy cập tài khoản để quản lý booking, giao dịch và dịch vụ du lịch.</p>

            {err && <Alert variant="danger">{err}</Alert>}

            <Form onSubmit={login}>
                <Form.Group className="mb-3" controlId="username">
                    <Form.Label>Tên đăng nhập</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Nhập tên đăng nhập"
                        value={user.username || ""}
                        onChange={e => setUser({ ...user, username: e.target.value })}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-4" controlId="password">
                    <Form.Label>Mật khẩu</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Nhập mật khẩu"
                        value={user.password || ""}
                        onChange={e => setUser({ ...user, password: e.target.value })}
                        required
                    />
                </Form.Group>

                {loading ? <MySpinner /> : <Button variant="primary" type="submit" style={styles.button}>
                    Đăng nhập
                </Button>}
            </Form>

            <p style={styles.linkText}>
                Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
            </p>
        </div>
    </div>;
};

export default Login;
