import { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Form, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import MySpinner from "../../components/MySpinner";
import Apis, { authApis, endpoints } from "../../configs/Apis";

const emptyForm = {
    name: "",
    description: "",
    price: "",
    location: "",
    departureLocation: "",
    departureDate: "",
    availableSlots: "",
    categoryId: "",
    status: "ACTIVE",
};

const ServiceForm = () => {
    const { serviceId } = useParams();
    const isEdit = Boolean(serviceId);
    const nav = useNavigate();
    const [form, setForm] = useState(emptyForm);
    const [categories, setCategories] = useState([]);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [err, setErr] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const cateRes = await Apis.get(endpoints["categories"]);
                setCategories(cateRes.data);

                if (isEdit) {
                    const serviceRes = await Apis.get(endpoints["provider-service-details"](serviceId));
                    const service = serviceRes.data;
                    setForm({
                        name: service.name || "",
                        description: service.description || "",
                        price: service.price || "",
                        location: service.location || "",
                        departureLocation: service.departureLocation || "",
                        departureDate: service.departureDate ? new Date(service.departureDate).toISOString().slice(0, 10) : "",
                        availableSlots: service.availableSlots ?? "",
                        categoryId: service.categoryId?.id || "",
                        status: service.status || "ACTIVE",
                    });
                    setPreview(service.image || "");
                }
            } catch (ex) {
                console.error(ex);
                setErr("Không tải được dữ liệu.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [isEdit, serviceId]);

    const update = (field, value) => setForm({ ...form, [field]: value });

    const chooseImage = (e) => {
        const file = e.target.files[0];
        setImage(file || null);
        if (file)
            setPreview(URL.createObjectURL(file));
    };

    const validate = () => {
        if (!form.name.trim())
            return "Vui lòng nhập tên dịch vụ.";
        if (!form.description.trim())
            return "Vui lòng nhập mô tả.";
        if (!form.categoryId)
            return "Vui lòng chọn danh mục.";
        if (!form.price || Number(form.price) <= 0)
            return "Giá phải lớn hơn 0.";
        if (!form.location.trim())
            return "Vui lòng nhập địa điểm.";
        if (!form.departureLocation.trim())
            return "Vui lòng nhập nơi khởi hành.";
        if (!form.departureDate)
            return "Vui lòng chọn ngày khởi hành.";
        if (form.availableSlots === "" || Number(form.availableSlots) < 0)
            return "Số chỗ trống không hợp lệ.";
        if (!isEdit && !image)
            return "Vui lòng chọn hình ảnh.";
        return "";
    };

    const submit = async (e) => {
        e.preventDefault();
        const validationError = validate();
        if (validationError) {
            setErr(validationError);
            return;
        }

        const data = new FormData();
        Object.entries(form).forEach(([key, value]) => data.append(key, value));
        if (image)
            data.append("image", image);

        try {
            setSubmitting(true);
            setErr("");
            if (isEdit) {
                await authApis().put(endpoints["provider-service-update"](serviceId), data, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } else {
                await authApis().post(endpoints["provider-services"], data, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }
            nav("/provider/services");
        } catch (ex) {
            console.error(ex);
            setErr(ex.response?.data || "Lưu dịch vụ thất bại.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading)
        return <MySpinner />;

    return <div className="mt-4">
        <h3 className="mb-3">{isEdit ? "Cập nhật dịch vụ" : "Thêm dịch vụ"}</h3>
        {err && <Alert variant="danger">{err}</Alert>}

        <Card>
            <Card.Body>
                <Form onSubmit={submit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Tên dịch vụ</Form.Label>
                        <Form.Control value={form.name} onChange={e => update("name", e.target.value)} required />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Mô tả</Form.Label>
                        <Form.Control as="textarea" rows={4} value={form.description} onChange={e => update("description", e.target.value)} required />
                    </Form.Group>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Label>Danh mục</Form.Label>
                            <Form.Select value={form.categoryId} onChange={e => update("categoryId", e.target.value)} required>
                                <option value="">-- Chọn danh mục --</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </Form.Select>
                        </Col>
                        <Col md={6}>
                            <Form.Label>Giá (VNĐ)</Form.Label>
                            <Form.Control type="number" min={0} value={form.price} onChange={e => update("price", e.target.value)} required />
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Label>Địa điểm</Form.Label>
                            <Form.Control value={form.location} onChange={e => update("location", e.target.value)} required />
                        </Col>
                        <Col md={6}>
                            <Form.Label>Khởi hành từ</Form.Label>
                            <Form.Control value={form.departureLocation} onChange={e => update("departureLocation", e.target.value)} required />
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={4}>
                            <Form.Label>Ngày khởi hành</Form.Label>
                            <Form.Control type="date" value={form.departureDate} onChange={e => update("departureDate", e.target.value)} required />
                        </Col>
                        <Col md={4}>
                            <Form.Label>Số chỗ trống</Form.Label>
                            <Form.Control type="number" min={0} value={form.availableSlots} onChange={e => update("availableSlots", e.target.value)} required />
                        </Col>
                        <Col md={4}>
                            <Form.Label>Trạng thái</Form.Label>
                            <Form.Select value={form.status} onChange={e => update("status", e.target.value)}>
                                <option value="ACTIVE">Hoạt động</option>
                                <option value="INACTIVE">Tạm dừng</option>
                            </Form.Select>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Hình ảnh</Form.Label>
                        <Form.Control type="file" accept="image/*" onChange={chooseImage} required={!isEdit} />
                        {preview && <img src={preview} alt="preview" className="mt-2 rounded" style={{ maxWidth: 260, maxHeight: 160, objectFit: "cover" }} />}
                    </Form.Group>

                    <div className="d-flex gap-2">
                        <Button variant="outline-secondary" type="button" onClick={() => nav("/provider/services")}>Hủy</Button>
                        <Button variant="primary" type="submit" disabled={submitting}>
                            {submitting ? "Đang lưu..." : "Lưu dịch vụ"}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    </div>;
};

export default ServiceForm;
