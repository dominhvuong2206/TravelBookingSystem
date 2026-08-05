import cookies from "react-cookies";

export const getStoredUser = () => {
    const rawUser = localStorage.getItem("user");

    if (!rawUser)
        return null;

    try {
        return JSON.parse(rawUser);
    } catch {
        localStorage.removeItem("user");
        return null;
    }
};

export const AUTH_COOKIE_PATHS = ["/", "/login", "/admin", "/provider", "/provider/services"];
export const clearAuthSession = () => {
    cookies.remove("token");
    cookies.remove("user");

    for (const path of AUTH_COOKIE_PATHS) {
        cookies.remove("token", { path });
        cookies.remove("user", { path });
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
};

export const normalizeRole = (user) => {
    const role = user?.userRole || user?.role;

    if (!role)
        return "";

    return role.startsWith("ROLE_") ? role : `ROLE_${role}`;
};

export const hasRole = (user, expectedRole) => {
    const role = expectedRole.startsWith("ROLE_") ? expectedRole : `ROLE_${expectedRole}`;
    return normalizeRole(user) === role;
};

export const isActive = (user) => {
    return user?.active === true || user?.active === 1 || user?.active === "true" || user?.active === "1";
};

export const isApproved = (user) => {
    return user?.approved === true || user?.approved === 1 || user?.approved === "true" || user?.approved === "1";
};

export const getLoginRedirect = (pathname) => {
    return `/login?next=${encodeURIComponent(pathname)}`;
};
