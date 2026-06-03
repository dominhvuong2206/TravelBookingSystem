const productDetailsStyles = {
    page: {
        padding: "24px 0 40px",
    },
    breadcrumb: {
        color: "#64748b",
        fontSize: "0.95rem",
        marginBottom: 16,
    },
    hero: {
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.05fr) minmax(320px, 0.95fr)",
        gap: 28,
        alignItems: "stretch",
    },
    imageWrap: {
        borderRadius: 8,
        overflow: "hidden",
        background: "#f1f5f9",
        minHeight: 420,
        boxShadow: "none",
        border: "1px solid #e2e8f0",
    },
    image: {
        width: "100%",
        height: "100%",
        minHeight: 420,
        objectFit: "cover",
        display: "block",
    },
    summary: {
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        background: "#ffffff",
        padding: 28,
        boxShadow: "none",
    },
    category: {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px",
        borderRadius: 999,
        background: "#f8fafc",
        color: "#1d4ed8",
        fontWeight: 700,
        fontSize: "0.9rem",
        marginBottom: 12,
    },
    title: {
        fontSize: "2rem",
        lineHeight: 1.2,
        fontWeight: 750,
        color: "#0f172a",
        marginBottom: 12,
    },
    rating: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        color: "#475569",
        marginBottom: 16,
        flexWrap: "wrap",
    },
    stars: {
        display: "inline-flex",
        gap: 2,
        color: "#f59e0b",
    },
    price: {
        color: "#ea580c",
        fontSize: "2rem",
        fontWeight: 750,
        marginBottom: 16,
    },
    desc: {
        color: "#475569",
        lineHeight: 1.7,
        marginBottom: 20,
    },
    metaGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: 12,
        marginBottom: 22,
    },
    meta: {
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: 14,
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        background: "#f8fafc",
    },
    metaIcon: {
        width: 38,
        height: 38,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        background: "#eff6ff",
        color: "#1d4ed8",
        flex: "0 0 auto",
    },
    metaLabel: {
        color: "#64748b",
        fontSize: "0.85rem",
        marginBottom: 2,
    },
    metaValue: {
        color: "#0f172a",
        fontWeight: 700,
    },
    actions: {
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
    },
    section: {
        marginTop: 28,
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        background: "#ffffff",
        padding: 24,
    },
    sectionTitle: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        color: "#0f172a",
        fontWeight: 750,
        marginBottom: 16,
    },
    reviewForm: {
        border: "1px solid #e2e8f0",
        background: "#f8fafc",
        borderRadius: 8,
        padding: 16,
        marginBottom: 18,
    },
    ratingSelect: {
        maxWidth: 180,
    },
    reviewList: {
        display: "grid",
        gap: 12,
    },
    reviewItem: {
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        padding: 16,
        background: "#ffffff",
    },
    reviewAvatar: {
        width: 48,
        height: 48,
        objectFit: "cover",
    },
    reply: {
        borderLeft: "3px solid #1d4ed8",
        background: "#f8fafc",
        borderRadius: 6,
        padding: "10px 12px",
        marginTop: 10,
    },
};

export const productDetailsResponsive = `
@media (max-width: 992px) {
  .service-detail-responsive-hero { grid-template-columns: 1fr !important; }
}
@media (max-width: 576px) {
  .service-detail-responsive-meta { grid-template-columns: 1fr !important; }
}
`;

export default productDetailsStyles;
