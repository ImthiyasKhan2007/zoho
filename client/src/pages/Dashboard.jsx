import { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../components/Toast";
import AppShell from "../components/AppShell";
function Dashboard() {
    const [monitors, setMonitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [interval, setInterval] = useState(5);
    const [submitting, setSubmitting] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [method, setMethod] = useState("GET");
    const [headersText, setHeadersText] = useState("");
    const [bodyText, setBodyText] = useState("");
    const [expectedStatusCode, setExpectedStatusCode] = useState("");
    const [alertThreshold, setAlertThreshold] = useState(1);
    const [checkType, setCheckType] = useState("http");
    const [port, setPort] = useState("");

    const navigate = useNavigate();
    const showToast = useToast();


    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
        }
    }, []);

    const fetchMonitors = async () => {
        try {
            const response = await api.get("/monitors");
            setMonitors(response.data.monitors);
        } catch (err) {
            setError("Failed to load monitors. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMonitors();
        const poll = setInterval(fetchMonitors, 30000);
        return () => clearInterval(poll);
    }, []);

    const handleManualRefresh = async () => {
        setRefreshing(true);
        await fetchMonitors();
        setRefreshing(false);
        showToast("Refreshed");
    };

    const handleAddMonitor = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");

        let headersObj = {};
        if (headersText.trim()) {
            headersText.split("\n").forEach((line) => {
                const [key, ...rest] = line.split(":");
                if (key && rest.length) {
                    headersObj[key.trim()] = rest.join(":").trim();
                }
            });
        }

        try {
            await api.post("/monitors", {
                name,
                url,
                interval: Number(interval),
                method,
                headers: headersObj,
                body: bodyText,
                expectedStatusCode: expectedStatusCode ? Number(expectedStatusCode) : null,
                alertThreshold: Number(alertThreshold),
                checkType,
                port: checkType === "tcp" ? Number(port) : null,
            });
            setName("");
            setUrl("");
            setInterval(5);
            setMethod("GET");
            setHeadersText("");
            setBodyText("");
            setExpectedStatusCode("");
            setAlertThreshold(1);
            setCheckType("http");
            setPort("");
            setShowAdvanced(false);
            fetchMonitors();
            showToast(`"${name}" added successfully`);
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to add monitor.";
            setError(msg);
            showToast(msg, "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this monitor?")) return;
        try {
            await api.delete(`/monitors/${id}`);
            fetchMonitors();
            showToast("Monitor deleted");
        } catch (err) {
            setError("Failed to delete monitor.");
            showToast("Failed to delete monitor", "error");
        }
    };

    const handleTogglePause = async (monitor) => {
        try {
            await api.put(`/monitors/${monitor._id}`, { isActive: !monitor.isActive });
            fetchMonitors();
            showToast(monitor.isActive ? `"${monitor.name}" paused` : `"${monitor.name}" resumed`);
        } catch (err) {
            showToast("Failed to update monitor", "error");
        }
    };
    const handleTogglePublic = async (monitor) => {
        try {
            await api.put(`/monitors/${monitor._id}`, { isPublic: !monitor.isPublic });
            fetchMonitors();
            showToast(monitor.isPublic ? "Removed from public status page" : "Added to public status page");
        } catch {
            showToast("Failed to update monitor", "error");
        }
    };

    const upCount = monitors.filter((m) => m.status === "up").length;
    const downCount = monitors.filter((m) => m.status === "down").length;

    const statusStyles = {
        up: { color: "var(--up)", background: "var(--up-bg)" },
        down: { color: "var(--down)", background: "var(--down-bg)" },
        pending: { color: "var(--pending)", background: "var(--pending-bg)" },
    };

    return (
        <AppShell>
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(0.7); }
                }
            `}</style>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "28px" }}>
                <StatCard label="Total monitors" value={monitors.length} />
                <StatCard label="Up" value={upCount} color="var(--up)" />
                <StatCard label="Down" value={downCount} color="var(--down)" />
            </div>

            {error && (
                <div style={{ background: "var(--down-bg)", color: "var(--down)", padding: "10px 14px", borderRadius: "var(--radius)", fontSize: "13px", marginBottom: "16px" }}>
                    {error}
                </div>
            )}

            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px", marginBottom: "28px" }}>
                <h3 style={{ fontSize: "15px", marginBottom: "16px" }}>Add a monitor</h3>
                <form onSubmit={handleAddMonitor} style={{ display: "grid", gridTemplateColumns: "1.2fr 1.6fr auto auto", gap: "10px", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "8px", gridColumn: "1 / -1", marginBottom: "4px" }}>
                        <button
                            type="button"
                            onClick={() => setCheckType("http")}
                            style={{
                                padding: "6px 14px",
                                borderRadius: "20px",
                                border: checkType === "http" ? "1px solid var(--accent)" : "1px solid var(--border)",
                                background: checkType === "http" ? "var(--accent)" : "transparent",
                                color: checkType === "http" ? "#fff" : "var(--text-secondary)",
                                fontSize: "12px",
                                cursor: "pointer",
                            }}
                        >
                            🌐 Website
                        </button>
                        <button
                            type="button"
                            onClick={() => setCheckType("tcp")}
                            style={{
                                padding: "6px 14px",
                                borderRadius: "20px",
                                border: checkType === "tcp" ? "1px solid var(--accent)" : "1px solid var(--border)",
                                background: checkType === "tcp" ? "var(--accent)" : "transparent",
                                color: checkType === "tcp" ? "#fff" : "var(--text-secondary)",
                                fontSize: "12px",
                                cursor: "pointer",
                            }}
                        >
                            🔌 Network Port
                        </button>
                    </div>

                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    <input
                        type={checkType === "tcp" ? "text" : "url"}
                        placeholder={checkType === "tcp" ? "Hostname or IP (e.g. 192.168.1.1)" : "https://example.com"}
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    {checkType === "tcp" && (
                        <input
                            type="number"
                            placeholder="Port (e.g. 3306)"
                            value={port}
                            onChange={(e) => setPort(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    )}
                    <select value={interval} onChange={(e) => setInterval(e.target.value)} style={inputStyle}>
                        <option value={1}>Every 1 min</option>
                        <option value={5}>Every 5 min</option>
                        <option value={10}>Every 10 min</option>
                        <option value={30}>Every 30 min</option>
                    </select>
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
                            whiteSpace: "nowrap",
                        }}
                    >
                        {submitting ? "Adding…" : "Add"}
                    </button>

                    {checkType === "http" && (
                        <div style={{ marginTop: "10px", gridColumn: "1 / -1" }}>
                            <button
                                type="button"
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "var(--accent)",
                                    fontSize: "12px",
                                    cursor: "pointer",
                                    padding: 0,
                                }}
                            >
                                {showAdvanced ? "− Hide advanced options" : "+ Advanced (API monitoring)"}
                            </button>

                            {showAdvanced && (
                                <div style={{ marginTop: "12px", display: "grid", gap: "8px" }}>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <select value={method} onChange={(e) => setMethod(e.target.value)} style={{ ...inputStyle, flex: "0 0 110px" }}>
                                            <option value="GET">GET</option>
                                            <option value="POST">POST</option>
                                            <option value="PUT">PUT</option>
                                            <option value="PATCH">PATCH</option>
                                            <option value="DELETE">DELETE</option>
                                        </select>
                                        <input
                                            type="number"
                                            placeholder="Expected status code (optional)"
                                            value={expectedStatusCode}
                                            onChange={(e) => setExpectedStatusCode(e.target.value)}
                                            style={{ ...inputStyle, flex: 1 }}
                                        />
                                    </div>
                                    <div style={{ marginTop: "10px" }}>
                                        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>
                                            Alert settings
                                        </div>
                                        <label style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                                            Send me an email after
                                        </label>
                                        <select value={alertThreshold} onChange={(e) => setAlertThreshold(e.target.value)} style={inputStyle}>
                                            <option value={1}>1 failed check (alert immediately)</option>
                                            <option value={2}>2 consecutive failed checks</option>
                                            <option value={3}>3 consecutive failed checks</option>
                                            <option value={5}>5 consecutive failed checks</option>
                                            <option value={10}>10 consecutive failed checks</option>
                                        </select>
                                    </div>
                                    <textarea
                                        placeholder={"Headers, one per line, e.g.\nAuthorization: Bearer xyz\nContent-Type: application/json"}
                                        value={headersText}
                                        onChange={(e) => setHeadersText(e.target.value)}
                                        rows={3}
                                        style={{ ...inputStyle, fontFamily: "monospace", fontSize: "12px", resize: "vertical" }}
                                    />
                                    <textarea
                                        placeholder='Request body (JSON), e.g. {"key": "value"}'
                                        value={bodyText}
                                        onChange={(e) => setBodyText(e.target.value)}
                                        rows={3}
                                        style={{ ...inputStyle, fontFamily: "monospace", fontSize: "12px", resize: "vertical" }}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </form>
            </div>

            {loading ? (
                <p style={{ color: "var(--text-secondary)" }}>Loading…</p>
            ) : monitors.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
                    <p>No monitors yet. Add one above to get started.</p>
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
                                padding: "16px 20px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                                    <Link to={`/monitors/${monitor._id}`} style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                                        {monitor.name}
                                    </Link>
                                    <span
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "5px",
                                            fontSize: "11px",
                                            fontWeight: 600,
                                            padding: "3px 10px",
                                            borderRadius: "20px",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.03em",
                                            ...statusStyles[monitor.status],
                                        }}
                                    >
                                        {monitor.status === "up" && (
                                            <span
                                                style={{
                                                    width: "6px",
                                                    height: "6px",
                                                    borderRadius: "50%",
                                                    background: "var(--up)",
                                                    animation: "pulse 1.6s ease-in-out infinite",
                                                }}
                                            />
                                        )}
                                        {monitor.status}
                                    </span>
                                    {monitor.checkType === "tcp" && (
                                        <span
                                            style={{
                                                fontSize: "11px",
                                                fontWeight: 600,
                                                padding: "3px 8px",
                                                borderRadius: "20px",
                                                background: "var(--surface)",
                                                border: "1px solid var(--border)",
                                                color: "var(--text-secondary)",
                                            }}
                                        >
                                            TCP :{monitor.port}
                                        </span>
                                    )}
                                    {!monitor.isActive && (
                                        <span
                                            style={{
                                                fontSize: "11px",
                                                fontWeight: 600,
                                                padding: "3px 8px",
                                                borderRadius: "20px",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.03em",
                                                color: "var(--text-muted)",
                                                background: "var(--border)",
                                            }}
                                        >
                                            Paused
                                        </span>
                                    )}
                                </div>
                                {monitor.checkType === "tcp" ? (
                                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{monitor.url}</span>
                                ) : (
                                    <a href={monitor.url} target="_blank" rel="noreferrer" style={{ fontSize: "13px" }}>
                                        {monitor.url}
                                    </a>
                                )}
                                {monitor.lastChecked && (
                                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                                        Last checked {new Date(monitor.lastChecked).toLocaleTimeString()}
                                    </div>
                                )}
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <button onClick={() => handleTogglePause(monitor)} style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-secondary)", borderRadius: "var(--radius)", padding: "7px 12px", fontSize: "13px" }}>
                                    {monitor.isActive ? "Pause" : "Resume"}
                                </button>
                                <button
                                    onClick={() => handleTogglePublic(monitor)}
                                    style={{
                                        background: monitor.isPublic ? "var(--accent)" : "transparent",
                                        border: monitor.isPublic ? "1px solid var(--accent)" : "1px solid var(--border)",
                                        color: monitor.isPublic ? "#fff" : "var(--text-secondary)",
                                        borderRadius: "var(--radius)",
                                        padding: "7px 12px",
                                        fontSize: "13px",
                                    }}
                                >
                                    {monitor.isPublic ? "Public ✓" : "Make Public"}
                                </button>
                                <button onClick={() => handleDelete(monitor._id)} style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: "var(--radius)", padding: "7px 12px", fontSize: "13px" }}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AppShell>
    );
}

function StatCard({ label, value, color }) {
    return (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "16px" }}>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>{label}</div>
            <div style={{ fontSize: "24px", fontWeight: 600, color: color || "var(--text-primary)" }}>{value}</div>
        </div>
    );
}

const inputStyle = {
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "9px 12px",
    color: "var(--text-primary)",
    outline: "none",
};


export default Dashboard;