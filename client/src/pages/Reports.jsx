import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import AppShell from "../components/AppShell";
import { useToast } from "../components/Toast";

function Reports() {
    const [monitors, setMonitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [reportData, setReportData] = useState({});
    const navigate = useNavigate();
    const showToast = useToast();
    const [refreshing, setRefreshing] = useState(false);

    const fetchMonitors = async () => {
        try {
            const response = await api.get("/monitors");
            setMonitors(response.data.monitors);
        } catch {
            showToast("Failed to load monitors", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        fetchMonitors();
    }, []);

    const toggleView = async (monitor) => {
        if (expandedId === monitor._id) {
            setExpandedId(null);
            return;
        }
        setExpandedId(monitor._id);

        if (!reportData[monitor._id]) {
            try {
                const response = await api.get(`/monitors/${monitor._id}/stats`);
                setReportData((prev) => ({ ...prev, [monitor._id]: response.data.history }));
            } catch {
                showToast("Failed to load report data", "error");
            }
        }
    };
    const handleManualRefresh = async () => {
        setRefreshing(true);
        await fetchMonitors();
        setRefreshing(false);
        showToast("Refreshed");
    };

    const downloadReport = async (monitor) => {
        setDownloadingId(monitor._id);
        try {
            const response = await api.get(`/monitors/${monitor._id}/report`, { responseType: "blob" });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${monitor.name.replace(/[^a-z0-9]/gi, "_")}_report.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            showToast(`Report downloaded for "${monitor.name}"`);
        } catch {
            showToast("Failed to download report", "error");
        } finally {
            setDownloadingId(null);
        }
    };

    return (
        <AppShell title="Reports" onRefresh={handleManualRefresh} refreshing={refreshing}>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "20px" }}>
                View or export a 24-hour uptime report for any monitor.
            </p>

            {loading ? (
                <p style={{ color: "var(--text-secondary)" }}>Loading…</p>
            ) : monitors.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
                    <p>No monitors yet. Add one from the Dashboard first.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {monitors.map((monitor) => (
                        <div
                            key={monitor._id}
                            style={{
                                background: "var(--surface)",
                                border: "1px solid var(--border)",
                                borderRadius: "var(--radius)",
                                overflow: "hidden",
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
                                <div>
                                    <div style={{ fontWeight: 500, fontSize: "14px" }}>{monitor.name}</div>
                                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                                        {monitor.url}
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button
                                        onClick={() => toggleView(monitor)}
                                        style={{
                                            background: "transparent",
                                            border: "1px solid var(--border)",
                                            color: "var(--text-secondary)",
                                            borderRadius: "var(--radius)",
                                            padding: "8px 16px",
                                            fontSize: "13px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        {expandedId === monitor._id ? "Hide" : "View"}
                                    </button>
                                    <button
                                        onClick={() => downloadReport(monitor)}
                                        disabled={downloadingId === monitor._id}
                                        style={{
                                            background: "var(--accent)",
                                            border: "none",
                                            color: "#fff",
                                            borderRadius: "var(--radius)",
                                            padding: "8px 16px",
                                            fontSize: "13px",
                                            cursor: "pointer",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {downloadingId === monitor._id ? "Downloading…" : "⬇ Export CSV"}
                                    </button>
                                </div>
                            </div>

                            {expandedId === monitor._id && (
                                <div style={{ borderTop: "1px solid var(--border)" }}>
                                    {!reportData[monitor._id] ? (
                                        <p style={{ padding: "16px 20px", color: "var(--text-secondary)", fontSize: "13px" }}>Loading…</p>
                                    ) : reportData[monitor._id].length === 0 ? (
                                        <p style={{ padding: "16px 20px", color: "var(--text-muted)", fontSize: "13px" }}>No checks recorded yet.</p>
                                    ) : (
                                        <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                                                <thead>
                                                    <tr style={{ position: "sticky", top: 0, background: "var(--bg)" }}>
                                                        <th style={thStyle}>Date</th>
                                                        <th style={thStyle}>Time</th>
                                                        <th style={thStyle}>Status</th>
                                                        <th style={thStyle}>Status Code</th>
                                                        <th style={thStyle}>Response Time</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {reportData[monitor._id]
                                                        .slice()
                                                        .reverse()
                                                        .map((check) => {
                                                            const date = new Date(check.checkedAt);
                                                            return (
                                                                <tr key={check._id} style={{ borderTop: "1px solid var(--border)" }}>
                                                                    <td style={tdStyle}>{date.toLocaleDateString()}</td>
                                                                    <td style={tdStyle}>{date.toLocaleTimeString()}</td>
                                                                    <td style={tdStyle}>
                                                                        <span
                                                                            style={{
                                                                                color: check.status === "up" ? "var(--up)" : "var(--down)",
                                                                                fontWeight: 600,
                                                                                textTransform: "uppercase",
                                                                                fontSize: "11px",
                                                                            }}
                                                                        >
                                                                            {check.status}
                                                                        </span>
                                                                    </td>
                                                                    <td style={tdStyle}>{check.statusCode ?? "—"}</td>
                                                                    <td style={tdStyle}>{check.responseTime}ms</td>
                                                                </tr>
                                                            );
                                                        })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </AppShell>
    );
}

const thStyle = {
    textAlign: "left",
    padding: "10px 20px",
    fontSize: "11px",
    fontWeight: 600,
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
};

const tdStyle = {
    padding: "9px 20px",
    color: "var(--text-primary)",
};

export default Reports;