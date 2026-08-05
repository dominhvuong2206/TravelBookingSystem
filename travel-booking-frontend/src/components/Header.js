import { useContext, useEffect, useState } from "react";
import { Button, Container, Dropdown, Form, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Apis, { endpoints } from "../configs/Apis";
import { CompareContext, MyUserContext } from "../configs/Contexts";
import { normalizeRole } from "../utils/authUtils";
import styles, { headerResponsive } from "./HeaderStyle";

const roleLinks = {
    ROLE_ADMIN: [
        { to: "/admin/dashboard", label: "Dashboard", icon: "fa-solid fa-gauge-high" },
        { to: "/admin/users", label: "Người dùng", icon: "fa-solid fa-user-group" },
        { to: "/admin/categories", label: "Danh mục", icon: "fa-solid fa-gear" },
        { to: "/admin/payments", label: "Giao dịch", icon: "fa-solid fa-credit-card" },
    ],
    ROLE_PROVIDER: [
        { to: "/provider/services", label: "Dịch vụ của tôi", icon: "fa-solid fa-ticket" },
        { to: "/provider/reviews", label: "Đánh giá", icon: "fa-solid fa-star" },
        { to: "/provider/stats", label: "Thống kê", icon: "fa-solid fa-sliders" },
        { to: "/provider/payments", label: "Giao dịch", icon: "fa-solid fa-credit-card" },
    ],
    ROLE_CUSTOMER: [
        { to: "/my-bookings", label: "Đơn đặt dịch vụ", icon: "fa-solid fa-calendar-check" },
        { to: "/compare", label: "So sánh", icon: "fa-solid fa-exchange-alt" },
    ],
};

const Header = () => {
    const [categories, setCategories] = useState([]);
    const [keyword, setKeyword] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const [user, dispatch] = useContext(MyUserContext);
    const [compareList] = useContext(CompareContext);
    const role = normalizeRole(user);
    const hideSearchPaths = ["/", "/login", "/register"];
    const showHeaderSearch = !hideSearchPaths.includes(location.pathname);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await Apis.get(endpoints.categories);
                setCategories(response.data || []);
            } catch (error) {
                console.error("Could not load navigation categories", error);
            }
        };

        loadCategories();
    }, []);

    const search = (event) => {
        event.preventDefault();
        const value = keyword.trim();
        navigate(value ? `/?kw=${encodeURIComponent(value)}` : "/");
    };

    const navLinkStyle = (path) => ({
        ...styles.navLink,
        ...(location.pathname === path ? styles.navLinkActive : {}),
    });

    return <header style={styles.wrapper} className="app-header">
        <style>{headerResponsive}</style>
        <Navbar expand="lg" style={styles.navbar}>
            <Container>
                <Navbar.Brand as={Link} to="/" style={styles.brand}>
                    <img
                        src={process.env.PUBLIC_URL + "/travel-booking-logo.png"}
                        alt=""
                        aria-hidden="true"
                        style={styles.brandLogo}
                    />
                    <span style={styles.brandCopy}>
                        <span style={styles.brandName}>Travel Booking</span>
                        <span style={styles.brandTagline}>Dịch vụ du lịch trực tuyến</span>
                    </span>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="travel-main-nav" />
                <Navbar.Collapse id="travel-main-nav">
                    <Nav className="me-auto align-items-lg-center">
                        <Link to="/" style={navLinkStyle("/")} className="app-header-nav-link">
                            <FontAwesomeIcon icon="fa-solid fa-house" />
                            <span className="app-header-nav-text">Trang chủ</span>
                        </Link>

                        <NavDropdown title={<span><FontAwesomeIcon icon="fa-solid fa-layer-group" className="me-2" />Danh mục</span>} id="category-nav-dropdown">
                            <Link className="dropdown-item" to="/">Tất cả dịch vụ</Link>
                            {categories.map((category) => <Link className="dropdown-item" key={category.id} to={`/?cateId=${category.id}`}>{category.name}</Link>)}
                        </NavDropdown>

                        {(roleLinks[role] || []).map((item) => <Link to={item.to} style={navLinkStyle(item.to)} className="app-header-nav-link" key={item.to}>
                            <FontAwesomeIcon icon={item.icon} />
                            <span className="app-header-nav-text">{item.to === "/my-bookings" ? "Booking" : item.label}</span>
                            {item.to === "/compare" && compareList.length > 0 && <span className="badge bg-primary ms-1">{compareList.length}</span>}
                        </Link>)}
                    </Nav>

                    {showHeaderSearch && <Form onSubmit={search} style={styles.searchForm} className="app-header-search">
                        <span style={styles.searchInputWrap}>
                            <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" style={styles.searchIcon} />
                            <Form.Control
                                placeholder="Tìm dịch vụ"
                                aria-label="Tìm dịch vụ"
                                value={keyword}
                                onChange={(event) => setKeyword(event.target.value)}
                                style={styles.searchInput}
                            />
                        </span>
                        <Button type="submit" variant="primary">Tìm</Button>
                    </Form>}

                    <div className="d-flex align-items-center gap-2 ms-lg-3 mt-3 mt-lg-0">
                        {user === null ? <>
                            <Link to="/login" style={styles.authLink}>
                                <FontAwesomeIcon icon="fa-solid fa-right-from-bracket" />
                                Đăng nhập
                            </Link>
                            <Button as={Link} to="/register" variant="outline-primary">
                                <FontAwesomeIcon icon="fa-solid fa-user-plus" className="me-1" />
                                Đăng ký
                            </Button>
                        </> : <Dropdown align="end">
                            <Dropdown.Toggle as="button" style={styles.userToggle}>
                                {user.avatar && <img src={user.avatar} style={styles.avatar} alt={user.username} />}
                                <span>Chào {user.username}</span>
                            </Dropdown.Toggle>
                            <Dropdown.Menu style={styles.userMenu}>
                                <div style={styles.userMenuHeader}>
                                    <div className="fw-bold">{user.firstName} {user.lastName}</div>
                                    <div className="text-muted small">{user.username}</div>
                                </div>
                                <Dropdown.Item as={Link} to="/profile">
                                    <FontAwesomeIcon icon="fa-solid fa-user" className="me-2" />
                                    Hồ sơ cá nhân
                                </Dropdown.Item>
                                {role === "ROLE_CUSTOMER" && <Dropdown.Item as={Link} to="/my-bookings">
                                    <FontAwesomeIcon icon="fa-solid fa-calendar-check" className="me-2" />
                                    Đơn đặt dịch vụ
                                </Dropdown.Item>}
                                {role === "ROLE_CUSTOMER" && <Dropdown.Item as={Link} to="/my-payments">
                                    <FontAwesomeIcon icon="fa-solid fa-credit-card" className="me-2" />
                                    Lịch sử giao dịch
                                </Dropdown.Item>}
                                <Dropdown.Divider />
                                <Dropdown.Item className="text-danger" onClick={() => dispatch({ type: "LOGOUT" })}>
                                    <FontAwesomeIcon icon="fa-solid fa-right-from-bracket" className="me-2" />
                                    Đăng xuất
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>}
                    </div>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    </header>;
};

export default Header;