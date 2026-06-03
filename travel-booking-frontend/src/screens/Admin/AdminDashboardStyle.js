const adminDashboardStyles = {
    page: {
        marginTop: 28,
        marginBottom: 48,
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: 16,
        flexWrap: "wrap",
        marginBottom: 18,
    },
    title: {
        fontSize: 32,
        fontWeight: 750,
        color: "#0f172a",
        margin: 0,
    },
    subtitle: {
        color: "#64748b",
        marginTop: 6,
        marginBottom: 0,
    },
    card: {
        border: "1px solid #e2e8f0",
        borderRadius: 8,
        boxShadow: "none",
    },
    metricLabel: {
        color: "#64748b",
        fontSize: 15,
        marginBottom: 8,
    },
    metricValue: {
        fontSize: 26,
        fontWeight: 800,
        margin: 0,
    },
    toolbar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
        marginBottom: 16,
    },
    tableTitle: {
        fontSize: 22,
        fontWeight: 750,
        color: "#0f172a",
        marginBottom: 14,
    },
    progressTrack: {
        height: 8,
        borderRadius: 999,
        background: "#e2e8f0",
        overflow: "hidden",
        minWidth: 120,
    },
    progressFill: {
        height: "100%",
        background: "#2563eb",
        borderRadius: 999,
    },
};

export default adminDashboardStyles;
