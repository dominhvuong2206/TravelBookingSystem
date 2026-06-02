const homeStyles = {
    hero: {
        position: "relative",
        margin: "22px 0 26px",
        minHeight: 330,
        borderRadius: 18,
        overflow: "hidden",
        backgroundImage: "linear-gradient(90deg, rgba(15, 23, 42, 0.78) 0%, rgba(37, 99, 235, 0.44) 52%, rgba(14, 165, 233, 0.18) 100%), url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        padding: "34px 44px",
        border: "1px solid rgba(191, 219, 254, 0.55)",
        boxShadow: "0 24px 56px rgba(37, 99, 235, 0.16)",
    },
    heroContent: {
        maxWidth: 820,
        color: "#ffffff",
    },
    heroTag: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: "rgba(37, 99, 235, 0.28)",
        border: "1px solid rgba(255,255,255,0.42)",
        borderRadius: 999,
        padding: "8px 14px",
        fontWeight: 700,
        marginBottom: 16,
        backdropFilter: "blur(8px)",
    },
    heroTitle: {
        fontSize: "2.55rem",
        lineHeight: 1.12,
        fontWeight: 850,
        marginBottom: 14,
        maxWidth: 860,
        textShadow: "0 3px 18px rgba(15, 23, 42, 0.28)",
    },
    heroSub: {
        maxWidth: 670,
        fontSize: "1.02rem",
        lineHeight: 1.6,
        color: "#eff6ff",
        marginBottom: 22,
    },
    heroSearch: {
        maxWidth: 680,
        background: "#ffffff",
        borderRadius: 14,
        padding: 10,
        display: "flex",
        alignItems: "stretch",
        gap: 12,
        border: "1px solid rgba(191, 219, 254, 0.95)",
        boxShadow: "0 20px 42px rgba(37, 99, 235, 0.22)",
    },
    filterCard: {
        border: "1px solid #bfdbfe",
        borderRadius: 16,
        padding: 22,
        background: "linear-gradient(180deg, #f8fbff 0%, #eef6ff 100%)",
        margin: "18px 0 24px",
        boxShadow: "0 16px 34px rgba(37, 99, 235, 0.08)",
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
        fontWeight: 850,
        margin: 0,
    },
    countText: {
        color: "#2563eb",
        fontWeight: 700,
        background: "#eff6ff",
        border: "1px solid #bfdbfe",
        borderRadius: 999,
        padding: "7px 12px",
        whiteSpace: "nowrap",
    },
    categoryPills: {
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        marginBottom: 16,
    },
    serviceCard: {
        border: "1px solid #dbeafe",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 12px 28px rgba(37, 99, 235, 0.08)",
        background: "#ffffff",
    },
    serviceImg: {
        height: 188,
        objectFit: "cover",
    },
    serviceTitle: {
        color: "#1e293b",
        fontWeight: 800,
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
        borderRadius: 16,
        padding: "24px 28px",
        background: "linear-gradient(135deg, #1d4ed8 0%, #0f172a 100%)",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
        boxShadow: "0 18px 36px rgba(37, 99, 235, 0.18)",
    },
};

export const homeResponsive = `
.home-service-card {
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}
.home-service-card:hover {
  transform: translateY(-4px);
  border-color: #93c5fd !important;
  box-shadow: 0 20px 42px rgba(37, 99, 235, 0.16) !important;
}
.home-filter-card .form-label {
  color: #1e3a8a;
  font-weight: 700;
}
.home-filter-card .form-control,
.home-filter-card .form-select,
.home-hero-search .form-control {
  border-color: #cbdff8;
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
