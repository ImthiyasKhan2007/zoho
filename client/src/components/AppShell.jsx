import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "./Logo";

function AppShell({ children, onRefresh, refreshing }) {
    const location = useLocation();
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--background)" }}>
            <aside
                style={{
                    width: "230px",
                    background: "var(--surface)",
                    borderRight: "1px solid var(--border)",
                    display: "flex",
                    flexDirection: "column",
                    padding: "18px 14px",
                    position: "fixed",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 20,
                }}
            >
                <div style={{ padding: "8px 10px 28px", borderBottom: "1px solid var(--border)", marginBottom: "20px" }}>
                    <Logo size={28} textSize={18} />
                </div>

                <div style={{ padding: "0 10px 10px", fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Monitoring
                </div>
                <nav style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                    <NavGroup
                        label="Website Monitoring"
                        icon="◉"
                        defaultOpen={
                            isActive("/dashboard") ||
                            isActive("/monitors") ||
                            isActive("/synthetic-transactions") ||
                            isActive("/servers") ||
                            isActive("/incidents") ||
                            isActive("/reports") ||
                            isActive("/logs")
                        }
                        items={[
                            { to: "/dashboard", label: "Dashboard", icon: "▦", active: isActive("/dashboard") },
                            { to: "/monitors", label: "Monitors", icon: "◉", active: isActive("/monitors") },
                            { to: "/synthetic-transactions", label: "Synthetic Transactions", icon: "⇄", active: isActive("/synthetic-transactions") },
                            { to: "/servers", label: "Servers", icon: "🖥", active: isActive("/servers") },
                            { to: "/incidents", label: "Incidents", icon: "⚠", active: isActive("/incidents") },
                            { to: "/reports", label: "Reports", icon: "▤", active: isActive("/reports") },
                            { to: "/logs", label: "Logs", icon: "📋", active: isActive("/logs") },
                        ]}
                    />

                    <div style={{ height: "1px", background: "var(--border)", margin: "14px 10px" }} />

                    <div style={{ padding: "0 10px 8px", fontSize: "10px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        System
                    </div>

                    <NavItem to="/settings" label="Settings" active={isActive("/settings")} icon="⚙" />
                </nav>



                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px" }}>
                        <div
                            style={{
                                width: "34px",
                                height: "34px",
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, var(--accent), var(--up))",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "13px",
                                fontWeight: 700,
                                color: "#fff",
                                flexShrink: 0,
                            }}
                        >
                            {(user.name || "?")[0]?.toUpperCase()}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {user.name || "User"}
                            </div>
                            <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>
                                MonitorX User
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            title="Log out"
                            style={{
                                background: "transparent",
                                border: "1px solid var(--border)",
                                color: "var(--text-muted)",
                                borderRadius: "var(--radius-sm)",
                                width: "30px",
                                height: "30px",
                                cursor: "pointer",
                                fontSize: "14px",
                            }}
                        >
                            ⏻
                        </button>
                    </div>
                </div>
            </aside>

            <main style={{ flex: 1, marginLeft: "230px", minWidth: 0 }}>
                <header
                    style={{
                        height: "64px",
                        background: "var(--surface)",
                        borderBottom: "1px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 30px",
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                    }}
                >
                    <div>
                        <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                            Monitor Overview
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px" }}>
                            Website & API monitoring
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {onRefresh && (
                            <button
                                onClick={onRefresh}
                                disabled={refreshing}
                                title="Refresh data"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    background: "var(--bg)",
                                    border: "1px solid var(--border)",
                                    color: "var(--text-secondary)",
                                    borderRadius: "20px",
                                    padding: "6px 12px",
                                    fontSize: "12px",
                                    cursor: refreshing ? "default" : "pointer",
                                }}
                            >
                                <span
                                    style={{
                                        display: "inline-block",
                                        transition: "transform 0.5s ease",
                                        transform: refreshing ? "rotate(360deg)" : "rotate(0deg)",
                                    }}
                                >
                                    ↻
                                </span>
                                {refreshing ? "Refreshing…" : "Refresh"}
                            </button>
                        )}

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "11px",
                                color: "var(--text-secondary)",
                                padding: "6px 10px",
                                border: "1px solid var(--border)",
                                borderRadius: "20px",
                            }}
                        >
                            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--up)" }} />
                            System operational
                        </div>

                        <div
                            style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, var(--accent), var(--up))",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#fff",
                                fontSize: "12px",
                                fontWeight: 700,
                            }}
                            title={user.name || "User"}
                        >
                            {(user.name || "?")[0]?.toUpperCase()}
                        </div>
                    </div>
                </header>

                <div className="fade-in" style={{ maxWidth: "1200px", margin: "0 auto", padding: "30px" }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
function NavGroup({ label, icon, items, defaultOpen }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "11px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "var(--text-secondary)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                }}
            >
                <span style={{ width: "18px", textAlign: "center", fontSize: "15px" }}>{icon}</span>
                <span style={{ flex: 1 }}>{label}</span>
                <span
                    style={{
                        fontSize: "10px",
                        transition: "transform 0.15s ease",
                        transform: open ? "rotate(90deg)" : "rotate(0deg)",
                    }}
                >
                    ▸
                </span>
            </button>

            {open && (
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "2px", marginLeft: "14px" }}>
                    {items.map((item) => (
                        <NavItem key={item.to} to={item.to} label={item.label} icon={item.icon} active={item.active} />
                    ))}
                </div>
            )}
        </div>
    );
}

function NavItem({ to, label, icon, active, disabled }) {
    return (
        <Link
            to={disabled ? "#" : to}
            onClick={(e) => {
                if (disabled) {
                    e.preventDefault();
                }
            }}
            style={{
                display: "flex",
                alignItems: "center",
                gap: "11px",
                padding: "10px 12px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: active ? 600 : 500,
                color: active ? "var(--text-primary)" : disabled ? "var(--text-muted)" : "var(--text-secondary)",
                background: active ? "var(--surface-2)" : "transparent",
                opacity: disabled ? 0.55 : 1,
                cursor: disabled ? "default" : "pointer",
                textDecoration: "none",
                transition: "all 0.15s ease",
            }}
        >
            <span style={{ width: "18px", textAlign: "center", fontSize: "15px" }}>{icon}</span>
            <span>{label}</span>
            {disabled && (
                <span
                    style={{
                        marginLeft: "auto",
                        fontSize: "9px",
                        background: "var(--surface-2)",
                        color: "var(--text-muted)",
                        padding: "3px 6px",
                        borderRadius: "10px",
                    }}
                >
                    SOON
                </span>

            )}
        </Link>
    );

}

export default AppShell;