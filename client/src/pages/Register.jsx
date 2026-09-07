import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import Logo from "../components/Logo";
import AnimatedBackground from "../components/AnimatedBackground";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await api.post("/auth/register", {
                name,
                email,
                password
            });

            navigate("/login");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={pageWrap}>
            <AnimatedBackground />

            <div style={registerContainer}>

                {/* ================= LEFT SIDE ================= */}
                <div style={welcomePanel}>
                    <div>
                        <Logo size={30} textSize={19} />

                        <div style={welcomeContent}>
                            <div style={eyebrow}>
                                START MONITORING
                            </div>

                            <h1 style={welcomeTitle}>
                                Build a healthier
                                <br />
                                <span>online presence.</span>
                            </h1>

                            <p style={welcomeText}>
                                Create your MonitorX account and keep track
                                of your websites, APIs and services from one
                                powerful dashboard.
                            </p>

                            <div style={featureList}>
                                <Feature
                                    icon="●"
                                    title="Monitor your services"
                                    text="Track website availability and uptime."
                                />

                                <Feature
                                    icon="◷"
                                    title="Understand performance"
                                    text="See response times and check history."
                                />

                                <Feature
                                    icon="⚠"
                                    title="Stay informed"
                                    text="Get alerts when services need attention."
                                />
                            </div>
                        </div>
                    </div>

                    <div style={copyright}>
                        © 2026 MonitorX
                    </div>
                </div>


                {/* ================= REGISTER CARD ================= */}
                <div style={registerPanel}>

                    <div style={headingArea}>
                        <h2 style={heading}>
                            Create your account
                        </h2>

                        <p style={subheading}>
                            Start monitoring your sites in minutes
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>

                        {/* Name */}
                        <div style={field}>
                            <label style={label}>
                                Full name
                            </label>

                            <input
                                type="text"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                                placeholder="Enter your name"
                                autoComplete="name"
                                required
                                style={input}
                            />
                        </div>

                        {/* Email */}
                        <div style={field}>
                            <label style={label}>
                                Email address
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                placeholder="you@example.com"
                                autoComplete="email"
                                required
                                style={input}
                            />
                        </div>

                        {/* Password */}
                        <div style={field}>
                            <label style={label}>
                                Password
                            </label>

                            <input
                                type="password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                placeholder="Create a password"
                                autoComplete="new-password"
                                required
                                style={input}
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div style={errorBox}>
                                <span style={errorIcon}>!</span>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                ...submitBtn,
                                opacity: loading ? 0.7 : 1,
                                cursor: loading
                                    ? "not-allowed"
                                    : "pointer"
                            }}
                        >
                            {loading ? (
                                <>
                                    <span style={spinner}>⟳</span>
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create account
                                    <span style={arrow}>→</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div style={divider}>
                        <span />
                        <small>OR</small>
                        <span />
                    </div>

                    <p style={loginText}>
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            style={loginLink}
                        >
                            Sign in
                        </Link>
                    </p>

                    <p style={securityText}>
                        🔒 Your information is securely handled
                    </p>
                </div>
            </div>
        </div>
    );
}


/* ================= FEATURE ================= */

function Feature({ icon, title, text }) {
    return (
        <div style={feature}>
            <div style={featureIcon}>
                {icon}
            </div>

            <div>
                <div style={featureTitle}>
                    {title}
                </div>

                <div style={featureText}>
                    {text}
                </div>
            </div>
        </div>
    );
}


/* ================= STYLES ================= */

const pageWrap = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px",
    position: "relative",
    overflow: "hidden"
};

const registerContainer = {
    width: "100%",
    maxWidth: "980px",
    minHeight: "600px",
    display: "grid",
    gridTemplateColumns: "1fr 430px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "18px",
    overflow: "hidden",
    position: "relative",
    zIndex: 1,
    boxShadow: "0 25px 70px rgba(0,0,0,0.15)"
};

const welcomePanel = {
    padding: "42px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    background:
        "linear-gradient(145deg, var(--surface), var(--surface-2))",
    borderRight: "1px solid var(--border)"
};

const welcomeContent = {
    maxWidth: "430px",
    marginTop: "95px"
};

const eyebrow = {
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.14em",
    color: "var(--accent)",
    marginBottom: "14px"
};

const welcomeTitle = {
    fontSize: "38px",
    lineHeight: 1.12,
    letterSpacing: "-0.025em",
    margin: 0,
    fontWeight: 700
};

const welcomeText = {
    color: "var(--text-secondary)",
    fontSize: "14px",
    lineHeight: 1.7,
    marginTop: "18px",
    maxWidth: "390px"
};

const featureList = {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    marginTop: "38px"
};

const feature = {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px"
};

const featureIcon = {
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    color: "var(--accent)",
    fontSize: "11px",
    flexShrink: 0
};

const featureTitle = {
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--text-primary)"
};

const featureText = {
    fontSize: "11px",
    color: "var(--text-muted)",
    marginTop: "3px"
};

const copyright = {
    fontSize: "10px",
    color: "var(--text-muted)"
};

const registerPanel = {
    padding: "48px 42px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    background: "var(--surface)"
};

const headingArea = {
    marginBottom: "25px"
};

const heading = {
    fontSize: "25px",
    margin: 0,
    fontWeight: 650,
    letterSpacing: "-0.02em"
};

const subheading = {
    fontSize: "13px",
    color: "var(--text-secondary)",
    marginTop: "7px"
};

const field = {
    marginBottom: "15px"
};

const label = {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    color: "var(--text-secondary)",
    marginBottom: "7px"
};

const input = {
    width: "100%",
    boxSizing: "border-box",
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "12px 13px",
    color: "var(--text-primary)",
    outline: "none",
    fontSize: "13px"
};

const errorBox = {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    background: "var(--down-bg)",
    color: "var(--down)",
    border: "1px solid var(--down)",
    padding: "10px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    marginTop: "3px",
    marginBottom: "16px"
};

const errorIcon = {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--down)",
    color: "#fff",
    fontSize: "11px",
    fontWeight: 700,
    flexShrink: 0
};

const submitBtn = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "13px",
    fontWeight: 600,
    marginTop: "5px"
};

const arrow = {
    fontSize: "16px",
    lineHeight: 1
};

const spinner = {
    fontSize: "15px"
};

const divider = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: "25px 0 20px",
    color: "var(--text-muted)"
};

const loginText = {
    textAlign: "center",
    fontSize: "12px",
    color: "var(--text-secondary)",
    margin: 0
};

const loginLink = {
    color: "var(--accent)",
    fontWeight: 600,
    textDecoration: "none"
};

const securityText = {
    textAlign: "center",
    fontSize: "10px",
    color: "var(--text-muted)",
    marginTop: "24px"
};

export default Register;