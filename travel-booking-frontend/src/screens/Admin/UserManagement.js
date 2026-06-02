import { useCallback, useEffect, useState } from "react";
import { Alert, Badge, Button, Form, Spinner, Tab, Table, Tabs } from "react-bootstrap";
import { authApis, endpoints } from "../../configs/Apis";

const PAGE_SIZE = 20;

const roleLabel = {
    ROLE_ADMIN: { text: "Quản trị viên", bg: "dark" },
    ROLE_PROVIDER: { text: "Nhà cung cấp", bg: "info" },
    ROLE_CUSTOMER: { text: "Khách hàng", bg: "primary" },
};

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [pendingProviders, setPendingProviders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [kw, setKw] = useState("");
    const [tab, setTab] = useState("all");
    const [page, setPage] = useState(1);
    const [pendingPage, setPendingPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [pendingTotal, setPendingTotal] = useState(0);
    const [message, setMessage] = useState("");

    const buildQuery = useCallback((currentPage) => {
        const query = new URLSearchParams({ page: String(currentPage) });
        if (kw.trim())
            query.set("kw", kw.trim());
        return query.toString();
    }, [kw]);

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            const [usersRes, totalRes, pendingRes, pendingTotalRes] = await Promise.all([
                authApis().get(`${endpoints["admin-users"]}?${buildQuery(page)}`),
                authApis().get(`${endpoints["admin-users-count"]}?${buildQuery(page)}`),
                authApis().get(`${endpoints["admin-pending-providers"]}?${buildQuery(pendingPage)}`),
                authApis().get(`${endpoints["admin-pending-providers-count"]}?${buildQuery(pendingPage)}`),
            ]);

            setUsers(usersRes.data);
            setTotal(totalRes.data);
            setPendingProviders(pendingRes.data);
            setPendingTotal(pendingTotalRes.data);
        } finally {
            setLoading(false);
        }
    }, [buildQuery, page, pendingPage]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    useEffect(() => {
        setPage(1);
        setPendingPage(1);
    }, [kw]);

    const approve = async (id) => {
        await authApis().put(endpoints["admin-approve-user"](id));
        setMessage("Đã duyệt tài khoản nhà cung cấp.");
        loadUsers();
    };

    const toggleActive = async (id) => {
        await authApis().put(endpoints["admin-toggle-user-active"](id));
        setMessage("Đã cập nhật trạng thái tài khoản.");
        loadUsers();
    };

    const renderUsers = (list) => (
        <Table bordered hover responsive>
            <thead className="table-light">
                <tr>
                    <th>ID</th>
                    <th>Người dùng</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                {list.map(user => {
                    const role = roleLabel[user.userRole] || { text: user.userRole, bg: "secondary" };

                    return <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>
                            <div className="d-flex align-items-center gap-2">
                                {user.avatar && <img src={user.avatar} alt={user.username} width={32} height={32} className="rounded-circle" style={{ objectFit: "cover" }} />}
                                <span>{user.firstName} {user.lastName}</span>
                            </div>
                        </td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td><Badge bg={role.bg}>{role.text}</Badge></td>
                        <td>
                            {user.userRole === "ROLE_PROVIDER" && <Badge bg={user.approved ? "success" : "warning"} className="me-1">
                                {user.approved ? "Đã duyệt" : "Chờ duyệt"}
                            </Badge>}
                            <Badge bg={user.active ? "success" : "secondary"}>
                                {user.active ? "Hoạt động" : "Đã khóa"}
                            </Badge>
                        </td>
                        <td>
                            <div className="d-flex gap-2 flex-wrap">
                                {user.userRole === "ROLE_PROVIDER" && !user.approved && <Button size="sm" variant="success" onClick={() => approve(user.id)}>
                                    Duyệt
                                </Button>}
                                <Button size="sm" variant={user.active ? "outline-secondary" : "outline-success"} onClick={() => toggleActive(user.id)}>
                                    {user.active ? "Khóa" : "Mở khóa"}
                                </Button>
                            </div>
                        </td>
                    </tr>;
                })}
            </tbody>
        </Table>
    );

    const renderPager = (currentPage, setCurrentPage, itemTotal) => {
        const totalPages = Math.max(1, Math.ceil(itemTotal / PAGE_SIZE));

        return <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
            <Button size="sm" variant="outline-secondary" disabled={currentPage <= 1} onClick={() => setCurrentPage(currentPage - 1)}>
                Trước
            </Button>
            <span>Trang {currentPage}/{totalPages}</span>
            <Button size="sm" variant="outline-secondary" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
                Sau
            </Button>
        </div>;
    };

    if (loading)
        return <div className="text-center mt-5"><Spinner animation="border" /></div>;

    return <div className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Quản lý người dùng</h3>
            <Form.Control
                style={{ maxWidth: 320 }}
                placeholder="Tìm tên, username, email..."
                value={kw}
                onChange={e => setKw(e.target.value)}
            />
        </div>

        {message && <Alert variant="success" onClose={() => setMessage("")} dismissible>{message}</Alert>}

        <Tabs activeKey={tab} onSelect={(value) => setTab(value || "all")} className="mb-3">
            <Tab eventKey="all" title={`Tất cả (${total})`}>
                {users.length === 0 ? <Alert variant="info">Không có người dùng.</Alert> : renderUsers(users)}
                {renderPager(page, setPage, total)}
            </Tab>
            <Tab eventKey="pending" title={`Chờ duyệt (${pendingTotal})`}>
                {pendingProviders.length === 0 ? <Alert variant="success">Không có nhà cung cấp chờ duyệt.</Alert> : renderUsers(pendingProviders)}
                {renderPager(pendingPage, setPendingPage, pendingTotal)}
            </Tab>
        </Tabs>
    </div>;
};

export default UserManagement;
