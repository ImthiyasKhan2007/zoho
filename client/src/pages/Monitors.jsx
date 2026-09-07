import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import AppShell from "../components/AppShell";
import { useToast } from "../components/Toast";

function Monitors() {
    const [monitors, setMonitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
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
        const poll = setInterval(fetchMonitors, 30000);
        return () => clearInterval(poll);
    }, []);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete "${name}"?`)) return;
        try {
            await api.delete(`/monitors/${id}`);
            fetchMonitors();
            showToast("Monitor deleted");
        } catch {
            showToast("Failed to delete monitor", "error");
        }
    };
    const handleManualRefresh = async () => {
        setRefreshing(true);
        await fetchMonitors();
        setRefreshing(false);
        showToast("Refreshed");
    };
    const handleTogglePause = async (monitor) => {
        try {
            await api.put(`/monitors/${monitor._id}`, { isActive: !monitor.isActive });
            fetchMonitors();
            showToast(monitor.isActive ? `"${monitor.name}" paused` : `"${monitor.name}" resumed`);
        } catch {
            showToast("Failed to update monitor", "error");
        }
    };

    const statusStyles = {
        up: { color: "var(--up)", background: "var(--up-bg)" },
        down: { color: "var(--down)", background: "var(--down-bg)" },
        pending: { color: "var(--pending)", background: "var(--pending-bg)" },
    };

    const filtered = monitors.filter((m) => {
        const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.url.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || m.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <AppShell title="Monitors" onRefresh={handleManualRefresh} refreshing={refreshing}>
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <input
                    type="text"
                    placeholder="Search by name or URL..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        flex: 1,
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                        padding: "9px 12px",
                        color: "var(--text-primary)",
                        outline: "none",
                    }}
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                        padding: "9px 12px",
                        color: "var(--text-primary)",
                        outline: "none",
                    }}
                >
                    <option value="all">All statuses</option>
                    <option value="up">Up</option>
                    <option value="down">Down</option>
                    <option value="pending">Pending</option>
                </select>
            </div>

            {loading ? (
                <p style={{ color: "var(--text-secondary)" }}>Loading…</p>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
                    <p>No monitors match your search.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {filtered.map((monitor) => (
                        <div
                            key={monitor._id}
                            onClick={() => navigate(`/monitors/${monitor._id}`)}
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
                                            fontSize: "11px",
                                            fontWeight: 600,
                                            padding: "3px 8px",
                                            borderRadius: "20px",
                                            textTransform: "uppercase",
                                            ...statusStyles[monitor.status],
                                        }}
                                    >
                                        {monitor.status}
                                    </span>
                                </div>
                                <a href={monitor.url} target="_blank" rel="noreferrer" style={{ fontSize: "13px" }}>
                                    {monitor.url}
                                </a>
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <button
                                    onClick={() => handleTogglePause(monitor)}
                                    style={{
                                        background: "transparent",
                                        border: "1px solid var(--border)",
                                        color: "var(--text-secondary)",
                                        borderRadius: "var(--radius)",
                                        padding: "7px 12px",
                                        fontSize: "13px",
                                    }}
                                >
                                    {monitor.isActive ? "Pause" : "Resume"}
                                </button>
                                <button
                                    onClick={() => handleDelete(monitor._id, monitor.name)}
                                    style={{
                                        background: "transparent",
                                        border: "1px solid var(--border)",
                                        color: "var(--text-muted)",
                                        borderRadius: "var(--radius)",
                                        padding: "7px 12px",
                                        fontSize: "13px",
                                    }}
                                >
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

export default Monitors;