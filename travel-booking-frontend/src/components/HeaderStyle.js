const headerStyles = {
    wrapper: {
        position: "sticky",
        top: 0,
        zIndex: 1030,
        background: "#f8fafc",
        borderBottom: "1px solid #e2e8f0",
        boxShadow: "none",
    },
    brand: {
        display: "inline-flex",
        flexDirection: "column",
        lineHeight: 1.1,
        color: "#1d4ed8",
        fontWeight: 800,
        textDecoration: "none",
        marginRight: 20,
    },
    brandName: {
        fontSize: "1.28rem",
        letterSpacing: 0,
        color: "#0f172a",
    },
    brandTagline: {
        fontSize: "0.76rem",
        color: "#2563eb",
        fontWeight: 550,
    },
    navbar: {
        background: "transparent",
        minHeight: 66,
    },
    navLink: {
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        color: "#334155",
        fontWeight: 700,
        padding: "9px 8px",
        borderRadius: 0,
        textDecoration: "none",
        fontSize: "0.93rem",
        whiteSpace: "nowrap",
        border: "none",
    },
    navLinkActive: {
        color: "#1d4ed8",
    },
    searchForm: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        minWidth: 250,
    },
    searchInputWrap: {
        position: "relative",
        flex: 1,
    },
    searchIcon: {
        position: "absolute",
        left: 12,
        top: "50%",
        transform: "translateY(-50%)",
        color: "#64748b",
    },
    searchInput: {
        paddingLeft: 36,
        borderRadius: 8,
        borderColor: "#e2e8f0",
        minHeight: 42,
    },
    avatar: {
        width: 34,
        height: 34,
        objectFit: "cover",
        borderRadius: "50%",
        marginRight: 8,
        border: "1px solid #e2e8f0",
    },
    userLink: {
        display: "inline-flex",
        alignItems: "center",
        color: "#0f172a",
        fontWeight: 650,
        textDecoration: "none",
        padding: "6px 8px",
        whiteSpace: "nowrap",
        fontSize: "0.95rem",
    },
    logoutBtn: {
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        fontWeight: 700,
    },
    userToggle: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        padding: "8px 12px",
        background: "#ffffff",
        color: "#0f172a",
        fontWeight: 750,
        cursor: "pointer",
        whiteSpace: "nowrap",
        boxShadow: "none",
    },
    userMenu: {
        minWidth: 230,
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
        padding: 8,
    },
    userMenuHeader: {
        padding: "10px 12px 12px",
        borderBottom: "1px solid #e2e8f0",
        marginBottom: 6,
        background: "#f8fbff",
        borderRadius: 6,
    },
    authLink: {
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        color: "#0f172a",
        fontWeight: 700,
        textDecoration: "none",
        padding: "8px 10px",
    },
};

export const headerResponsive = `
.app-header .dropdown-toggle.nav-link {
  color: #334155;
  font-weight: 700;
  padding: 9px 10px;
}
.app-header .dropdown-menu {
  border-color: #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
}
.app-header .dropdown-item {
  border-radius: 6px;
  padding: 8px 10px;
}
.app-header-search .form-control:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 0.18rem rgba(37, 99, 235, 0.14);
}
@media (max-width: 991px) {
  .app-header-search { min-width: 100% !important; margin-top: 12px; }
}
@media (max-width: 1200px) {
  .app-header-nav-text { display: none !important; }
}
`;

export default headerStyles;
