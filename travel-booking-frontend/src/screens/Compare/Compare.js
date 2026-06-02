import { useContext, useEffect, useState } from "react";
import { Alert, Button, Image, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Apis, { endpoints } from "../../configs/Apis";
import { CompareContext } from "../../configs/Contexts";

const Compare = () => {
    const [compare, dispatch] = useContext(CompareContext);
    const [ratings, setRatings] = useState({});
    const nav = useNavigate();

    useEffect(() => {
        const loadRatings = async () => {
            const entries = await Promise.all(compare.map(async service => {
                try {
                    const res = await Apis.get(endpoints["rating-summary"](service.id));
                    return [service.id, res.data];
                } catch {
                    return [service.id, { averageRating: 0, totalReviews: 0 }];
                }
            }));
            setRatings(Object.fromEntries(entries));
        };

        if (compare.length > 0)
            loadRatings();
    }, [compare]);

    if (compare.length < 2)
        return <Alert variant="info" className="mt-4">
            Vui lòng chọn ít nhất 2 dịch vụ để so sánh.
        </Alert>;

    const rows = [
        { label: "Hình ảnh", render: s => <Image src={s.image} style={{ width: 120, height: 80, objectFit: "cover" }} rounded /> },
        { label: "Tên dịch vụ", render: s => s.name },
        { label: "Loại dịch vụ", render: s => s.categoryId?.name || "-" },
        { label: "Địa điểm", render: s => s.location || "-" },
        { label: "Giá", render: s => `${Number(s.price || 0).toLocaleString()} VNĐ` },
        { label: "Khởi hành từ", render: s => s.departureLocation || "-" },
        { label: "Ngày khởi hành", render: s => s.departureDate ? new Date(s.departureDate).toLocaleDateString("vi-VN") : "-" },
        { label: "Số chỗ còn", render: s => s.availableSlots ?? 0 },
        {
            label: "Đánh giá",
            render: s => {
                const summary = ratings[s.id] || { averageRating: 0, totalReviews: 0 };
                return `${Number(summary.averageRating || 0).toFixed(1)}/5 (${summary.totalReviews} lượt)`;
            }
        },
        { label: "Thao tác", render: s => <Button size="sm" variant="success" onClick={() => nav(`/services/${s.id}/book`)}>Đặt</Button> },
    ];

    return <div className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>So sánh dịch vụ</h3>
            <Button variant="outline-danger" onClick={() => dispatch({ type: "CLEAR" })}>Xóa tất cả</Button>
        </div>

        <Table bordered responsive>
            <thead className="table-light">
                <tr>
                    <th>Tiêu chí</th>
                    {compare.map(service => <th key={service.id}>{service.name}</th>)}
                </tr>
            </thead>
            <tbody>
                {rows.map(row => <tr key={row.label}>
                    <th style={{ width: 180 }}>{row.label}</th>
                    {compare.map(service => <td key={service.id}>{row.render(service)}</td>)}
                </tr>)}
            </tbody>
        </Table>
    </div>;
};

export default Compare;
