import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import AppShell from "../components/AppShell";
import { useToast } from "../components/Toast";

function Incidents() {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const showToast = useToast();
    const [refreshing, setRefreshing] = useState(false);

    const fetchIncidents = async () => {
        try {
            const response = await api.get("/monitors/incidents/all");
            setIncidents(response.data.incidents);
        } catch {
            showToast("Failed to load incidents", "error");
        } finally {
            setLoading(false);
        }
    };
    const handleManualRefresh = async () => {
        setRefreshing(true);
        await fetchIncidents();
        setRefreshing(false);
        showToast("Refreshed");
    };
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        fetchIncidents();
        const poll = setInterval(fetchIncidents, 30000);
        return () => clearInterval(poll);
    }, []);

    return (
        <AppShell title="Incidents" onRefresh={handleManualRefresh} refreshing={refreshing}>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "20px" }}>
                All downtime events across your monitors in the last 24 hours.
            </p>

            {loading ? (
                <p style={{ color: "var(--text-secondary)" }}>Loading…</p>
            ) : incidents.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
                    <p>No incidents in the last 24 hours. Everything's healthy.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {incidents.map((inc, i) => (
                        <div
                            key={i}
                            style={{
                                background: "var(--down-bg)",
                                border: "1px solid var(--down)",
                                borderRadius: "var(--radius)",
                                padding: "14px 18px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <div>
                                <Link
                                    to={`/monitors/${inc.monitorId}`}
                                    style={{ fontWeight: 500, color: "var(--text-primary)", fontSize: "14px" }}
                                >
                                    {inc.monitorName}
                                </Link>
                                {inc.ongoing && (
                                    <span
                                        style={{
                                            marginLeft: "8px",
                                            fontSize: "10px",
                                            fontWeight: 600,
                                            padding: "2px 7px",
                                            borderRadius: "20px",
                                            background: "var(--down)",
                                            color: "#fff",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        Ongoing
                                    </span>
                                )}
                                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                                    {inc.monitorUrl}
                                </div>
                                <div style={{ fontSize: "12px", color: "var(--down)", marginTop: "4px" }}>
                                    {new Date(inc.start).toLocaleString()} → {new Date(inc.end).toLocaleString()}
                                </div>
                            </div>
                            <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>
                                {inc.durationMinutes} min
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AppShell>
    );
}

export default Incidents;