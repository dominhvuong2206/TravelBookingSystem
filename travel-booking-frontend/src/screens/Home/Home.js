import { useCallback, useContext, useEffect, useState } from "react";
import { Alert, Button, ButtonGroup, Card, Col, Form, Row } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MySpinner from "../../components/MySpinner";
import Apis, { endpoints } from "../../configs/Apis";
import { ChatContext, CompareContext, MyUserContext } from "../../configs/Contexts";
import { formatDate } from "../../utils/dateUtils";
import { normalizeRole } from "../../utils/authUtils";
import styles, { homeResponsive } from "./HomeStyle";

const PAGE_SIZE = 20;

const initialFilters = (q) => ({
    cateId: q.get("cateId") || "",
    location: q.get("location") || "",
    fromPrice: q.get("fromPrice") || "",
    toPrice: q.get("toPrice") || "",
    departureDate: q.get("departureDate") || "",
    sort: q.get("sort") || "",
});

const Home = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [q] = useSearchParams();
    const [filters, setFilters] = useState(initialFilters(q));
    const [, compareDispatch] = useContext(CompareContext);
    const { openServiceChat } = useContext(ChatContext);
    const [user] = useContext(MyUserContext);
    const nav = useNavigate();
    const role = normalizeRole(user);

    const buildQuery = useCallback((targetPage = page, includePage = true) => {
        const params = new URLSearchParams();
        if (includePage)
            params.set("page", String(targetPage));

        q.forEach((value, key) => {
            if (value)
                params.set(key, value);
        });

        return params.toString();
    }, [page, q]);

    const loadCategories = async () => {
        const res = await Apis.get(endpoints["categories"]);
        setCategories(res.data);
    };

    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);
            const [productsRes, countRes] = await Promise.all([
                Apis.get(`${endpoints["products"]}?${buildQuery(page, true)}`),
                Apis.get(`${endpoints["products-count"]}?${buildQuery(page, false)}`),
            ]);

            setProducts(productsRes.data);
            setTotal(countRes.data);
        } finally {
            setLoading(false);
        }
    }, [buildQuery, page]);

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    useEffect(() => {
        setFilters(initialFilters(q));
        setPage(1);
    }, [q]);

    const updateFilter = (field, value) => {
        setFilters(current => ({ ...current, [field]: value }));
    };

    const filterServices = (e) => {
        e.preventDefault();

        const params = new URLSearchParams();
        const kw = q.get("kw");
        if (kw)
            params.set("kw", kw);

        Object.entries(filters).forEach(([key, value]) => {
            if (value)
                params.set(key, value);
        });

        nav(`/?${params.toString()}`);
    };

    const clearFilters = () => {
        nav("/");
    };

    const heroSearch = (e) => {
        e.preventDefault();
        const value = e.currentTarget.elements.heroKw.value.trim();
        nav(value ? `/?kw=${encodeURIComponent(value)}` : "/");
    };

    const openChat = (service) => {
        if (!user) {
            nav("/login");
            return;
        }

        if (role !== "ROLE_CUSTOMER") {
            window.alert("Chỉ khách hàng mới có thể chat trực tiếp với nhà cung cấp từ trang dịch vụ.");
            return;
        }

        openServiceChat(service);
    };

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const visiblePages = Array.from({ length: totalPages }, (_, i) => i + 1);
    const isSearching = q.toString().length > 0;

    return (
        <>
            <style>{homeResponsive}</style>

            {!isSearching && <section style={styles.hero} className="home-hero">
                <div style={styles.heroContent}>
                    <div style={styles.heroTag}>
                        <FontAwesomeIcon icon="fa-solid fa-plane" />
                        Hệ thống đặt dịch vụ du lịch trực tuyến
                    </div>
                    <h1 style={styles.heroTitle} className="home-hero-title">Tìm dịch vụ phù hợp cho chuyến đi tiếp theo</h1>
                    <p style={styles.heroSub}>Tìm tour, khách sạn, vé phương tiện, combo du lịch và quản lý giao dịch trong một hệ thống thống nhất.</p>
                    <Form onSubmit={heroSearch} style={styles.heroSearch} className="home-hero-search">
                        <Form.Control name="heroKw" placeholder="Bạn muốn đi đâu hoặc đặt dịch vụ gì?" />
                        <Button type="submit" variant="primary" className="d-inline-flex align-items-center justify-content-center text-nowrap px-4">
                            <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" className="me-2" />
                            Tìm
                        </Button>
                    </Form>
                </div>
            </section>}

            <div style={styles.sectionHeader} className="home-section-header">
                <h3 style={styles.sectionTitle}>Khám phá dịch vụ</h3>
                <span style={styles.countText}>{total} dịch vụ đang hoạt động</span>
            </div>

            <div style={styles.categoryPills}>
                <Button size="sm" variant={!filters.cateId ? "primary" : "outline-primary"} onClick={() => nav("/")}>Tất cả</Button>
                {categories.slice(0, 10).map(c => <Button
                    key={c.id}
                    size="sm"
                    variant={String(filters.cateId) === String(c.id) ? "primary" : "outline-primary"}
                    onClick={() => nav(`/?cateId=${c.id}`)}
                >
                    {c.name}
                </Button>)}
            </div>

            <Form onSubmit={filterServices} style={styles.filterCard} className="home-filter-card">
                <Row className="g-2 align-items-end">
                    <Col xs={12} md={3}>
                        <Form.Label>Danh mục</Form.Label>
                        <Form.Select value={filters.cateId} onChange={e => updateFilter("cateId", e.target.value)}>
                            <option value="">Tất cả</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </Form.Select>
                    </Col>

                    <Col xs={12} md={3}>
                        <Form.Label>Địa điểm</Form.Label>
                        <Form.Control value={filters.location} onChange={e => updateFilter("location", e.target.value)} placeholder="Ví dụ: Đà Lạt" />
                    </Col>

                    <Col xs={6} md={2}>
                        <Form.Label>Giá từ</Form.Label>
                        <Form.Control type="number" min="0" value={filters.fromPrice} onChange={e => updateFilter("fromPrice", e.target.value)} />
                    </Col>

                    <Col xs={6} md={2}>
                        <Form.Label>Giá đến</Form.Label>
                        <Form.Control type="number" min="0" value={filters.toPrice} onChange={e => updateFilter("toPrice", e.target.value)} />
                    </Col>

                    <Col xs={12} md={2}>
                        <Form.Label>Ngày khởi hành</Form.Label>
                        <Form.Control type="date" value={filters.departureDate} onChange={e => updateFilter("departureDate", e.target.value)} />
                    </Col>

                    <Col xs={12} md={3}>
                        <Form.Label>Sắp xếp</Form.Label>
                        <Form.Select value={filters.sort} onChange={e => updateFilter("sort", e.target.value)}>
                            <option value="">Mới nhất</option>
                            <option value="priceAsc">Giá tăng dần</option>
                            <option value="priceDesc">Giá giảm dần</option>
                            <option value="ratingDesc">Đánh giá cao nhất</option>
                            <option value="popularDesc">Phổ biến nhất</option>
                            <option value="departureDateAsc">Khởi hành gần nhất</option>
                        </Form.Select>
                    </Col>

                    <Col xs={12} md="auto">
                        <Button type="submit" variant="primary">
                            <FontAwesomeIcon icon="fa-solid fa-sliders" className="me-2" />
                            Lọc
                        </Button>
                    </Col>

                    <Col xs={12} md="auto">
                        <Button type="button" variant="outline-secondary" onClick={clearFilters}>Xóa lọc</Button>
                    </Col>
                </Row>
            </Form>

            {products.length === 0 && !loading && <Alert variant="info" className="mt-2">Không có dịch vụ nào.</Alert>}

            <Row>
                {products.map(p => (
                    <Col xs={12} md={4} lg={3} key={p.id} className="p-2">
                        <Card className="h-100 home-service-card" style={styles.serviceCard}>
                            <Card.Img variant="top" src={p.image} style={styles.serviceImg} />
                            <Card.Body>
                                <Card.Title style={styles.serviceTitle}>{p.name}</Card.Title>
                                <Card.Text>
                                    <strong style={styles.price}>{Number(p.price || 0).toLocaleString()} VNĐ</strong>
                                    {p.location && <span style={styles.metaLine}><FontAwesomeIcon icon="fa-solid fa-location-dot" />{p.location}</span>}
                                    {p.departureLocation && <span style={styles.metaLine}><FontAwesomeIcon icon="fa-solid fa-plane" />Khởi hành từ: {p.departureLocation}</span>}
                                    {p.departureDate && <span style={styles.metaLine}><FontAwesomeIcon icon="fa-solid fa-calendar-days" />{formatDate(p.departureDate)}</span>}
                                </Card.Text>
                                <div style={styles.cardActions}>
                                    <Button variant="primary" size="sm" onClick={() => nav(`/services/${p.id}/book`)}>Đặt dịch vụ</Button>
                                    <Button variant="outline-primary" size="sm" onClick={() => nav(`/services/${p.id}`)}>Chi tiết</Button>
                                    <Button variant="outline-primary" size="sm" onClick={() => openChat(p)}>
                                        <FontAwesomeIcon icon="fa-solid fa-comment-dots" className="me-1" />
                                        Liên hệ
                                    </Button>
                                    <Button variant="outline-primary" size="sm" onClick={() => compareDispatch({ type: "ADD", payload: p })}>So sánh</Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {total > 0 && <div className="d-flex justify-content-center align-items-center gap-2 my-3 flex-wrap">
                <Button variant="outline-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Trước</Button>
                <ButtonGroup>
                    {visiblePages.map(item => <Button
                        key={item}
                        variant={item === page ? "primary" : "outline-primary"}
                        onClick={() => setPage(item)}
                    >
                        {item}
                    </Button>)}
                </ButtonGroup>
                <Button variant="outline-secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Sau</Button>
                <span className="text-muted">Tổng {total} dịch vụ</span>
            </div>}

            {!isSearching && <section style={styles.ctaBand}>
                <div>
                    <h4 className="mb-1">Bạn là nhà cung cấp dịch vụ du lịch?</h4>
                    <div className="text-white-50">Đăng ký tài khoản provider để đăng dịch vụ và theo dõi booking, đánh giá, doanh thu.</div>
                </div>
                <Button variant="light" onClick={() => nav("/register")}>
                    <FontAwesomeIcon icon="fa-solid fa-handshake" className="me-2" />
                    Trở thành đối tác
                </Button>
            </section>}

            {loading && <MySpinner />}

        </>
    );
};

export default Home;

