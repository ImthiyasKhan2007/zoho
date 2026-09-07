import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import AppShell from "../components/AppShell";
import { useToast } from "../components/Toast";

function MonitorDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const showToast = useToast();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [maintenances, setMaintenances] = useState([]);
    const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
    const [maintTitle, setMaintTitle] = useState("");
    const [maintStart, setMaintStart] = useState("");
    const [maintEnd, setMaintEnd] = useState("");
    const [maintSubmitting, setMaintSubmitting] = useState(false);
    const [error, setError] = useState("");

    const fetchStats = async () => {
        try {
            const response = await api.get(`/monitors/${id}/stats`);
            setData(response.data);
        } catch (err) {
            setError("Failed to load monitor stats.");
        } finally {
            setLoading(false);
        }

    };
    const fetchMaintenances = async () => {
        try {
            const response = await api.get("/maintenance");
            setMaintenances(response.data.maintenances.filter((m) => m.monitor?._id === id));
        } catch {
            // silently ignore for now
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        fetchStats();
        fetchMaintenances();
        const poll = setInterval(fetchStats, 30000);
        return () => clearInterval(poll);
    }, [id]);
    const handleCreateMaintenance = async (e) => {
        e.preventDefault();
        setMaintSubmitting(true);
        try {
            await api.post("/maintenance", {
                monitorId: id,
                title: maintTitle,
                startTime: maintStart,
                endTime: maintEnd,
            });
            setMaintTitle("");
            setMaintStart("");
            setMaintEnd("");
            setShowMaintenanceForm(false);
            fetchMaintenances();
            showToast("Maintenance window scheduled");
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to schedule maintenance", "error");
        } finally {
            setMaintSubmitting(false);
        }
    };

    const handleDeleteMaintenance = async (maintId) => {
        try {
            await api.delete(`/maintenance/${maintId}`);
            fetchMaintenances();
            showToast("Maintenance window removed");
        } catch {
            showToast("Failed to remove maintenance window", "error");
        }
    };

    const downloadReport = async () => {
        try {
            const response = await api.get(
                `/monitors/${id}/report`,
                {
                    responseType: "blob"
                }
            );

            const url = window.URL.createObjectURL(
                new Blob([response.data])
            );

            const link = document.createElement("a");

            link.href = url;
            link.setAttribute(
                "download",
                `${data?.monitor?.name || "monitor"}_report.csv`
            );

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Failed to download report", err);
        }
    };

    if (loading) {
        return (
            <div style={pageWrap}>
                <p style={{ color: "var(--text-secondary)" }}>
                    Loading…
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={pageWrap}>
                <p style={{ color: "var(--down)" }}>
                    {error}
                </p>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    const {
        monitor,
        stats,
        history,
        incidents
    } = data;

    const statusStyles = {
        up: {
            color: "var(--up)",
            background: "var(--up-bg)"
        },

        down: {
            color: "var(--down)",
            background: "var(--down-bg)"
        },

        pending: {
            color: "var(--pending)",
            background: "var(--pending-bg)"
        }
    };

    return (
        <AppShell title={monitor.name}>

            <Link
                to="/dashboard"
                style={{
                    fontSize: "13px",
                    color: "var(--text-secondary)"
                }}
            >
                Back to dashboard
            </Link>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    margin: "18px 0 16px"
                }}
            >
                <h1
                    style={{
                        fontSize: "24px",
                        fontWeight: 600,
                        margin: 0
                    }}
                >
                    {monitor.name}
                </h1>

                <span
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "5px 10px",
                        borderRadius: "20px",
                        textTransform: "uppercase",
                        color:
                            statusStyles[monitor.currentStatus]?.color,
                        background:
                            statusStyles[monitor.currentStatus]?.background
                    }}
                >
                    <span
                        style={{
                            width: "7px",
                            height: "7px",
                            borderRadius: "50%",
                            background:
                                statusStyles[monitor.currentStatus]?.color
                        }}
                    />

                    {monitor.currentStatus}
                </span>
            </div>

            <a
                href={monitor.url}
                target="_blank"
                rel="noreferrer"
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "14px",
                    color: "var(--text-secondary)",
                    textDecoration: "none",
                    wordBreak: "break-all"
                }}
            >
                <span>🔗</span>
                <span>{monitor.url}</span>
            </a>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "12px",
                    marginBottom: "8px"
                }}
            >
                <span
                    style={{
                        fontSize: "12px",
                        color: "var(--text-muted)"
                    }}
                >
                    Last checked: {new Date().toLocaleTimeString()}
                </span>

                <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                        setLoading(true);
                        fetchStats();
                    }}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "7px",
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                        borderRadius: "var(--radius)",
                        padding: "8px 14px",
                        fontSize: "13px",
                        fontWeight: 500,
                        cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? 0.6 : 1
                    }}
                >
                    {loading ? "⟳ Refreshing..." : "↻ Refresh"}
                </button>
            </div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "16px",
                    marginBottom: "8px"
                }}
            >
                <button
                    type="button"
                    onClick={downloadReport}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                        borderRadius: "var(--radius)",
                        padding: "9px 16px",
                        fontSize: "13px",
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor =
                            "var(--text-secondary)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor =
                            "var(--border)";
                    }}
                >
                    <span style={{ fontSize: "15px" }}>↓</span>
                    <span>Download CSV Report</span>
                </button>
            </div>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: "12px",
                    margin: "28px 0"
                }}
            >
                <StatCard
                    label="Uptime (24h)"
                    value={
                        stats.uptimePercentage !== null
                            ? stats.uptimePercentage + "%"
                            : "-"
                    }
                />

                <StatCard
                    label="Avg response"
                    value={
                        stats.avgResponseTime !== null
                            ? stats.avgResponseTime + "ms"
                            : "-"
                    }
                />

                <StatCard
                    label="Total checks"
                    value={stats.totalChecks}
                />

                <StatCard
                    label="Down events"
                    value={stats.downChecks}
                    color={
                        stats.downChecks > 0
                            ? "var(--down)"
                            : undefined
                    }
                />
            </div>
            <div style={{ marginTop: "28px", marginBottom: "28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h3 style={{ fontSize: "15px" }}>Maintenance windows</h3>
                    <button
                        onClick={() => setShowMaintenanceForm(!showMaintenanceForm)}
                        style={{
                            background: "transparent",
                            border: "none",
                            color: "var(--accent)",
                            fontSize: "12px",
                            cursor: "pointer",
                        }}
                    >
                        {showMaintenanceForm ? "Cancel" : "+ Schedule maintenance"}
                    </button>
                </div>

                {showMaintenanceForm && (
                    <form
                        onSubmit={handleCreateMaintenance}
                        style={{
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius)",
                            padding: "16px",
                            marginBottom: "12px",
                            display: "grid",
                            gap: "10px",
                        }}
                    >
                        <input
                            type="text"
                            placeholder="Title (e.g. Server upgrade)"
                            value={maintTitle}
                            onChange={(e) => setMaintTitle(e.target.value)}
                            required
                            style={inputStyle}
                        />
                        <div style={{ display: "flex", gap: "10px" }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Start</label>
                                <input
                                    type="datetime-local"
                                    value={maintStart}
                                    onChange={(e) => setMaintStart(e.target.value)}
                                    required
                                    style={inputStyle}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>End</label>
                                <input
                                    type="datetime-local"
                                    value={maintEnd}
                                    onChange={(e) => setMaintEnd(e.target.value)}
                                    required
                                    style={inputStyle}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={maintSubmitting}
                            style={{
                                background: "var(--accent)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "var(--radius)",
                                padding: "9px",
                                fontWeight: 500,
                            }}
                        >
                            {maintSubmitting ? "Scheduling…" : "Schedule"}
                        </button>
                    </form>
                )}

                {maintenances.length === 0 ? (
                    <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>No maintenance windows scheduled.</p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {maintenances.map((m) => (
                            <div
                                key={m._id}
                                style={{
                                    background: "var(--surface)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "var(--radius)",
                                    padding: "12px 16px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    fontSize: "13px",
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 500 }}>{m.title}</div>
                                    <div style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                                        {new Date(m.startTime).toLocaleString()} → {new Date(m.endTime).toLocaleString()}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteMaintenance(m._id)}
                                    style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "16px" }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <h3
                style={{
                    fontSize: "15px",
                    marginBottom: "12px"
                }}
            >
                Response time (last 24h)
            </h3>

            <div
                style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    padding: "20px",
                    marginBottom: "28px"
                }}
            >
                {history.length === 0 ? (
                    <p
                        style={{
                            color: "var(--text-muted)",
                            fontSize: "13px"
                        }}
                    >
                        No checks recorded yet.
                    </p>
                ) : (
                    <ResponseChart history={history} />
                )}
            </div>

            <h3
                style={{
                    fontSize: "15px",
                    marginBottom: "12px"
                }}
            >
                Incident history (24h)
            </h3>

            <div style={{ marginBottom: "28px" }}>

                {incidents.length === 0 ? (
                    <div
                        style={{
                            background: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius)",
                            padding: "16px",
                            color: "var(--text-muted)",
                            fontSize: "13px"
                        }}
                    >
                        No incidents in the last 24 hours.
                    </div>
                ) : (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px"
                        }}
                    >
                        {incidents.map(function (inc, i) {
                            return (
                                <div
                                    key={i}
                                    style={{
                                        background: "var(--down-bg)",
                                        border: "1px solid var(--down)",
                                        borderRadius: "var(--radius)",
                                        padding: "12px 16px",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        fontSize: "13px"
                                    }}
                                >
                                    <span
                                        style={{
                                            color: "var(--down)",
                                            fontWeight: 500
                                        }}
                                    >
                                        Down from{" "}
                                        {new Date(
                                            inc.start
                                        ).toLocaleString()}{" "}
                                        to{" "}
                                        {new Date(
                                            inc.end
                                        ).toLocaleString()}
                                    </span>

                                    <span
                                        style={{
                                            color:
                                                "var(--text-secondary)"
                                        }}
                                    >
                                        {inc.durationMinutes} min
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

            </div>

            <h3
                style={{
                    fontSize: "15px",
                    marginBottom: "12px"
                }}
            >
                Recent checks
            </h3>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px"
                }}
            >
                {history
                    .slice()
                    .reverse()
                    .slice(0, 20)
                    .map(function (check) {
                        return (
                            <div
                                key={check._id}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    background: "var(--surface)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "var(--radius)",
                                    padding: "10px 16px",
                                    fontSize: "13px"
                                }}
                            >
                                <span
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px"
                                    }}
                                >
                                    <span
                                        style={{
                                            width: "8px",
                                            height: "8px",
                                            borderRadius: "50%",
                                            background:
                                                check.status === "up"
                                                    ? "var(--up)"
                                                    : "var(--down)"
                                        }}
                                    />

                                    {new Date(
                                        check.checkedAt
                                    ).toLocaleString()}
                                </span>

                                <span
                                    style={{
                                        color:
                                            "var(--text-secondary)"
                                    }}
                                >
                                    {check.statusCode != null
                                        ? check.statusCode
                                        : "-"}{" "}
                                    - {check.responseTime}ms
                                </span>
                            </div>
                        );
                    })}
            </div>

        </AppShell >
    );
}

function StatCard(props) {
    return (
        <div
            style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "16px"
            }}
        >
            <div
                style={{
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    marginBottom: "6px"
                }}
            >
                {props.label}
            </div>

            <div
                style={{
                    fontSize: "22px",
                    fontWeight: 600,
                    color:
                        props.color ||
                        "var(--text-primary)"
                }}
            >
                {props.value}
            </div>
        </div>
    );
}

function ResponseChart(props) {
    const history = props.history;

    const upChecks = history.filter(function (h) {
        return h.responseTime != null;
    });

    const max = Math.max.apply(
        Math,
        upChecks
            .map(function (h) {
                return h.responseTime;
            })
            .concat([100])
    );

    return (
        <div
            style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "4px",
                height: "140px"
            }}
        >
            {history.map(function (check) {

                const heightPct =
                    check.status === "up"
                        ? Math.max(
                            (check.responseTime / max) * 100,
                            4
                        )
                        : 100;

                return (
                    <div
                        key={check._id}
                        title={
                            check.status.toUpperCase() +
                            " - " +
                            check.responseTime +
                            "ms - " +
                            new Date(
                                check.checkedAt
                            ).toLocaleTimeString()
                        }
                        style={{
                            flex: 1,
                            height: heightPct + "%",
                            background:
                                check.status === "up"
                                    ? "var(--up)"
                                    : "var(--down)",
                            borderRadius: "2px",
                            minWidth: "4px"
                        }}
                    />
                );
            })}
        </div>
    );
}

const pageWrap = {
    maxWidth: "760px",
    margin: "0 auto",
    padding: "40px 20px"
};

const inputStyle = {
    width: "100%",
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "9px 12px",
    color: "var(--text-primary)",
    outline: "none",
    fontSize: "13px",
};

export default MonitorDetail;