import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Logo from "../components/Logo";

function PublicStatus() {
    const { userId } = useParams();
    const [monitors, setMonitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        axios
            .get(`http://localhost:5000/api/monitors/public/${userId}`)
            .then((res) => setMonitors(res.data.monitors))
            .catch(() => setError(true))
            .finally(() => setLoading(false));

        const poll = setInterval(() => {
            axios
                .get(`http://localhost:5000/api/monitors/public/${userId}`)
                .then((res) => setMonitors(res.data.monitors))
                .catch(() => { });
        }, 30000);
        return () => clearInterval(poll);
    }, [userId]);

    const statusStyles = {
        up: { color: "var(--up)", background: "var(--up-bg)" },
        down: { color: "var(--down)", background: "var(--down-bg)" },
        pending: { color: "var(--pending)", background: "var(--pending-bg)" },
    };

    const allUp = monitors.length > 0 && monitors.every((m) => m.status === "up");

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "60px 20px" }}>
            <div style={{ maxWidth: "600px", margin: "0 auto" }}>
                <div style={{ marginBottom: "32px" }}>
                    <Logo size={28} textSize={18} />
                </div>

                {loading ? (
                    <p style={{ color: "var(--text-secondary)" }}>Loading…</p>
                ) : error ? (
                    <p style={{ color: "var(--down)" }}>Could not load status page.</p>
                ) : monitors.length === 0 ? (
                    <p style={{ color: "var(--text-muted)" }}>No public monitors to show.</p>
                ) : (
                    <>
                        <div
                            style={{
                                background: allUp ? "var(--up-bg)" : "var(--down-bg)",
                                border: `1px solid ${allUp ? "var(--up)" : "var(--down)"}`,
                                borderRadius: "var(--radius)",
                                padding: "16px 20px",
                                marginBottom: "24px",
                                color: allUp ? "var(--up)" : "var(--down)",
                                fontWeight: 500,
                            }}
                        >
                            {allUp ? "✓ All systems operational" : "⚠ Some systems are experiencing issues"}
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {monitors.map((m) => (
                                <div
                                    key={m._id}
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
                                    <span style={{ fontWeight: 500 }}>{m.name}</span>
                                    <span
                                        style={{
                                            fontSize: "11px",
                                            fontWeight: 600,
                                            padding: "3px 10px",
                                            borderRadius: "20px",
                                            textTransform: "uppercase",
                                            ...statusStyles[m.status],
                                        }}
                                    >
                                        {m.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                <p style={{ marginTop: "40px", fontSize: "12px", color: "var(--text-muted)", textAlign: "center" }}>
                    Powered by Monitor X
                </p>
            </div>
        </div>
    );
}

export default PublicStatus;