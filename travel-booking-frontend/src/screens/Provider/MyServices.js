import { useEffect, useState } from "react";
import { Alert, Badge, Button, ButtonGroup, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { formatDate } from "../../utils/dateUtils";
import styles from "./MyServicesStyle";

const PAGE_SIZE = 20;

const MyServices = () => {
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({ kw: "", cateId: "", status: "" });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const nav = useNavigate();

    const buildQuery = () => {
        const params = new URLSearchParams({ page: String(page) });
        Object.entries(filters).forEach(([key, value]) => {
            if (value)
                params.set(key, value);
        });
        return params.toString();
    };

    const loadCategories = async () => {
        const res = await Apis.get(endpoints["categories"]);
        setCategories(res.data);
    };

    const loadServices = async () => {
        try {
            setLoading(true);
            const query = buildQuery();
            const [servicesRes, countRes] = await Promise.all([
                authApis().get(`${endpoints["provider-services"]}?${query}`),
                authApis().get(`${endpoints["provider-services-count"]}?${query}`),
            ]);
            setServices(servicesRes.data);
            setCount(countRes.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        loadServices();
    }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

    const updateFilter = (field, value) => {
        setFilters(current => ({ ...current, [field]: value }));
    };

    const filterServices = (e) => {
        e.preventDefault();
        setPage(1);
        loadServices();
    };

    const clearFilters = () => {
        setFilters({ kw: "", cateId: "", status: "" });
        setPage(1);
    };

    useEffect(() => {
        if (page === 1)
            loadServices();
    }, [filters]); 

    const deleteService = async (service) => {
        if (!window.confirm(`Xóa vĩnh viễn dịch vụ "${service.name}"?`))
            return;

        await authApis().delete(endpoints["provider-service-delete"](service.id));
        setMessage("Đã xóa dịch vụ.");
        loadServices();
    };

    const toggleStatus = async (service) => {
        await authApis().put(endpoints["provider-service-toggle-status"](service.id));
        setMessage(service.status === "ACTIVE" ? "Đã tạm dừng dịch vụ." : "Đã kích hoạt dịch vụ.");
        loadServices();
    };

    const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
    const visiblePages = Array.from({ length: totalPages }, (_, i) => i + 1);

    if (loading)
        return <div className="text-center mt-5"><Spinner animation="border" /></div>;

    return <div className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Dịch vụ của tôi</h3>
            <Button variant="primary" onClick={() => nav("/provider/services/add")}>Thêm dịch vụ</Button>
        </div>

        {message && <Alert variant="success" dismissible onClose={() => setMessage("")}>{message}</Alert>}

        <Form onSubmit={filterServices} className="border rounded p-3 mb-3 bg-light">
            <Row className="g-2 align-items-end">
                <Col xs={12} md={4}>
                    <Form.Label>Tên dịch vụ</Form.Label>
                    <Form.Control value={filters.kw} onChange={e => updateFilter("kw", e.target.value)} placeholder="Tìm theo tên..." />
                </Col>
                <Col xs={12} md={3}>
                    <Form.Label>Danh mục</Form.Label>
                    <Form.Select value={filters.cateId} onChange={e => updateFilter("cateId", e.target.value)}>
                        <option value="">Tất cả</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </Form.Select>
                </Col>
                <Col xs={12} md={3}>
                    <Form.Label>Trạng thái</Form.Label>
                    <Form.Select value={filters.status} onChange={e => updateFilter("status", e.target.value)}>
                        <option value="">Tất cả</option>
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="INACTIVE">Tạm dừng</option>
                    </Form.Select>
                </Col>
                <Col xs={12} md="auto">
                    <Button type="submit">Lọc</Button>
                </Col>
                <Col xs={12} md="auto">
                    <Button type="button" variant="outline-secondary" onClick={clearFilters}>Xóa lọc</Button>
                </Col>
            </Row>
        </Form>

        {services.length === 0 ? <Alert variant="info">Bạn chưa có dịch vụ nào.</Alert> : <Row className="g-3">
            {services.map(service => <Col xs={12} md={6} lg={4} key={service.id}>
                <Card className="h-100">
                    <Card.Img
                        variant="top"
                        src={service.image || "https://placehold.co/600x360?text=Travel"}
                        style={{ height: 180, objectFit: "cover" }}
                    />
                    <Card.Body>
                        <div className="d-flex justify-content-between align-items-start gap-2">
                            <Card.Title className="mb-1">{service.name}</Card.Title>
                            <Badge bg={service.status === "ACTIVE" ? "success" : "secondary"}>
                                {service.status === "ACTIVE" ? "Hoạt động" : "Tạm dừng"}
                            </Badge>
                        </div>
                        <div className="text-muted small mb-2">{service.categoryId?.name} - {service.location}</div>
                        <div><strong style={styles.pricePill}>{Number(service.price || 0).toLocaleString()} VNĐ</strong></div>
                        <div className="small">Còn {service.availableSlots ?? 0} chỗ</div>
                        {service.departureLocation && <div className="small text-muted">Khởi hành từ: {service.departureLocation}</div>}
                        {service.departureDate && <div className="small text-muted">Ngày khởi hành: {formatDate(service.departureDate)}</div>}
                    </Card.Body>
                    <Card.Footer className="d-flex gap-2 flex-wrap">
                        <Button size="sm" variant="outline-info" onClick={() => nav(`/provider/services/${service.id}/bookings`)}>
                            Booking
                        </Button>
                        <Button size="sm" variant="outline-warning" onClick={() => nav(`/provider/services/${service.id}/edit`)}>
                            Sửa
                        </Button>
                        <Button size="sm" variant={service.status === "ACTIVE" ? "outline-secondary" : "outline-success"} onClick={() => toggleStatus(service)}>
                            {service.status === "ACTIVE" ? "Tạm dừng" : "Kích hoạt"}
                        </Button>
                        <Button size="sm" variant="outline-danger" onClick={() => deleteService(service)}>
                            Xóa
                        </Button>
                    </Card.Footer>
                </Card>
            </Col>)}
        </Row>}

        {count > 0 && <div className="d-flex justify-content-center align-items-center gap-2 my-4 flex-wrap">
            <Button size="sm" variant="outline-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Trước
            </Button>
            <ButtonGroup>
                {visiblePages.map(item => <Button
                    key={item}
                    size="sm"
                    variant={item === page ? "primary" : "outline-primary"}
                    onClick={() => setPage(item)}
                >
                    {item}
                </Button>)}
            </ButtonGroup>
            <Button size="sm" variant="outline-secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Sau
            </Button>
            <span className="text-muted">Tổng {count} dịch vụ</span>
        </div>}
    </div>;
};

export default MyServices;
