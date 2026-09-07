import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import AppShell from "../components/AppShell";
import { useToast } from "../components/Toast";
import { getTheme, setTheme } from "../utils/theme";

function Settings() {
    const navigate = useNavigate();
    const showToast = useToast();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const [name, setName] = useState(user.name || "");
    const [email, setEmail] = useState(user.email || "");
    const [profileSubmitting, setProfileSubmitting] = useState(false);

    const [emailNotifications, setEmailNotifications] = useState(true);
    const [notifSubmitting, setNotifSubmitting] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");
    const [theme, setThemeState] = useState(getTheme());

    useEffect(() => {
        api.get("/auth/me").then((res) => {
            setEmailNotifications(res.data.user.emailNotifications ?? true);
        });
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setProfileSubmitting(true);
        try {
            const response = await api.put("/auth/profile", { name, email });
            localStorage.setItem("user", JSON.stringify(response.data.user));
            showToast("Profile updated successfully");
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to update profile", "error");
        } finally {
            setProfileSubmitting(false);
        }
    };

    const handleToggleNotifications = async () => {
        setNotifSubmitting(true);
        try {
            const newValue = !emailNotifications;
            await api.put("/auth/notifications", { emailNotifications: newValue });
            setEmailNotifications(newValue);
            showToast(newValue ? "Email notifications enabled" : "Email notifications disabled");
        } catch {
            showToast("Failed to update notification preference", "error");
        } finally {
            setNotifSubmitting(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }
        if (newPassword.length < 6) {
            setError("New password must be at least 6 characters.");
            return;
        }

        setSubmitting(true);
        try {
            await api.put("/auth/change-password", { currentPassword, newPassword });
            showToast("Password updated successfully");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to update password.";
            setError(msg);
            showToast(msg, "error");
        } finally {
            setSubmitting(false);
        }
    };
    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== "DELETE") {
            showToast('Please type "DELETE" to confirm', "error");
            return;
        }
        setDeleting(true);
        try {
            await api.delete("/auth/account");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            showToast("Account deleted");
            navigate("/register");
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to delete account", "error");
        } finally {
            setDeleting(false);
        }
    };
    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        setThemeState(newTheme);
    };

    return (
        <AppShell title="Settings">
            <h2 style={{ fontSize: "16px", marginBottom: "20px" }}>Profile</h2>
            <form
                onSubmit={handleUpdateProfile}
                style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    padding: "20px",
                    marginBottom: "32px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    maxWidth: "420px",
                }}
            >
                <div>
                    <label style={labelStyle}>Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} required />
                </div>
                <div>
                    <label style={labelStyle}>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
                </div>
                <button
                    type="submit"
                    disabled={profileSubmitting}
                    style={{
                        background: "var(--accent)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "var(--radius)",
                        padding: "10px",
                        fontWeight: 500,
                        marginTop: "6px",
                    }}
                >
                    {profileSubmitting ? "Saving…" : "Save changes"}
                </button>
            </form>

            <h2 style={{ fontSize: "16px", marginBottom: "20px" }}>Notifications</h2>
            <div
                style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    padding: "20px",
                    marginBottom: "32px",
                    maxWidth: "420px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <div>
                    <div style={{ fontSize: "14px", fontWeight: 500 }}>Email alerts</div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                        Get emailed when a monitor goes down or recovers
                    </div>
                </div>
                <button
                    onClick={handleToggleNotifications}
                    disabled={notifSubmitting}
                    style={{
                        width: "44px",
                        height: "24px",
                        borderRadius: "20px",
                        border: "none",
                        background: emailNotifications ? "var(--accent)" : "var(--border)",
                        position: "relative",
                        cursor: "pointer",
                        flexShrink: 0,
                    }}
                >
                    <div
                        style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            background: "#fff",
                            position: "absolute",
                            top: "3px",
                            left: emailNotifications ? "23px" : "3px",
                            transition: "left 0.2s ease",
                        }}
                    />
                </button>
            </div>
            <h2 style={{ fontSize: "16px", marginBottom: "20px" }}>Appearance</h2>
            <div
                style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    padding: "20px",
                    marginBottom: "32px",
                    maxWidth: "420px",
                }}
            >
                <div style={{ fontSize: "14px", fontWeight: 500, marginBottom: "12px" }}>Theme</div>
                <div style={{ display: "flex", gap: "8px" }}>
                    <button
                        onClick={() => handleThemeChange("dark")}
                        style={{
                            flex: 1,
                            padding: "10px",
                            borderRadius: "var(--radius)",
                            border: theme === "dark" ? "2px solid var(--accent)" : "1px solid var(--border)",
                            background: "var(--bg)",
                            color: "var(--text-primary)",
                            cursor: "pointer",
                            fontSize: "13px",
                        }}
                    >
                        🌙 Dark
                    </button>
                    <button
                        onClick={() => handleThemeChange("light")}
                        style={{
                            flex: 1,
                            padding: "10px",
                            borderRadius: "var(--radius)",
                            border: theme === "light" ? "2px solid var(--accent)" : "1px solid var(--border)",
                            background: "var(--bg)",
                            color: "var(--text-primary)",
                            cursor: "pointer",
                            fontSize: "13px",
                        }}
                    >
                        ☀️ Light
                    </button>
                </div>
            </div>

            <h2 style={{ fontSize: "16px", marginBottom: "20px" }}>Change password</h2>
            <form
                onSubmit={handleChangePassword}
                style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    padding: "20px",
                    maxWidth: "420px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                }}
            >
                <div>
                    <label style={labelStyle}>Current password</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={labelStyle}>New password</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        style={inputStyle}
                    />
                </div>
                <div>
                    <label style={labelStyle}>Confirm new password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        style={inputStyle}
                    />
                </div>

                {error && (
                    <div style={{ background: "var(--down-bg)", color: "var(--down)", padding: "10px 12px", borderRadius: "var(--radius)", fontSize: "13px" }}>
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    style={{
                        background: "var(--accent)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "var(--radius)",
                        padding: "10px",
                        fontWeight: 500,
                        marginTop: "6px",
                    }}
                >
                    {submitting ? "Updating…" : "Update password"}
                </button>
            </form>
            <h2 style={{ fontSize: "16px", marginTop: "32px", marginBottom: "20px", color: "var(--down)" }}>Danger zone</h2>
            <div
                style={{
                    background: "var(--down-bg)",
                    border: "1px solid var(--down)",
                    borderRadius: "var(--radius)",
                    padding: "20px",
                    maxWidth: "420px",
                }}
            >
                <div style={{ fontSize: "14px", fontWeight: 500, marginBottom: "4px" }}>Delete account</div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "14px" }}>
                    This permanently deletes your account, all monitors, servers, and history. This cannot be undone.
                </div>

                {!showDeleteConfirm ? (
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        style={{
                            background: "transparent",
                            border: "1px solid var(--down)",
                            color: "var(--down)",
                            borderRadius: "var(--radius)",
                            padding: "9px 16px",
                            fontSize: "13px",
                            cursor: "pointer",
                        }}
                    >
                        Delete my account
                    </button>
                ) : (
                    <div>
                        <label style={{ ...labelStyle, color: "var(--down)" }}>
                            Type "DELETE" to confirm
                        </label>
                        <input
                            type="text"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            style={{ ...inputStyle, marginBottom: "10px" }}
                            placeholder="DELETE"
                        />
                        <div style={{ display: "flex", gap: "8px" }}>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleting}
                                style={{
                                    background: "var(--down)",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "var(--radius)",
                                    padding: "9px 16px",
                                    fontSize: "13px",
                                    cursor: "pointer",
                                }}
                            >
                                {deleting ? "Deleting…" : "Confirm delete"}
                            </button>
                            <button
                                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); }}
                                style={{
                                    background: "transparent",
                                    border: "1px solid var(--border)",
                                    color: "var(--text-secondary)",
                                    borderRadius: "var(--radius)",
                                    padding: "9px 16px",
                                    fontSize: "13px",
                                    cursor: "pointer",
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AppShell>

    );
}


const labelStyle = {
    display: "block",
    fontSize: "12px",
    color: "var(--text-secondary)",
    marginBottom: "5px",
};

const inputStyle = {
    width: "100%",
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "9px 12px",
    color: "var(--text-primary)",
    outline: "none",
};


export default Settings;