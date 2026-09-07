import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import AppShell from "../components/AppShell";
import { useToast } from "../components/Toast";

function CreateSyntheticTransaction() {
    const navigate = useNavigate();
    const showToast = useToast();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [interval, setInterval] = useState(60);
    const [steps, setSteps] = useState([
        { name: "", method: "GET", url: "", expectedStatusCode: 200 },
    ]);
    const [saving, setSaving] = useState(false);

    const handleStepChange = (index, field, value) => {
        setSteps((previous) =>
            previous.map((step, i) =>
                i === index ? { ...step, [field]: value } : step
            )
        );
    };

    const addStep = () => {
        setSteps((previous) => [
            ...previous,
            { name: "", method: "GET", url: "", expectedStatusCode: 200 },
        ]);
    };

    const removeStep = (index) => {
        setSteps((previous) => previous.filter((_, i) => i !== index));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!name.trim()) {
            showToast("Transaction name is required", "error");
            return;
        }

        if (steps.length === 0 || steps.some((step) => !step.url.trim())) {
            showToast("Every step needs a URL", "error");
            return;
        }

        try {
            setSaving(true);

            await api.post("/synthetic-transactions", {
                name,
                description,
                interval: Number(interval) || 60,
                steps,
            });

            showToast("Synthetic transaction created");
            navigate("/synthetic-transactions");
        } catch (error) {
            console.error("Create transaction error:", error);
            showToast(
                error.response?.data?.message || "Failed to create transaction",
                "error"
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppShell title="Create Synthetic Transaction">
            <form
                onSubmit={handleSubmit}
                style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    padding: "20px",
                    maxWidth: "700px",
                }}
            >
                <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "13px" }}>
                        Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "10px",
                            borderRadius: "var(--radius)",
                            border: "1px solid var(--border)",
                            background: "var(--background)",
                            color: "var(--text-primary)",
                        }}
                    />
                </div>

                <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "13px" }}>
                        Description
                    </label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{
                            width: "100%",
                            boxSizing: "border-box",
                            padding: "10px",
                            borderRadius: "var(--radius)",
                            border: "1px solid var(--border)",
                            background: "var(--background)",
                            color: "var(--text-primary)",
                        }}
                    />
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", marginBottom: "6px", fontSize: "13px" }}>
                        Check interval (minutes)
                    </label>
                    <input
                        type="number"
                        value={interval}
                        onChange={(e) => setInterval(e.target.value)}
                        style={{
                            width: "150px",
                            boxSizing: "border-box",
                            padding: "10px",
                            borderRadius: "var(--radius)",
                            border: "1px solid var(--border)",
                            background: "var(--background)",
                            color: "var(--text-primary)",
                        }}
                    />
                </div>

                <h3 style={{ fontSize: "15px", marginBottom: "10px" }}>Steps</h3>

                {steps.map((step, index) => (
                    <div
                        key={index}
                        style={{
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius)",
                            padding: "14px",
                            marginBottom: "12px",
                        }}
                    >
                        <div style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
                            <input
                                type="text"
                                placeholder="Step name"
                                value={step.name}
                                onChange={(e) => handleStepChange(index, "name", e.target.value)}
                                style={{
                                    flex: "1",
                                    minWidth: "150px",
                                    padding: "8px",
                                    borderRadius: "var(--radius)",
                                    border: "1px solid var(--border)",
                                    background: "var(--background)",
                                    color: "var(--text-primary)",
                                }}
                            />

                            <select
                                value={step.method}
                                onChange={(e) => handleStepChange(index, "method", e.target.value)}
                                style={{
                                    padding: "8px",
                                    borderRadius: "var(--radius)",
                                    border: "1px solid var(--border)",
                                    background: "var(--background)",
                                    color: "var(--text-primary)",
                                }}
                            >
                                <option value="GET">GET</option>
                                <option value="POST">POST</option>
                                <option value="PUT">PUT</option>
                                <option value="DELETE">DELETE</option>
                            </select>

                            <input
                                type="number"
                                placeholder="Expected status"
                                value={step.expectedStatusCode}
                                onChange={(e) =>
                                    handleStepChange(index, "expectedStatusCode", Number(e.target.value))
                                }
                                style={{
                                    width: "130px",
                                    padding: "8px",
                                    borderRadius: "var(--radius)",
                                    border: "1px solid var(--border)",
                                    background: "var(--background)",
                                    color: "var(--text-primary)",
                                }}
                            />
                        </div>

                        <input
                            type="text"
                            placeholder="URL (https://...)"
                            value={step.url}
                            onChange={(e) => handleStepChange(index, "url", e.target.value)}
                            style={{
                                width: "100%",
                                boxSizing: "border-box",
                                padding: "8px",
                                borderRadius: "var(--radius)",
                                border: "1px solid var(--border)",
                                background: "var(--background)",
                                color: "var(--text-primary)",
                                marginBottom: "10px",
                            }}
                        />

                        {steps.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeStep(index)}
                                style={{
                                    background: "transparent",
                                    color: "var(--down)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "var(--radius)",
                                    padding: "6px 12px",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                }}
                            >
                                Remove step
                            </button>
                        )}
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addStep}
                    style={{
                        background: "transparent",
                        color: "var(--accent)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                        padding: "8px 14px",
                        cursor: "pointer",
                        fontSize: "13px",
                        marginBottom: "20px",
                    }}
                >
                    + Add step
                </button>

                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                        type="submit"
                        disabled={saving}
                        style={{
                            background: "var(--accent)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "var(--radius)",
                            padding: "10px 18px",
                            cursor: saving ? "not-allowed" : "pointer",
                            fontWeight: 600,
                        }}
                    >
                        {saving ? "Creating..." : "Create Transaction"}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/synthetic-transactions")}
                        style={{
                            background: "transparent",
                            color: "var(--text-secondary)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius)",
                            padding: "10px 18px",
                            cursor: "pointer",
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </AppShell>
    );
}

export default CreateSyntheticTransaction;