import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { MyUserContext } from "../../configs/Contexts";
import { getLoginRedirect, hasRole, isActive } from "../../utils/authUtils";

const CustomerRoute = ({ children }) => {
    const [user] = useContext(MyUserContext);
    const location = useLocation();

    if (user === null)
        return <Navigate to={getLoginRedirect(location.pathname)} replace />;

    if (!isActive(user) || !hasRole(user, "ROLE_CUSTOMER"))
        return <Navigate to="/403" replace />;

    return children;
};

export default CustomerRoute;
