import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import AppShell from "../components/AppShell";
import { useToast } from "../components/Toast";

function Servers() {
    const [servers, setServers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [newApiKey, setNewApiKey] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const showToast = useToast();
    const [refreshing, setRefreshing] = useState(false);

    const fetchServers = async () => {
        try {
            const response = await api.get("/servers");
            setServers(response.data.servers);
        } catch {
            showToast("Failed to load servers", "error");
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
        fetchServers();
        const poll = setInterval(fetchServers, 15000);
        return () => clearInterval(poll);
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const response = await api.post("/servers", { name });
            setNewApiKey(response.data.server.apiKey);
            setName("");
            fetchServers();
            showToast(`"${response.data.server.name}" added`);
        } catch {
            showToast("Failed to add server", "error");
        } finally {
            setSubmitting(false);
        }
    };
    const handleManualRefresh = async () => {
        setRefreshing(true);
        await fetchServers();
        setRefreshing(false);
        showToast("Refreshed");
    };

    const handleDelete = async (id, serverName) => {
        if (!window.confirm(`Delete "${serverName}"?`)) return;
        try {
            await api.delete(`/servers/${id}`);
            fetchServers();
            showToast("Server deleted");
        } catch {
            showToast("Failed to delete server", "error");
        }
    };

    const pct = (used, total) => (total ? Math.round((used / total) * 100) : 0);

    const gaugeColor = (percent) => {
        if (percent >= 85) return "var(--down)";
        if (percent >= 65) return "var(--pending)";
        return "var(--up)";
    };

    return (
        <AppShell title="Servers" onRefresh={handleManualRefresh} refreshing={refreshing}>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "20px" }}>
                Monitor CPU, RAM, and disk usage on your servers using the Monitor X agent.
            </p>

            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px", marginBottom: "28px" }}>
                <h3 style={{ fontSize: "15px", marginBottom: "16px" }}>Add a server</h3>
                <form onSubmit={handleAdd} style={{ display: "flex", gap: "10px" }}>
                    <input
                        type="text"
                        placeholder="Server name (e.g. Production API)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={{
                            flex: 1,
                            background: "var(--bg)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius)",
                            padding: "9px 12px",
                            color: "var(--text-primary)",
                            outline: "none",
                        }}
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
            {newApiKey && (
                <div style={{ marginTop: "16px", background: "var(--bg)", border: "1px solid var(--accent)", borderRadius: "var(--radius)", padding: "14px" }}>
                    <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "10px" }}>
                        Run this on the machine you want to monitor. It sets the API key as an environment variable, so you don't need to edit any code:
                    </div>
                    <code style={{ display: "block", background: "var(--surface)", padding: "10px", borderRadius: "6px", fontSize: "12px", wordBreak: "break-all", color: "var(--accent)", marginBottom: "8px" }}>
                        set MONITORX_API_KEY={newApiKey} && node agent.js
                    </code>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        (Windows CMD — for PowerShell use: <code>$env:MONITORX_API_KEY="{newApiKey}"; node agent.js</code>)
                    </div>
                </div>
            )}



            {loading ? (
                <p style={{ color: "var(--text-secondary)" }}>Loading…</p>
            ) : servers.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
                    <p>No servers yet. Add one above, then run the agent script on that machine.</p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
                    {servers.map((server) => {
                        const cpuPct = server.latestStats?.cpuUsage ?? 0;
                        const ramPct = pct(server.latestStats?.ramUsage, server.latestStats?.ramTotal);
                        const diskPct = pct(server.latestStats?.diskUsage, server.latestStats?.diskTotal);

                        return (
                            <div
                                key={server._id}
                                style={{
                                    background: "var(--surface)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "var(--radius)",
                                    padding: "18px",
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                                    <div style={{ fontWeight: 500, fontSize: "14px" }}>{server.name}</div>
                                    <span
                                        style={{
                                            fontSize: "10px",
                                            fontWeight: 600,
                                            padding: "3px 8px",
                                            borderRadius: "20px",
                                            textTransform: "uppercase",
                                            color: server.status === "online" ? "var(--up)" : "var(--down)",
                                            background: server.status === "online" ? "var(--up-bg)" : "var(--down-bg)",
                                        }}
                                    >
                                        {server.status}
                                    </span>
                                </div>

                                <Gauge label="CPU" percent={cpuPct} color={gaugeColor(cpuPct)} />
                                <Gauge
                                    label="RAM"
                                    percent={ramPct}
                                    color={gaugeColor(ramPct)}
                                    subtext={`${server.latestStats?.ramUsage ?? 0} / ${server.latestStats?.ramTotal ?? 0} MB`}
                                />
                                <Gauge
                                    label="Disk"
                                    percent={diskPct}
                                    color={gaugeColor(diskPct)}
                                    subtext={`${server.latestStats?.diskUsage ?? 0} / ${server.latestStats?.diskTotal ?? 0} GB`}
                                />

                                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "10px" }}>
                                    {server.lastSeen ? `Last seen ${new Date(server.lastSeen).toLocaleTimeString()}` : "Never reported"}
                                </div>

                                <button
                                    onClick={() => handleDelete(server._id, server.name)}
                                    style={{
                                        marginTop: "12px",
                                        width: "100%",
                                        background: "transparent",
                                        border: "1px solid var(--border)",
                                        color: "var(--text-muted)",
                                        borderRadius: "var(--radius)",
                                        padding: "7px 12px",
                                        fontSize: "12px",
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </AppShell>
    );
}

function Gauge({ label, percent, color, subtext }) {
    return (
        <div style={{ marginBottom: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                <span style={{ color: "var(--text-secondary)" }}>{label}</span>
                <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{percent}%</span>
            </div>
            <div style={{ height: "6px", background: "var(--bg)", borderRadius: "10px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${percent}%`, background: color, transition: "width 0.4s ease" }} />
            </div>
            {subtext && (
                <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "3px" }}>{subtext}</div>
            )}
        </div>
    );
}

export default Servers;