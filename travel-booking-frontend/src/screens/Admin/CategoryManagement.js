import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Card, Col, Form, Modal, Row, Spinner, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { authApis, endpoints } from "../../configs/Apis";

const emptyForm = {
    name: "",
    slug: "",
    description: "",
    active: true,
};

export const toSlug = (value) => value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const errorMessage = (error, fallback) => {
    const data = error?.response?.data;
    return typeof data === "string" && data.trim() ? data : fallback;
};

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [actionId, setActionId] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const loadCategories = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const response = await authApis().get(endpoints["admin-categories"]);
            setCategories(response.data || []);
        } catch (requestError) {
            console.error(requestError);
            setError("Không thể tải danh mục dịch vụ. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const counts = useMemo(() => ({
        total: categories.length,
        active: categories.filter((category) => category.active).length,
        hidden: categories.filter((category) => !category.active).length,
    }), [categories]);

    const closeModal = () => {
        if (saving)
            return;
        setShowModal(false);
        setEditing(null);
        setForm(emptyForm);
    };

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setError("");
        setShowModal(true);
    };

    const openEdit = (category) => {
        setEditing(category);
        setForm({
            name: category.name || "",
            slug: category.slug || "",
            description: category.description || "",
            active: Boolean(category.active),
        });
        setError("");
        setShowModal(true);
    };

    const updateForm = (field, value) => {
        setForm((current) => {
            const next = { ...current, [field]: value };
            if (field === "name" && !editing)
                next.slug = toSlug(value);
            return next;
        });
    };

    const saveCategory = async (event) => {
        event.preventDefault();
        const payload = {
            name: form.name.trim(),
            slug: form.slug.trim(),
            description: form.description.trim(),
            active: String(form.active),
        };

        try {
            setSaving(true);
            setError("");
            if (editing)
                await authApis().put(endpoints["admin-category-update"](editing.id), payload);
            else
                await authApis().post(endpoints["admin-categories"], payload);

            setMessage(editing ? "Đã cập nhật danh mục." : "Đã tạo danh mục mới.");
            setShowModal(false);
            setEditing(null);
            setForm(emptyForm);
            await loadCategories();
        } catch (requestError) {
            console.error(requestError);
            setError(errorMessage(requestError, "Không thể lưu danh mục."));
        } finally {
            setSaving(false);
        }
    };

    const toggleActive = async (category) => {
        try {
            setActionId(category.id);
            setError("");
            await authApis().put(endpoints["admin-toggle-category-active"](category.id));
            setMessage(`Đã ${category.active ? "ẩn" : "hiển thị"} danh mục ${category.name}.`);
            await loadCategories();
        } catch (requestError) {
            console.error(requestError);
            setError(errorMessage(requestError, "Không thể cập nhật trạng thái danh mục."));
        } finally {
            setActionId(null);
        }
    };

    return <div className="mt-4 mb-5">
        <div className="d-flex justify-content-between align-items-end gap-3 flex-wrap mb-4">
            <div>
                <p className="text-primary fw-bold small mb-1">ADMIN CONSOLE</p>
                <h1 className="h3 fw-bold mb-1">Danh mục dịch vụ</h1>
                <p className="text-muted mb-0">Tổ chức và kiểm soát các nhóm dịch vụ hiển thị trên marketplace.</p>
            </div>
            <div className="d-flex gap-2">
                <Button variant="outline-secondary" disabled={loading} onClick={loadCategories}>
                    <FontAwesomeIcon icon="fa-solid fa-rotate" className="me-2" />Làm mới
                </Button>
                <Button onClick={openCreate}>
                    <FontAwesomeIcon icon="fa-solid fa-plus" className="me-2" />Thêm danh mục
                </Button>
            </div>
        </div>

        <Row className="g-3 mb-4">
            <Col md={4}><Card className="border-0 shadow-sm h-100"><Card.Body><div className="text-muted small">Tổng danh mục</div><div className="fs-3 fw-bold">{counts.total}</div></Card.Body></Card></Col>
            <Col md={4}><Card className="border-0 shadow-sm h-100"><Card.Body><div className="text-muted small">Đang hoạt động</div><div className="fs-3 fw-bold text-success">{counts.active}</div></Card.Body></Card></Col>
            <Col md={4}><Card className="border-0 shadow-sm h-100"><Card.Body><div className="text-muted small">Đang ẩn</div><div className="fs-3 fw-bold text-secondary">{counts.hidden}</div></Card.Body></Card></Col>
        </Row>

        {message && <Alert variant="success" onClose={() => setMessage("")} dismissible>{message}</Alert>}
        {error && !showModal && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}

        <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
                {loading ? <div className="text-center py-5"><Spinner animation="border" /><div className="text-muted mt-2">Đang tải danh mục...</div></div> : categories.length === 0 ? <Alert variant="light" className="border m-3 mb-3">Chưa có danh mục dịch vụ. Hãy tạo danh mục đầu tiên.</Alert> : <Table bordered hover responsive className="align-middle mb-0">
                    <thead className="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Tên danh mục</th>
                            <th>Slug</th>
                            <th>Mô tả</th>
                            <th>Trạng thái</th>
                            <th style={{ minWidth: 150 }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => <tr key={category.id}>
                            <td>{category.id}</td>
                            <td className="fw-semibold">{category.name}</td>
                            <td><code>{category.slug}</code></td>
                            <td>{category.description || <span className="text-muted">Chưa có mô tả</span>}</td>
                            <td><Badge bg={category.active ? "success" : "secondary"}>{category.active ? "Hoạt động" : "Đã ẩn"}</Badge></td>
                            <td>
                                <div className="d-flex gap-2 flex-wrap">
                                    <Button size="sm" variant="outline-primary" disabled={actionId !== null} onClick={() => openEdit(category)}>Sửa</Button>
                                    <Button size="sm" variant={category.active ? "outline-danger" : "outline-success"} disabled={actionId !== null} onClick={() => toggleActive(category)}>
                                        {actionId === category.id ? <Spinner size="sm" /> : category.active ? "Ẩn" : "Hiển thị"}
                                    </Button>
                                </div>
                            </td>
                        </tr>)}
                    </tbody>
                </Table>}
            </Card.Body>
        </Card>

        <Modal show={showModal} onHide={closeModal} centered backdrop={saving ? "static" : true}>
            <Form onSubmit={saveCategory}>
                <Modal.Header closeButton={!saving}>
                    <Modal.Title>{editing ? "Cập nhật danh mục" : "Tạo danh mục mới"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form.Group className="mb-3">
                        <Form.Label>Tên danh mục</Form.Label>
                        <Form.Control autoFocus value={form.name} onChange={(event) => updateForm("name", event.target.value)} maxLength={100} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Slug</Form.Label>
                        <Form.Control value={form.slug} onChange={(event) => updateForm("slug", toSlug(event.target.value))} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxLength={120} required />
                        <Form.Text muted>Được dùng làm định danh thân thiện cho URL và bộ lọc.</Form.Text>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Mô tả</Form.Label>
                        <Form.Control as="textarea" rows={4} value={form.description} onChange={(event) => updateForm("description", event.target.value)} maxLength={500} />
                        <div className="text-end small text-muted mt-1">{form.description.length}/500</div>
                    </Form.Group>
                    <Form.Check type="switch" label="Hiển thị danh mục" checked={form.active} onChange={(event) => updateForm("active", event.target.checked)} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" type="button" disabled={saving} onClick={closeModal}>Hủy</Button>
                    <Button variant="primary" type="submit" disabled={saving || !form.name.trim() || !form.slug.trim()}>
                        {saving && <Spinner size="sm" className="me-2" />}{editing ? "Lưu thay đổi" : "Tạo danh mục"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    </div>;
};

export default CategoryManagement;