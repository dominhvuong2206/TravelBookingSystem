import { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Button, Form, Modal, Spinner, Table } from "react-bootstrap";
import { authApis, endpoints } from "../../configs/Apis";

const emptyForm = {
    name: "",
    slug: "",
    description: "",
    active: true,
};

const toSlug = (value) => value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [err, setErr] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const loadCategories = useCallback(async () => {
        try {
            setLoading(true);
            setErr("");
            const res = await authApis().get(endpoints["admin-categories"]);
            setCategories(res.data);
        } catch (ex) {
            console.error(ex);
            setErr("Không tải được danh mục.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
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
        setShowModal(true);
    };

    const updateForm = (field, value) => {
        setForm(current => {
            const next = { ...current, [field]: value };
            if (field === "name" && !editing)
                next.slug = toSlug(value);
            return next;
        });
    };

    const saveCategory = async (e) => {
        e.preventDefault();

        try {
            setErr("");
            const payload = {
                ...form,
                active: String(form.active),
            };

            if (editing)
                await authApis().put(endpoints["admin-category-update"](editing.id), payload);
            else
                await authApis().post(endpoints["admin-categories"], payload);

            setMessage(editing ? "Đã cập nhật danh mục." : "Đã thêm danh mục.");
            setShowModal(false);
            loadCategories();
        } catch (ex) {
            console.error(ex);
            setErr(ex.response?.data || "Không lưu được danh mục.");
        }
    };

    const toggleActive = async (categoryId) => {
        await authApis().put(endpoints["admin-toggle-category-active"](categoryId));
        setMessage("Đã cập nhật trạng thái danh mục.");
        loadCategories();
    };

    if (loading)
        return <div className="text-center mt-5"><Spinner animation="border" /></div>;

    return <div className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Quản lý danh mục dịch vụ</h3>
            <Button onClick={openCreate}>Thêm danh mục</Button>
        </div>

        {message && <Alert variant="success" onClose={() => setMessage("")} dismissible>{message}</Alert>}
        {err && <Alert variant="danger">{err}</Alert>}

        <Table bordered hover responsive>
            <thead className="table-light">
                <tr>
                    <th>ID</th>
                    <th>Tên danh mục</th>
                    <th>Slug</th>
                    <th>Mô tả</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                {categories.map(category => <tr key={category.id}>
                    <td>{category.id}</td>
                    <td>{category.name}</td>
                    <td>{category.slug}</td>
                    <td>{category.description}</td>
                    <td>
                        <Badge bg={category.active ? "success" : "secondary"}>
                            {category.active ? "Hoạt động" : "Đã ẩn"}
                        </Badge>
                    </td>
                    <td>
                        <div className="d-flex gap-2 flex-wrap">
                            <Button size="sm" variant="outline-primary" onClick={() => openEdit(category)}>Sửa</Button>
                            <Button size="sm" variant={category.active ? "outline-secondary" : "outline-success"} onClick={() => toggleActive(category.id)}>
                                {category.active ? "Ẩn" : "Hiện"}
                            </Button>
                        </div>
                    </td>
                </tr>)}
            </tbody>
        </Table>

        <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Form onSubmit={saveCategory}>
                <Modal.Header closeButton>
                    <Modal.Title>{editing ? "Sửa danh mục" : "Thêm danh mục"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Tên danh mục</Form.Label>
                        <Form.Control value={form.name} onChange={e => updateForm("name", e.target.value)} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Slug</Form.Label>
                        <Form.Control value={form.slug} onChange={e => updateForm("slug", e.target.value)} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Mô tả</Form.Label>
                        <Form.Control as="textarea" rows={3} value={form.description} onChange={e => updateForm("description", e.target.value)} />
                    </Form.Group>
                    <Form.Check
                        type="switch"
                        label="Hoạt động"
                        checked={form.active}
                        onChange={e => updateForm("active", e.target.checked)}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" type="button" onClick={() => setShowModal(false)}>Hủy</Button>
                    <Button variant="primary" type="submit">Lưu</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    </div>;
};

export default CategoryManagement;
