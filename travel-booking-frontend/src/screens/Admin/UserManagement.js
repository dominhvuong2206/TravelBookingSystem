import { useCallback, useContext, useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Form, InputGroup, Spinner, Tab, Table, Tabs } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSearchParams } from "react-router-dom";
import { authApis, endpoints } from "../../configs/Apis";
import { MyUserContext } from "../../configs/Contexts";

const PAGE_SIZE = 20;

const roleLabel = {
    ROLE_ADMIN: { text: "Quản trị viên", bg: "dark" },
    ROLE_PROVIDER: { text: "Nhà cung cấp", bg: "info" },
    ROLE_CUSTOMER: { text: "Khách hàng", bg: "primary" },
};

const errorMessage = (error, fallback) => {
    const data = error?.response?.data;
    if (typeof data === "string" && data.trim())
        return data;
    return fallback;
};

const UserManagement = () => {
    const [currentUser] = useContext(MyUserContext);
    const [searchParams, setSearchParams] = useSearchParams();
    const [users, setUsers] = useState([]);
    const [pendingProviders, setPendingProviders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionKey, setActionKey] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [keyword, setKeyword] = useState("");
    const [tab, setTab] = useState(searchParams.get("tab") === "pending" ? "pending" : "all");
    const [page, setPage] = useState(1);
    const [pendingPage, setPendingPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [pendingTotal, setPendingTotal] = useState(0);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const buildQuery = useCallback((currentPage) => {
        const query = new URLSearchParams({ page: String(currentPage) });
        if (keyword)
            query.set("kw", keyword);
        return query.toString();
    }, [keyword]);

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const [usersResponse, totalResponse, pendingResponse, pendingTotalResponse] = await Promise.all([
                authApis().get(`${endpoints["admin-users"]}?${buildQuery(page)}`),
                authApis().get(`${endpoints["admin-users-count"]}?${buildQuery(page)}`),
                authApis().get(`${endpoints["admin-pending-providers"]}?${buildQuery(pendingPage)}`),
                authApis().get(`${endpoints["admin-pending-providers-count"]}?${buildQuery(pendingPage)}`),
            ]);

            setUsers(usersResponse.data || []);
            setTotal(Number(totalResponse.data || 0));
            setPendingProviders(pendingResponse.data || []);
            setPendingTotal(Number(pendingTotalResponse.data || 0));
        } catch (requestError) {
            console.error(requestError);
            setError("Không thể tải danh sách người dùng. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    }, [buildQuery, page, pendingPage]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    useEffect(() => {
        const requestedTab = searchParams.get("tab") === "pending" ? "pending" : "all";
        setTab(requestedTab);
    }, [searchParams]);

    const submitSearch = (event) => {
        event.preventDefault();
        setPage(1);
        setPendingPage(1);
        setKeyword(searchInput.trim());
    };

    const clearSearch = () => {
        setSearchInput("");
        setKeyword("");
        setPage(1);
        setPendingPage(1);
    };

    const changeTab = (value) => {
        const nextTab = value || "all";
        setTab(nextTab);
        setSearchParams(nextTab === "pending" ? { tab: "pending" } : {});
    };

    const approve = async (user) => {
        const key = `approve-${user.id}`;
        try {
            setActionKey(key);
            setError("");
            await authApis().put(endpoints["admin-approve-user"](user.id));
            setMessage(`Đã duyệt tài khoản nhà cung cấp ${user.username}.`);
            await loadUsers();
        } catch (requestError) {
            console.error(requestError);
            setError(errorMessage(requestError, "Không thể duyệt tài khoản nhà cung cấp."));
        } finally {
            setActionKey("");
        }
    };

    const toggleActive = async (user) => {
        const key = `active-${user.id}`;
        try {
            setActionKey(key);
            setError("");
            await authApis().put(endpoints["admin-toggle-user-active"](user.id));
            setMessage(`Đã ${user.active ? "khóa" : "mở khóa"} tài khoản ${user.username}.`);
            await loadUsers();
        } catch (requestError) {
            console.error(requestError);
            setError(errorMessage(requestError, "Không thể cập nhật trạng thái tài khoản."));
        } finally {
            setActionKey("");
        }
    };

    const renderUsers = (list) => (
        <Table bordered hover responsive className="align-middle mb-0">
            <thead className="table-light">
                <tr>
                    <th>ID</th>
                    <th>Người dùng</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th style={{ minWidth: 160 }}>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                {list.map((user) => {
                    const role = roleLabel[user.userRole] || { text: user.userRole, bg: "secondary" };
                    const isCurrentUser = Number(currentUser?.id) === Number(user.id);
                    const approving = actionKey === `approve-${user.id}`;
                    const toggling = actionKey === `active-${user.id}`;

                    return <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>
                            <div className="d-flex align-items-center gap-2">
                                {user.avatar ? <img src={user.avatar} alt={user.username} width={38} height={38} className="rounded-circle" style={{ objectFit: "cover" }} /> : <div className="rounded-circle bg-light border d-grid" style={{ width: 38, height: 38, placeItems: "center" }}>
                                    <FontAwesomeIcon icon="fa-solid fa-user" className="text-secondary" />
                                </div>}
                                <div>
                                    <div className="fw-semibold">{[user.firstName, user.lastName].filter(Boolean).join(" ") || user.username}</div>
                                    {isCurrentUser && <span className="small text-primary">Tài khoản hiện tại</span>}
                                </div>
                            </div>
                        </td>
                        <td>{user.username}</td>
                        <td>{user.email || <span className="text-muted">Chưa cập nhật</span>}</td>
                        <td><Badge bg={role.bg}>{role.text}</Badge></td>
                        <td>
                            {user.userRole === "ROLE_PROVIDER" && <Badge bg={user.approved ? "success" : "warning"} text={user.approved ? undefined : "dark"} className="me-1">
                                {user.approved ? "Đã duyệt" : "Chờ duyệt"}
                            </Badge>}
                            <Badge bg={user.active ? "success" : "secondary"}>
                                {user.active ? "Hoạt động" : "Đã khóa"}
                            </Badge>
                        </td>
                        <td>
                            <div className="d-flex gap-2 flex-wrap">
                                {user.userRole === "ROLE_PROVIDER" && !user.approved && <Button size="sm" variant="success" disabled={Boolean(actionKey)} onClick={() => approve(user)}>
                                    {approving ? <Spinner size="sm" /> : "Duyệt"}
                                </Button>}
                                <Button
                                    size="sm"
                                    variant={user.active ? "outline-danger" : "outline-success"}
                                    disabled={Boolean(actionKey) || isCurrentUser}
                                    title={isCurrentUser ? "Không thể khóa tài khoản đang đăng nhập" : undefined}
                                    onClick={() => toggleActive(user)}
                                >
                                    {toggling ? <Spinner size="sm" /> : user.active ? "Khóa" : "Mở khóa"}
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
        if (totalPages <= 1)
            return null;

        return <div className="d-flex justify-content-end align-items-center gap-2 p-3 border-top">
            <Button size="sm" variant="outline-secondary" disabled={currentPage <= 1 || loading} onClick={() => setCurrentPage(currentPage - 1)}>Trước</Button>
            <span className="small text-muted">Trang {currentPage}/{totalPages}</span>
            <Button size="sm" variant="outline-secondary" disabled={currentPage >= totalPages || loading} onClick={() => setCurrentPage(currentPage + 1)}>Sau</Button>
        </div>;
    };

    return <div className="mt-4 mb-5">
        <div className="d-flex justify-content-between align-items-end gap-3 flex-wrap mb-4">
            <div>
                <p className="text-primary fw-bold small mb-1">ADMIN CONSOLE</p>
                <h1 className="h3 fw-bold mb-1">Quản lý người dùng</h1>
                <p className="text-muted mb-0">Kiểm soát trạng thái tài khoản và quy trình phê duyệt nhà cung cấp.</p>
            </div>
            <Form onSubmit={submitSearch} style={{ width: "min(100%, 430px)" }}>
                <InputGroup>
                    <Form.Control placeholder="Tìm tên, username hoặc email" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} />
                    {keyword && <Button variant="outline-secondary" type="button" onClick={clearSearch} aria-label="Xóa tìm kiếm">
                        <FontAwesomeIcon icon="fa-solid fa-xmark" />
                    </Button>}
                    <Button type="submit">
                        <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" className="me-2" />Tìm
                    </Button>
                </InputGroup>
            </Form>
        </div>

        {message && <Alert variant="success" onClose={() => setMessage("")} dismissible>{message}</Alert>}
        {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}

        <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
                <Tabs activeKey={tab} onSelect={changeTab} className="px-3 pt-3">
                    <Tab eventKey="all" title={`Tất cả (${total.toLocaleString("vi-VN")})`}>
                        {loading ? <div className="text-center py-5"><Spinner animation="border" /><div className="text-muted mt-2">Đang tải người dùng...</div></div> : users.length === 0 ? <Alert variant="light" className="border m-3">Không tìm thấy người dùng phù hợp.</Alert> : renderUsers(users)}
                        {!loading && renderPager(page, setPage, total)}
                    </Tab>
                    <Tab eventKey="pending" title={`Chờ duyệt (${pendingTotal.toLocaleString("vi-VN")})`}>
                        {loading ? <div className="text-center py-5"><Spinner animation="border" /></div> : pendingProviders.length === 0 ? <Alert variant="success" className="m-3">Không có nhà cung cấp đang chờ duyệt.</Alert> : renderUsers(pendingProviders)}
                        {!loading && renderPager(pendingPage, setPendingPage, pendingTotal)}
                    </Tab>
                </Tabs>
            </Card.Body>
        </Card>
    </div>;
};

export default UserManagement;