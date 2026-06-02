import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { MyUserContext } from "../../configs/Contexts";
import { getLoginRedirect, isActive } from "../../utils/authUtils";

const ProtectedRoute = ({ children }) => {
    const [user] = useContext(MyUserContext);
    const location = useLocation();

    if (user === null)
        return <Navigate to={getLoginRedirect(location.pathname)} replace />;

    if (!isActive(user))
        return <Navigate to="/403" replace />;

    return children;
};

export default ProtectedRoute;
