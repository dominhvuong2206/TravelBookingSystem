import { useContext } from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { CompareContext } from "../configs/Contexts";

const CompareBar = () => {
    const [compare, dispatch] = useContext(CompareContext);
    const nav = useNavigate();

    if (compare.length === 0)
        return null;

    return <div className="position-fixed bottom-0 start-0 end-0 bg-dark text-white p-3" style={{ zIndex: 1050 }}>
        <div className="container d-flex justify-content-between align-items-center gap-3 flex-wrap">
            <div>
                Đã chọn {compare.length}/4 dịch vụ để so sánh
                <span className="ms-2 text-white-50">{compare.map(item => item.name).join(", ")}</span>
            </div>
            <div className="d-flex gap-2">
                <Button size="sm" variant="light" disabled={compare.length < 2} onClick={() => nav("/compare")}>
                    Xem so sánh
                </Button>
                <Button size="sm" variant="outline-light" onClick={() => dispatch({ type: "CLEAR" })}>
                    Xóa
                </Button>
            </div>
        </div>
    </div>;
};

export default CompareBar;
