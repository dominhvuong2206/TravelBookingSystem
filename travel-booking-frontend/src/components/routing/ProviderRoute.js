import { useContext } from "react";
import { Alert } from "react-bootstrap";
import { Navigate, useLocation } from "react-router-dom";
import { MyUserContext } from "../../configs/Contexts";
import { getLoginRedirect, hasRole, isActive, isApproved } from "../../utils/authUtils";

const ProviderRoute = ({ children }) => {
    const [user] = useContext(MyUserContext);
    const location = useLocation();

    if (user === null)
        return <Navigate to={getLoginRedirect(location.pathname)} replace />;

    if (!isActive(user) || !hasRole(user, "ROLE_PROVIDER"))
        return <Navigate to="/403" replace />;

    if (!isApproved(user))
        return <Alert variant="warning" className="mt-3">
            Tài khoản nhà cung cấp của bạn đang chờ quản trị viên duyệt.
        </Alert>;

    return children;
};

export default ProviderRoute;
