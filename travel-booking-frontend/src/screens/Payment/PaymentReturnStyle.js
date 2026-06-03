const paymentReturnStyles = {
    page: {
        maxWidth: 900,
        margin: "48px auto",
    },
    card: {
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        boxShadow: "none",
    },
    body: {
        padding: 32,
    },
    icon: {
        width: 56,
        height: 56,
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
        fontSize: 24,
    },
    successIcon: {
        background: "#dcfce7",
        color: "#15803d",
    },
    pendingIcon: {
        background: "#dbeafe",
        color: "#1d4ed8",
    },
    title: {
        fontSize: 30,
        fontWeight: 700,
        color: "#0f172a",
        marginBottom: 10,
    },
    text: {
        color: "#475569",
        fontSize: 17,
        lineHeight: 1.6,
        marginBottom: 18,
    },
    summary: {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: 14,
        margin: "22px 0 24px",
    },
    item: {
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        padding: "14px 16px",
        background: "#f8fafc",
    },
    label: {
        display: "block",
        color: "#64748b",
        fontSize: 14,
        marginBottom: 6,
    },
    value: {
        color: "#0f172a",
        fontSize: 17,
        fontWeight: 700,
        overflowWrap: "anywhere",
    },
    highlight: {
        color: "#ea580c",
        fontSize: 22,
        fontWeight: 800,
    },
    note: {
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        padding: "14px 16px",
        background: "#f8fafc",
        color: "#334155",
        marginBottom: 22,
    },
    actions: {
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
    },
};

export default paymentReturnStyles;
