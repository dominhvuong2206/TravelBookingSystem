const bookingStyles = {
    page: {
        padding: "24px 0 40px",
    },
    title: {
        fontWeight: 750,
        color: "#0f172a",
        marginBottom: 18,
    },
    serviceCard: {
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        overflow: "hidden",
        boxShadow: "none",
    },
    image: {
        height: 330,
        objectFit: "cover",
    },
    body: {
        padding: 22,
    },
    serviceTitle: {
        fontWeight: 750,
        color: "#0f172a",
        marginBottom: 10,
    },
    serviceDesc: {
        color: "#475569",
        lineHeight: 1.65,
    },
    infoGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: 12,
        marginTop: 18,
    },
    infoItem: {
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: 12,
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        background: "#f8fafc",
    },
    infoIcon: {
        width: 34,
        height: 34,
        borderRadius: 8,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#1d4ed8",
        background: "#eff6ff",
        flex: "0 0 auto",
    },
    infoLabel: {
        color: "#64748b",
        fontSize: "0.84rem",
    },
    infoValue: {
        color: "#0f172a",
        fontWeight: 700,
    },
    formCard: {
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        overflow: "hidden",
        boxShadow: "none",
        position: "sticky",
        top: 18,
    },
    formBody: {
        padding: 24,
    },
    formTitle: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontWeight: 750,
        color: "#0f172a",
        marginBottom: 18,
    },
    totalBox: {
        border: "1px solid #e2e8f0",
        background: "#f8fafc",
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
    },
    totalLabel: {
        color: "#475569",
        fontWeight: 600,
    },
    totalValue: {
        color: "#ea580c",
        fontSize: "1.55rem",
        fontWeight: 750,
    },
    submitButton: {
        width: "100%",
        fontWeight: 700,
    },
};

export const bookingResponsive = `
@media (max-width: 992px) {
  .booking-responsive-form { position: static !important; }
}
@media (max-width: 576px) {
  .booking-responsive-grid { grid-template-columns: 1fr !important; }
}
`;

export default bookingStyles;
