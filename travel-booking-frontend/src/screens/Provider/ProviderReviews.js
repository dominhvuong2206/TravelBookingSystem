import { useEffect, useState } from "react";
import { Alert, Button, Form, Spinner, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import moment from "moment";
import "moment/locale/vi";
import { authApis, endpoints } from "../../configs/Apis";

moment.locale("vi");

const ProviderReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [replyText, setReplyText] = useState({});
    const [message, setMessage] = useState("");
    const [err, setErr] = useState("");

    const loadReviews = async () => {
        try {
            setLoading(true);
            const res = await authApis().get(endpoints["provider-reviews"]);
            setReviews(res.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReviews();
    }, []);

    const reply = async (reviewId) => {
        const text = replyText[reviewId];
        if (!text || !text.trim()) {
            setErr("Vui lòng nhập nội dung phản hồi.");
            return;
        }

        try {
            setErr("");
            await authApis().put(endpoints["provider-reply-review"](reviewId), { replyText: text });
            setMessage("Đã gửi phản hồi.");
            setReplyText({ ...replyText, [reviewId]: "" });
            loadReviews();
        } catch (ex) {
            setErr(ex.response?.data || "Không gửi được phản hồi.");
        }
    };

    if (loading)
        return <div className="text-center mt-5"><Spinner animation="border" /></div>;

    return <div className="mt-4">
        <h3 className="mb-3">Đánh giá khách hàng</h3>
        {message && <Alert variant="success" dismissible onClose={() => setMessage("")}>{message}</Alert>}
        {err && <Alert variant="danger">{err}</Alert>}

        {reviews.length === 0 ? <Alert variant="info">Chưa có đánh giá nào.</Alert> : <Table bordered hover responsive>
            <thead className="table-light">
                <tr>
                    <th>Dịch vụ</th>
                    <th>Khách hàng</th>
                    <th>Đánh giá</th>
                    <th>Phản hồi</th>
                </tr>
            </thead>
            <tbody>
                {reviews.map(review => <tr key={review.id}>
                    <td>
                        {review.serviceId?.id ? <Link to={`/products/${review.serviceId.id}`} className="fw-semibold text-decoration-none">
                            {review.serviceId?.name}
                        </Link> : review.serviceId?.name}
                    </td>
                    <td>
                        <div>{review.customerId?.firstName} {review.customerId?.lastName}</div>
                        <div className="text-muted small">{moment(review.createdDate).fromNow()}</div>
                    </td>
                    <td>
                        <div className="text-warning">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
                        <div>{review.comment}</div>
                    </td>
                    <td style={{ minWidth: 280 }}>
                        {review.replyText ? <>
                            <div>{review.replyText}</div>
                            <div className="text-muted small">{moment(review.replyDate).fromNow()}</div>
                        </> : <>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={replyText[review.id] || ""}
                                onChange={e => setReplyText({ ...replyText, [review.id]: e.target.value })}
                                placeholder="Nhập phản hồi..."
                            />
                            <Button size="sm" className="mt-2" onClick={() => reply(review.id)}>Phản hồi</Button>
                        </>}
                    </td>
                </tr>)}
            </tbody>
        </Table>}
    </div>;
};

export default ProviderReviews;
