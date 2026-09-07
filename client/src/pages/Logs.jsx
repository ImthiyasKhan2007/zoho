import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import AppShell from "../components/AppShell";
import { useToast } from "../components/Toast";

function Logs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState("");
    const [levelFilter, setLevelFilter] = useState("all");

    const [source, setSource] = useState("");
    const [level, setLevel] = useState("info");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const navigate = useNavigate();
    const showToast = useToast();

    const fetchLogs = async () => {
        try {
            const params = {};
            if (search) params.search = search;
            if (levelFilter !== "all") params.level = levelFilter;
            const response = await api.get("/logs", { params });
            setLogs(response.data.logs);
        } catch {
            showToast("Failed to load logs", "error");
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
        fetchLogs();
    }, [search, levelFilter]);

    const handleManualRefresh = async () => {
        setRefreshing(true);
        await fetchLogs();
        setRefreshing(false);
        showToast("Refreshed");
    };

    const handleAddLog = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post("/logs", { source, level, message });
            setSource("");
            setMessage("");
            setLevel("info");
            fetchLogs();
            showToast("Log added");
        } catch {
            showToast("Failed to add log", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/logs/${id}`);
            fetchLogs();
            showToast("Log deleted");
        } catch {
            showToast("Failed to delete log", "error");
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm("Delete all logs? This cannot be undone.")) return;
        try {
            await api.delete("/logs/clear");
            fetchLogs();
            showToast("All logs cleared");
        } catch {
            showToast("Failed to clear logs", "error");
        }
    };

    const levelStyles = {
        info: { color: "var(--accent)", background: "rgba(91, 108, 255, 0.12)" },
        warning: { color: "var(--pending)", background: "var(--pending-bg)" },
        error: { color: "var(--down)", background: "var(--down-bg)" },
    };

    return (
        <AppShell title="Logs" onRefresh={handleManualRefresh} refreshing={refreshing}>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "20px" }}>
                Track custom events, errors, and messages from your monitors and servers.
            </p>

            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "15px", marginBottom: "16px" }}>Add a log entry</h3>
                <form onSubmit={handleAddLog} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr auto", gap: "10px" }}>
                    <input
                        type="text"
                        placeholder="Source (e.g. Deploy Bot)"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    <select value={level} onChange={(e) => setLevel(e.target.value)} style={inputStyle}>
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                        <option value="error">Error</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    <button
                        type="submit"
                        disabled={submitting}
                        style={{
                            background: "var(--accent)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "var(--radius)",
                            padding: "9px 18px",
                            fontWeight: 500,
                        }}
                    >
                        {submitting ? "Adding…" : "Add"}
                    </button>
                </form>
            </div>

            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                <input
                    type="text"
                    placeholder="Search logs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ ...inputStyle, flex: 1 }}
                />
                <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} style={inputStyle}>
                    <option value="all">All levels</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                </select>
                <button
                    onClick={handleClearAll}
                    style={{
                        background: "transparent",
                        border: "1px solid var(--down)",
                        color: "var(--down)",
                        borderRadius: "var(--radius)",
                        padding: "9px 16px",
                        fontSize: "13px",
                    }}
                >
                    Clear all
                </button>
            </div>

            {loading ? (
                <p style={{ color: "var(--text-secondary)" }}>Loading…</p>
            ) : logs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
                    <p>No logs yet.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {logs.map((log) => (
                        <div
                            key={log._id}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                background: "var(--surface)",
                                border: "1px solid var(--border)",
                                borderRadius: "var(--radius)",
                                padding: "10px 16px",
                                fontSize: "13px",
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                                <span
                                    style={{
                                        fontSize: "10px",
                                        fontWeight: 600,
                                        padding: "3px 8px",
                                        borderRadius: "20px",
                                        textTransform: "uppercase",
                                        ...levelStyles[log.level],
                                        flexShrink: 0,
                                    }}
                                >
                                    {log.level}
                                </span>
                                <span style={{ color: "var(--text-secondary)", flexShrink: 0 }}>{log.source}</span>
                                <span style={{ color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {log.message}
                                </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                                <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                                    {new Date(log.createdAt).toLocaleString()}
                                </span>
                                <button
                                    onClick={() => handleDelete(log._id)}
                                    style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AppShell>
    );
}

const inputStyle = {
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "9px 12px",
    color: "var(--text-primary)",
    outline: "none",
    fontSize: "13px",
};

export default Logs;