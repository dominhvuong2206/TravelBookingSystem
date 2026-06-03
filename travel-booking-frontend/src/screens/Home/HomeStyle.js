const homeStyles = {
    hero: {
        position: "relative",
        margin: "18px 0 24px",
        minHeight: 300,
        borderRadius: 10,
        overflow: "hidden",
        backgroundImage: "linear-gradient(90deg, rgba(15, 23, 42, 0.68) 0%, rgba(15, 23, 42, 0.28) 100%), url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        padding: "30px 38px",
        border: "1px solid #e2e8f0",
        boxShadow: "none",
    },
    heroContent: {
        maxWidth: 820,
        color: "#ffffff",
    },
    heroTag: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: "rgba(255, 255, 255, 0.16)",
        border: "1px solid rgba(255,255,255,0.32)",
        borderRadius: 999,
        padding: "7px 12px",
        fontWeight: 700,
        marginBottom: 16,
    },
    heroTitle: {
        fontSize: "2.35rem",
        lineHeight: 1.12,
        fontWeight: 800,
        marginBottom: 14,
        maxWidth: 860,
        textShadow: "0 2px 10px rgba(15, 23, 42, 0.18)",
    },
    heroSub: {
        maxWidth: 670,
        fontSize: "1.02rem",
        lineHeight: 1.6,
        color: "#f8fafc",
        marginBottom: 22,
    },
    heroSearch: {
        maxWidth: 680,
        background: "#ffffff",
        borderRadius: 8,
        padding: 8,
        display: "flex",
        alignItems: "stretch",
        gap: 12,
        border: "1px solid #e2e8f0",
        boxShadow: "none",
    },
    filterCard: {
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        padding: 18,
        background: "#f8fafc",
        margin: "18px 0 24px",
        boxShadow: "none",
    },
    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        margin: "28px 0 14px",
    },
    sectionTitle: {
        color: "#0f172a",
        fontWeight: 800,
        margin: 0,
    },
    countText: {
        color: "#2563eb",
        fontWeight: 700,
        background: "transparent",
        border: "none",
        borderRadius: 0,
        padding: 0,
        whiteSpace: "nowrap",
    },
    categoryPills: {
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        marginBottom: 16,
    },
    serviceCard: {
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: "none",
        background: "#ffffff",
    },
    serviceImg: {
        height: 188,
        objectFit: "cover",
    },
    serviceTitle: {
        color: "#1e293b",
        fontWeight: 750,
        minHeight: 48,
        fontSize: "1.02rem",
    },
    price: {
        color: "#ea580c",
        fontWeight: 800,
        fontSize: "1.08rem",
        marginBottom: 6,
    },
    metaLine: {
        display: "flex",
        alignItems: "center",
        gap: 7,
        color: "#475569",
        fontSize: "0.92rem",
        marginTop: 5,
    },
    cardActions: {
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        marginTop: 14,
    },
    ctaBand: {
        marginTop: 28,
        borderRadius: 10,
        padding: "24px 28px",
        background: "#1e293b",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
        boxShadow: "none",
    },
};

export const homeResponsive = `
.home-filter-card .form-label {
  color: #334155;
  font-weight: 700;
}
.home-filter-card .form-control,
.home-filter-card .form-select,
.home-hero-search .form-control {
  border-color: #e2e8f0;
  min-height: 46px;
}
.home-filter-card .form-control:focus,
.home-filter-card .form-select:focus,
.home-hero-search .form-control:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 0.18rem rgba(37, 99, 235, 0.14);
}
@media (max-width: 992px) {
  .home-hero { padding: 30px 28px !important; }
}
@media (max-width: 576px) {
  .home-hero { padding: 28px 20px !important; min-height: 320px !important; }
  .home-hero-title { font-size: 2rem !important; }
  .home-hero-search { flex-direction: column !important; }
  .home-section-header { align-items: flex-start !important; flex-direction: column !important; }
}
`;

export default homeStyles;
