import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Alert, Button, Col, Form, Image, Row, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import "moment/locale/vi";
import Apis, { authApis, endpoints } from "../../configs/Apis";
import { CompareContext, MyUserContext } from "../../configs/Contexts";
import { formatDate } from "../../utils/dateUtils";
import styles, { serviceDetailsResponsive } from "./ServiceDetailsStyle";

moment.locale("vi");

const PAGE_SIZE = 5;
const PLACEHOLDER_IMAGE = "https://placehold.co/1200x700?text=Travel+Booking";

const currency = (value) => `${Number(value || 0).toLocaleString()} VNĐ`;

const StarRating = ({ value = 0 }) => (
    <span style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
            <FontAwesomeIcon
                key={star}
                icon={star <= Math.round(value) ? "fa-solid fa-star" : "fa-regular fa-star"}
            />
        ))}
    </span>
);

const InfoBox = ({ icon, label, value }) => (
    <div style={styles.meta}>
        <span style={styles.metaIcon}><FontAwesomeIcon icon={icon} /></span>
        <span>
            <span style={styles.metaLabel}>{label}</span>
            <span style={styles.metaValue} className="d-block">{value || "Chưa cập nhật"}</span>
        </span>
    </div>
);

const ServiceDetails = () => {
    const { serviceId } = useParams();
    const [product, setProduct] = useState(null);
    const [ratingSummary, setRatingSummary] = useState({ averageRating: 0, totalReviews: 0 });
    const [comments, setComments] = useState([]);
    const [hasMoreComments, setHasMoreComments] = useState(true);
    const [loadingComments, setLoadingComments] = useState(false);
    const [totalComments, setTotalComments] = useState(0);
    const [user] = useContext(MyUserContext);
    const [, compareDispatch] = useContext(CompareContext);
    const nav = useNavigate();
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState(5);
    const [err, setErr] = useState("");

    const loadingRef = useRef(false);
    const hasMoreRef = useRef(true);
    const commentPageRef = useRef(1);
    const sentinelRef = useRef(null);

    const loadProduct = useCallback(async () => {
        const [serviceRes, ratingRes] = await Promise.all([
            Apis.get(endpoints["product-details"](serviceId)),
            Apis.get(endpoints["rating-summary"](serviceId)),
        ]);
        setProduct(serviceRes.data);
        setRatingSummary(ratingRes.data);
    }, [serviceId]);

    const loadComments = useCallback(async (pageToLoad, replace = false) => {
        if (loadingRef.current) return;
        if (!replace && !hasMoreRef.current) return;

        loadingRef.current = true;
        setLoadingComments(true);

        try {
            const res = await Apis.get(
                `${endpoints["comments"](serviceId)}?page=${pageToLoad}&pageSize=${PAGE_SIZE}`
            );
            const newComments = res.data;
            setComments(current => replace ? newComments : [...current, ...newComments]);
            const more = newComments.length === PAGE_SIZE;
            hasMoreRef.current = more;
            setHasMoreComments(more);
            commentPageRef.current = pageToLoad;
        } finally {
            loadingRef.current = false;
            setLoadingComments(false);
        }
    }, [serviceId]);

    const loadTotalComments = useCallback(async () => {
        try {
            const res = await Apis.get(endpoints["comments-count"](serviceId));
            setTotalComments(Number(res.data));
        } catch (_) {}
    }, [serviceId]);

    const addComment = async () => {
        if (!comment.trim()) {
            setErr("Vui lòng nhập nội dung đánh giá.");
            return;
        }
        try {
            setErr("");
            await authApis().post(endpoints["addComment"](serviceId), {
                rating: String(rating),
                comment,
            });
            setComment("");
            setRating(5);
            hasMoreRef.current = true;
            commentPageRef.current = 1;
            await loadComments(1, true);
            const ratingRes = await Apis.get(endpoints["rating-summary"](serviceId));
            setRatingSummary(ratingRes.data);
            loadTotalComments();
        } catch (ex) {
            setErr(ex.response?.data || "Không gửi được đánh giá.");
        }
    };

    useEffect(() => {
        setComments([]);
        setHasMoreComments(true);
        hasMoreRef.current = true;
        commentPageRef.current = 1;
        loadingRef.current = false;
        loadProduct();
        loadComments(1, true);
        loadTotalComments();
    }, [loadComments, loadProduct, loadTotalComments]);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMoreRef.current && !loadingRef.current) {
                    loadComments(commentPageRef.current + 1);
                }
            },
            { rootMargin: "0px 0px 200px 0px", threshold: 0 }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [loadComments]);

    if (!product)
        return <div style={styles.page} className="text-center"><Spinner animation="border" /></div>;

    const averageRating = Number(ratingSummary.averageRating || 0);
    const totalReviews = Number(ratingSummary.totalReviews || 0);
    const soldOut = Number(product.availableSlots || 0) <= 0;

    return (
        <div style={styles.page}>
            <style>{serviceDetailsResponsive}</style>

            <div style={styles.breadcrumb}>Trang chủ / {product.categoryId?.name || "Dịch vụ"} / {product.name}</div>

            <div style={styles.hero} className="service-detail-responsive-hero">
                <div style={styles.imageWrap}>
                    <img src={product.image || PLACEHOLDER_IMAGE} alt={product.name} style={styles.image} />
                </div>

                <div style={styles.summary}>
                    <div style={styles.category}>
                        <FontAwesomeIcon icon="fa-solid fa-ticket" />
                        {product.categoryId?.name || "Dịch vụ du lịch"}
                    </div>
                    <h1 style={styles.title}>{product.name}</h1>
                    <div style={styles.rating}>
                        <StarRating value={averageRating} />
                        <strong>{averageRating ? averageRating.toFixed(1) : "Chưa có đánh giá"}</strong>
                        {totalReviews > 0 && <span>({totalReviews} đánh giá)</span>}
                    </div>
                    <div style={styles.price}>{currency(product.price)}</div>
                    <p style={styles.desc}>{product.description}</p>

                    <div style={styles.metaGrid} className="service-detail-responsive-meta">
                        <InfoBox icon="fa-solid fa-location-dot" label="Địa điểm" value={product.location} />
                        <InfoBox icon="fa-solid fa-plane" label="Khởi hành từ" value={product.departureLocation} />
                        <InfoBox icon="fa-solid fa-calendar-days" label="Ngày khởi hành" value={formatDate(product.departureDate)} />
                        <InfoBox icon="fa-solid fa-user-group" label="Số chỗ còn" value={soldOut ? "Hết chỗ" : `${product.availableSlots ?? 0} chỗ`} />
                    </div>

                    <div style={styles.actions}>
                        <Button variant="success" disabled={soldOut} onClick={() => nav(`/services/${product.id}/book`)}>
                            <FontAwesomeIcon icon="fa-solid fa-paper-plane" className="me-2" />
                            Đặt dịch vụ
                        </Button>
                        <Button variant="outline-primary" onClick={() => compareDispatch({ type: "ADD", payload: product })}>
                            <FontAwesomeIcon icon="fa-solid fa-exchange-alt" className="me-2" />
                            So sánh
                        </Button>
                        <Button variant="outline-secondary" onClick={() => nav("/")}>
                            <FontAwesomeIcon icon="fa-solid fa-arrow-left" className="me-2" />
                            Quay lại
                        </Button>
                    </div>
                </div>
            </div>

            <section style={styles.section}>
                <h4 style={styles.sectionTitle}>
                    <FontAwesomeIcon icon="fa-solid fa-circle-info" className="text-primary" />
                    Giới thiệu dịch vụ
                </h4>
                <p style={styles.desc} className="mb-0">{product.description}</p>
            </section>

            <section style={styles.section}>
                <h4 style={styles.sectionTitle}>
                    <FontAwesomeIcon icon="fa-solid fa-star" className="text-warning" />
                    Đánh giá từ khách hàng
                    {totalComments > 0 && (
                        <span style={{ fontSize: "0.85rem", fontWeight: "normal", color: "#888", marginLeft: "8px" }}>
                            (Đã tải {comments.length}/{totalComments})
                        </span>
                    )}
                </h4>
                {err && <Alert variant="danger">{err}</Alert>}

                {user === null ? (
                    <Alert variant="info">
                        Vui lòng <Button size="sm" variant="warning" onClick={() => nav(`/login?next=/products/${serviceId}`)}>đăng nhập</Button> để đánh giá dịch vụ.
                    </Alert>
                ) : (
                    <div style={styles.reviewForm}>
                        <Row className="g-2">
                            <Col md={3}>
                                <Form.Select style={styles.ratingSelect} value={rating} onChange={e => setRating(e.target.value)}>
                                    <option value={5}>5 sao</option>
                                    <option value={4}>4 sao</option>
                                    <option value={3}>3 sao</option>
                                    <option value={2}>2 sao</option>
                                    <option value={1}>1 sao</option>
                                </Form.Select>
                            </Col>
                            <Col md={7}>
                                <Form.Control placeholder="Nội dung đánh giá..." value={comment} onChange={e => setComment(e.target.value)} />
                            </Col>
                            <Col md={2}>
                                <Button onClick={addComment} variant="success" className="w-100">Gửi</Button>
                            </Col>
                        </Row>
                    </div>
                )}

                <div style={styles.reviewList}>
                    {comments.map(c => (
                        <div style={styles.reviewItem} key={c.id}>
                            <Row className="g-3">
                                <Col xs="auto">
                                    <Image src={c.customerId?.avatar || PLACEHOLDER_IMAGE} style={styles.reviewAvatar} roundedCircle />
                                </Col>
                                <Col>
                                    <div className="fw-bold">{c.customerId?.firstName} {c.customerId?.lastName}</div>
                                    <div style={styles.stars}><StarRating value={c.rating} /></div>
                                    <p className="mb-1">{c.comment}</p>
                                    <p className="text-muted small mb-1"><em>{moment(c.createdDate).fromNow()}</em></p>
                                    {c.replyText && (
                                        <div style={styles.reply}>
                                            <strong>Phản hồi từ nhà cung cấp:</strong> {c.replyText}
                                            {c.replyDate && <div className="text-muted small">{moment(c.replyDate).fromNow()}</div>}
                                        </div>
                                    )}
                                </Col>
                            </Row>
                        </div>
                    ))}
                </div>

                <div ref={sentinelRef} style={{ height: "1px" }} />

                {loadingComments && (
                    <div className="text-center my-3 text-muted">
                        <Spinner animation="border" size="sm" className="me-2" />
                        Đang tải đánh giá...
                    </div>
                )}
                {!hasMoreComments && comments.length > 0 && (
                    <p className="text-center text-muted my-3">
                        <FontAwesomeIcon icon="fa-solid fa-check-circle" className="me-1 text-success" />
                        Đã tải hết {totalComments} đánh giá.
                    </p>
                )}
                {!loadingComments && comments.length === 0 && (
                    <Alert variant="light" className="mb-0">Chưa có đánh giá nào cho dịch vụ này.</Alert>
                )}
            </section>
        </div>
    );
};

export default ServiceDetails;

