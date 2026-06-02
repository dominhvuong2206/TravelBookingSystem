import { useContext, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Col, Form, Image, Row, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { authApis, endpoints } from "../../configs/Apis";
import { MyUserContext } from "../../configs/Contexts";
import { isActive, isApproved, normalizeRole } from "../../utils/authUtils";
import profileStyles from "./ProfileStyle";

const roleText = {
    ROLE_ADMIN: "Quản trị viên",
    ROLE_PROVIDER: "Nhà cung cấp dịch vụ",
    ROLE_CUSTOMER: "Khách hàng",
};

const initialForm = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyName: "",
    address: "",
};

const Profile = () => {
    const [user, dispatch] = useContext(MyUserContext);
    const [form, setForm] = useState(initialForm);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const role = normalizeRole(user);
    const active = isActive(user);
    const approved = isApproved(user);
    const isProvider = role === "ROLE_PROVIDER";

    const fullName = useMemo(() => {
        const name = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
        return name || user?.username || "Tài khoản";
    }, [user]);

    useEffect(() => {
        if (!user)
            return;

        setForm({
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || "",
            phone: user.phone || "",
            companyName: user.companyName || "",
            address: user.address || "",
        });
        setAvatarPreview(user.avatar || "");
        setAvatarFile(null);
    }, [user]);

    const updateField = (field, value) => {
        setForm(current => ({ ...current, [field]: value }));
    };

    const chooseAvatar = e => {
        const file = e.target.files?.[0];
        if (!file)
            return;

        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const cancelEdit = () => {
        setEditing(false);
        setError("");
        setMessage("");
        setAvatarFile(null);
        setAvatarPreview(user?.avatar || "");
        setForm({
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            email: user?.email || "",
            phone: user?.phone || "",
            companyName: user?.companyName || "",
            address: user?.address || "",
        });
    };

    const validate = () => {
        if (!form.firstName.trim() || !form.lastName.trim())
            return "Vui lòng nhập đầy đủ họ và tên.";
        if (!form.email.trim())
            return "Vui lòng nhập email.";
        if (!form.phone.trim())
            return "Vui lòng nhập số điện thoại.";
        return "";
    };

    const saveProfile = async e => {
        e.preventDefault();
        setError("");
        setMessage("");

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        const data = new FormData();
        Object.entries(form).forEach(([key, value]) => data.append(key, value));
        if (avatarFile)
            data.append("avatar", avatarFile);

        setSaving(true);
        try {
            const res = await authApis().put(endpoints["update-profile"], data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            dispatch({ type: "UPDATE_USER", payload: res.data });
            setEditing(false);
            setMessage("Cập nhật thông tin thành công.");
        } catch (ex) {
            setError(ex.response?.data?.message || "Không cập nhật được thông tin. Vui lòng thử lại.");
        } finally {
            setSaving(false);
        }
    };

    if (!user)
        return <Alert variant="warning" className="mt-4">Vui lòng đăng nhập để xem hồ sơ cá nhân.</Alert>;

    return (
        <div style={profileStyles.page}>
            <div style={profileStyles.header}>
                <div>
                    <p style={profileStyles.kicker}>Tài khoản</p>
                    <h1 style={profileStyles.title}>Hồ sơ cá nhân</h1>
                    <p style={profileStyles.subtitle}>Quản lý thông tin định danh dùng khi đặt dịch vụ và giao dịch.</p>
                </div>
                {!editing && (
                    <Button variant="primary" style={profileStyles.primaryButton} onClick={() => setEditing(true)}>
                        <FontAwesomeIcon icon="pen" /> Chỉnh sửa
                    </Button>
                )}
            </div>

            {message && <Alert variant="success">{message}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}

            <Row className="g-4">
                <Col lg={4}>
                    <section style={profileStyles.summaryCard}>
                        <div style={profileStyles.avatarWrap}>
                            {avatarPreview ? (
                                <Image src={avatarPreview} roundedCircle style={profileStyles.avatar} />
                            ) : (
                                <div style={profileStyles.avatarFallback}>
                                    <FontAwesomeIcon icon="user" />
                                </div>
                            )}
                            {editing && (
                                <Form.Label htmlFor="avatar" style={profileStyles.avatarButton}>
                                    <FontAwesomeIcon icon="camera" />
                                </Form.Label>
                            )}
                        </div>

                        <h2 style={profileStyles.name}>{fullName}</h2>
                        <p style={profileStyles.username}>@{user.username}</p>

                        <div style={profileStyles.badgeRow}>
                            <Badge bg="primary">{roleText[role] || role}</Badge>
                            <Badge bg={active ? "success" : "secondary"}>
                                {active ? "Đang hoạt động" : "Đã khóa"}
                            </Badge>
                            {isProvider && (
                                <Badge bg={approved ? "success" : "warning"}>
                                    {approved ? "Đã duyệt" : "Chờ duyệt"}
                                </Badge>
                            )}
                        </div>

                        <div style={profileStyles.infoList}>
                            <div style={profileStyles.infoItem}>
                                <FontAwesomeIcon icon="envelope" />
                                <span>{user.email || "Chưa cập nhật email"}</span>
                            </div>
                            <div style={profileStyles.infoItem}>
                                <FontAwesomeIcon icon="phone" />
                                <span>{user.phone || "Chưa cập nhật số điện thoại"}</span>
                            </div>
                            {isProvider && user.companyName && (
                                <div style={profileStyles.infoItem}>
                                    <FontAwesomeIcon icon="building" />
                                    <span>{user.companyName}</span>
                                </div>
                            )}
                        </div>
                    </section>
                </Col>

                <Col lg={8}>
                    <Form onSubmit={saveProfile} style={profileStyles.formCard}>
                        <Form.Control id="avatar" type="file" accept="image/*" onChange={chooseAvatar} hidden />

                        <div style={profileStyles.formTitleRow}>
                            <div>
                                <h2 style={profileStyles.formTitle}>Thông tin liên hệ</h2>
                                <p style={profileStyles.formHint}>Username và vai trò không thể chỉnh sửa tại đây.</p>
                            </div>
                            {editing && (
                                <div style={profileStyles.actionRow}>
                                    <Button variant="outline-secondary" onClick={cancelEdit} disabled={saving}>
                                        <FontAwesomeIcon icon="xmark" /> Hủy
                                    </Button>
                                    <Button type="submit" variant="primary" disabled={saving}>
                                        {saving ? <Spinner size="sm" /> : <FontAwesomeIcon icon="floppy-disk" />} Lưu thay đổi
                                    </Button>
                                </div>
                            )}
                        </div>

                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Họ</Form.Label>
                                    <Form.Control
                                        value={form.firstName}
                                        onChange={e => updateField("firstName", e.target.value)}
                                        disabled={!editing || saving}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Tên</Form.Label>
                                    <Form.Control
                                        value={form.lastName}
                                        onChange={e => updateField("lastName", e.target.value)}
                                        disabled={!editing || saving}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={form.email}
                                        onChange={e => updateField("email", e.target.value)}
                                        disabled={!editing || saving}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Số điện thoại</Form.Label>
                                    <Form.Control
                                        value={form.phone}
                                        onChange={e => updateField("phone", e.target.value)}
                                        disabled={!editing || saving}
                                    />
                                </Form.Group>
                            </Col>

                            {isProvider && (
                                <>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Tên công ty</Form.Label>
                                            <Form.Control
                                                value={form.companyName}
                                                onChange={e => updateField("companyName", e.target.value)}
                                                disabled={!editing || saving}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Địa chỉ</Form.Label>
                                            <Form.Control
                                                value={form.address}
                                                onChange={e => updateField("address", e.target.value)}
                                                disabled={!editing || saving}
                                            />
                                        </Form.Group>
                                    </Col>
                                </>
                            )}
                        </Row>
                    </Form>
                </Col>
            </Row>
        </div>
    );
};

export default Profile;
