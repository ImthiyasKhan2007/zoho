import { useEffect, useState } from "react";
import {
    useNavigate,
    useParams,
    useLocation,
} from "react-router-dom";

import api from "../api/axios";
import AppShell from "../components/AppShell";
import { useToast } from "../components/Toast";

function SyntheticTransactionDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const showToast = useToast();

    const [transaction, setTransaction] = useState(
        location.state?.transaction || null
    );

    const [loading, setLoading] = useState(
        !location.state?.transaction
    );

    const [refreshing, setRefreshing] = useState(false);

    // ==========================================
    // LOAD TRANSACTION
    // ==========================================

    const fetchTransaction = async () => {
        if (!id) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const response = await api.get(`/synthetic-transactions/${id}`
            );

            const data =
                response.data?.syntheticTransaction ||
                response.data;

            if (!data) {
                throw new Error(
                    "Transaction not found"
                );
            }

            setTransaction(data);
        } catch (error) {
            console.error(
                "Failed to load transaction:",
                error
            );

            /*
             * If transaction was already passed
             * from the previous page, don't remove it.
             */
            if (!transaction) {
                showToast(
                    error.response?.data?.message ||
                    "Failed to load transaction",
                    "error"
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {
        const token =
            localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        /*
         * If transaction came from View button,
         * don't make another API request.
         */
        if (location.state?.transaction) {
            setTransaction(
                location.state.transaction
            );
            setLoading(false);
            return;
        }

        fetchTransaction();
    }, [id]);

    // ==========================================
    // REFRESH
    // ==========================================

    const handleRefresh = async () => {
        setRefreshing(true);

        await fetchTransaction();

        setRefreshing(false);

        showToast("Transaction refreshed");
    };

    // ==========================================
    // DELETE
    // ==========================================

    const handleDelete = async () => {
        if (!transaction?._id) {
            showToast(
                "Transaction ID not found",
                "error"
            );
            return;
        }

        const confirmed = window.confirm(
            `Delete "${transaction.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(
                `/synthetic-transactions/${transaction._id}`
            );

            showToast(
                "Transaction deleted"
            );

            navigate(
                "/synthetic-transactions"
            );
        } catch (error) {
            console.error(
                "Delete error:",
                error
            );

            showToast(
                error.response?.data?.message ||
                "Failed to delete transaction",
                "error"
            );
        }
    };

    // ==========================================
    // STATUS
    // ==========================================

    const status =
        transaction?.status || "pending";

    const statusStyles = {
        up: {
            color: "var(--up)",
            background: "var(--up-bg)",
        },

        down: {
            color: "var(--down)",
            background: "var(--down-bg)",
        },

        pending: {
            color: "var(--pending)",
            background: "var(--pending-bg)",
        },
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <AppShell
                title="Transaction Details"
                onRefresh={handleRefresh}
                refreshing={refreshing}
            >
                <div
                    style={{
                        padding: "60px",
                        textAlign: "center",
                        color:
                            "var(--text-secondary)",
                    }}
                >
                    Loading transaction...
                </div>
            </AppShell>
        );
    }

    // ==========================================
    // NOT FOUND
    // ==========================================

    if (!transaction) {
        return (
            <AppShell
                title="Transaction Details"
                onRefresh={handleRefresh}
                refreshing={refreshing}
            >
                <div
                    style={{
                        padding: "60px",
                        textAlign: "center",
                    }}
                >
                    <h2
                        style={{
                            color:
                                "var(--text-primary)",
                        }}
                    >
                        Transaction not found
                    </h2>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/synthetic-transactions"
                            )
                        }
                        style={{
                            background:
                                "var(--accent)",
                            color: "#fff",
                            border: "none",
                            borderRadius:
                                "var(--radius)",
                            padding:
                                "10px 18px",
                            cursor: "pointer",
                            fontWeight: 600,
                        }}
                    >
                        Back to Transactions
                    </button>
                </div>
            </AppShell>
        );
    }

    // ==========================================
    // MAIN PAGE
    // ==========================================

    return (
        <AppShell
            title="Transaction Details"
            onRefresh={handleRefresh}
            refreshing={refreshing}
        >
            {/* HEADER */}

            <div
                style={{
                    display: "flex",
                    justifyContent:
                        "space-between",
                    alignItems: "center",
                    gap: "15px",
                    flexWrap: "wrap",
                    marginBottom: "24px",
                }}
            >
                <div>
                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/synthetic-transactions"
                            )
                        }
                        style={{
                            background:
                                "transparent",
                            border: "none",
                            color:
                                "var(--accent)",
                            cursor: "pointer",
                            padding: 0,
                            marginBottom: "10px",
                            fontSize: "13px",
                        }}
                    >
                        ← Back to Transactions
                    </button>

                    <h2
                        style={{
                            margin: 0,
                            fontSize: "22px",
                            color:
                                "var(--text-primary)",
                        }}
                    >
                        {transaction.name ||
                            "Synthetic Transaction"}
                    </h2>

                    <p
                        style={{
                            margin:
                                "6px 0 0",
                            color:
                                "var(--text-secondary)",
                            fontSize: "13px",
                        }}
                    >
                        Synthetic transaction
                        monitoring details
                    </p>
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                    }}
                >
                    <span
                        style={{
                            ...(
                                statusStyles[
                                status
                                ] ||
                                statusStyles.pending
                            ),
                            padding:
                                "7px 14px",
                            borderRadius:
                                "20px",
                            fontSize: "11px",
                            fontWeight: 700,
                            textTransform:
                                "uppercase",
                        }}
                    >
                        {status}
                    </span>

                    <button
                        type="button"
                        onClick={handleDelete}
                        style={{
                            background:
                                "transparent",
                            border:
                                "1px solid var(--border)",
                            color:
                                "var(--down)",
                            borderRadius:
                                "var(--radius)",
                            padding:
                                "7px 14px",
                            cursor: "pointer",
                        }}
                    >
                        Delete
                    </button>
                </div>
            </div>

            {/* SUMMARY */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "12px",
                    marginBottom: "24px",
                }}
            >
                <SummaryCard
                    title="Total Steps"
                    value={
                        transaction.steps?.length ||
                        0
                    }
                />

                <SummaryCard
                    title="Check Interval"
                    value={`${transaction.interval || 5} min`}
                />

                <SummaryCard
                    title="Response Time"
                    value={
                        transaction.lastResult
                            ?.totalTimeMs !=
                            null
                            ? `${transaction.lastResult.totalTimeMs} ms`
                            : "N/A"
                    }
                />

                <SummaryCard
                    title="Last Checked"
                    value={
                        transaction.lastChecked
                            ? new Date(
                                transaction.lastChecked
                            ).toLocaleString()
                            : "Not checked"
                    }
                />
            </div>

            {/* FAILED STEP */}

            {transaction.lastResult
                ?.failedStep && (
                    <div
                        style={{
                            background:
                                "var(--down-bg)",
                            border:
                                "1px solid var(--down)",
                            borderRadius:
                                "var(--radius)",
                            padding: "14px",
                            marginBottom: "24px",
                            color:
                                "var(--down)",
                        }}
                    >
                        <strong>
                            Failed Step:
                        </strong>{" "}
                        {
                            transaction.lastResult
                                .failedStep
                        }
                    </div>
                )}

            {/* STEPS */}

            <h3
                style={{
                    color:
                        "var(--text-primary)",
                    fontSize: "16px",
                    marginBottom: "14px",
                }}
            >
                Transaction Steps
            </h3>

            {transaction.steps?.length > 0 ? (
                <div
                    style={{
                        display: "flex",
                        flexDirection:
                            "column",
                        gap: "12px",
                        marginBottom: "25px",
                    }}
                >
                    {transaction.steps.map(
                        (step, index) => {
                            const result =
                                transaction
                                    .lastResult
                                    ?.steps?.[
                                index
                                ];

                            const passed =
                                result?.success !==
                                false;

                            return (
                                <div
                                    key={
                                        step._id ||
                                        index
                                    }
                                    style={{
                                        background:
                                            "var(--surface)",
                                        border:
                                            "1px solid var(--border)",
                                        borderRadius:
                                            "var(--radius)",
                                        padding:
                                            "18px",
                                    }}
                                >
                                    {/* STEP TITLE */}

                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            justifyContent:
                                                "space-between",
                                            alignItems:
                                                "center",
                                            marginBottom:
                                                "15px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                alignItems:
                                                    "center",
                                                gap: "10px",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    width:
                                                        "30px",
                                                    height:
                                                        "30px",
                                                    borderRadius:
                                                        "50%",
                                                    background:
                                                        "var(--accent)",
                                                    color:
                                                        "#fff",
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    justifyContent:
                                                        "center",
                                                    fontWeight:
                                                        700,
                                                }}
                                            >
                                                {index +
                                                    1}
                                            </span>

                                            <strong
                                                style={{
                                                    color:
                                                        "var(--text-primary)",
                                                }}
                                            >
                                                {step.name ||
                                                    `Step ${index +
                                                    1
                                                    }`}
                                            </strong>
                                        </div>

                                        {result && (
                                            <span
                                                style={{
                                                    color:
                                                        passed
                                                            ? "var(--up)"
                                                            : "var(--down)",
                                                    fontSize:
                                                        "11px",
                                                    fontWeight:
                                                        700,
                                                }}
                                            >
                                                {passed
                                                    ? "PASSED"
                                                    : "FAILED"}
                                            </span>
                                        )}
                                    </div>

                                    {/* DETAILS */}

                                    <div
                                        style={{
                                            display:
                                                "grid",
                                            gridTemplateColumns:
                                                "110px 1fr",
                                            gap: "9px",
                                            fontSize:
                                                "13px",
                                        }}
                                    >
                                        <span
                                            style={{
                                                color:
                                                    "var(--text-muted)",
                                            }}
                                        >
                                            Method
                                        </span>

                                        <strong
                                            style={{
                                                color:
                                                    "var(--text-primary)",
                                            }}
                                        >
                                            {
                                                step.method
                                            }
                                        </strong>

                                        <span
                                            style={{
                                                color:
                                                    "var(--text-muted)",
                                            }}
                                        >
                                            URL
                                        </span>

                                        <span
                                            style={{
                                                color:
                                                    "var(--text-primary)",
                                                wordBreak:
                                                    "break-all",
                                            }}
                                        >
                                            {
                                                step.url
                                            }
                                        </span>

                                        <span
                                            style={{
                                                color:
                                                    "var(--text-muted)",
                                            }}
                                        >
                                            Expected
                                        </span>

                                        <span
                                            style={{
                                                color:
                                                    "var(--text-primary)",
                                            }}
                                        >
                                            HTTP{" "}
                                            {
                                                step.expectedStatusCode
                                            }
                                        </span>

                                        {result && (
                                            <>
                                                <span
                                                    style={{
                                                        color:
                                                            "var(--text-muted)",
                                                    }}
                                                >
                                                    Actual
                                                </span>

                                                <span
                                                    style={{
                                                        color:
                                                            "var(--text-primary)",
                                                    }}
                                                >
                                                    {result.statusCode ||
                                                        "N/A"}
                                                </span>

                                                <span
                                                    style={{
                                                        color:
                                                            "var(--text-muted)",
                                                    }}
                                                >
                                                    Time
                                                </span>

                                                <span
                                                    style={{
                                                        color:
                                                            "var(--text-primary)",
                                                    }}
                                                >
                                                    {result.timeMs !=
                                                        null
                                                        ? `${result.timeMs} ms`
                                                        : "N/A"}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        }
                    )}
                </div>
            ) : (
                <div
                    style={{
                        background:
                            "var(--surface)",
                        border:
                            "1px solid var(--border)",
                        borderRadius:
                            "var(--radius)",
                        padding: "30px",
                        textAlign: "center",
                        color:
                            "var(--text-muted)",
                    }}
                >
                    No steps configured.
                </div>
            )}

            {/* LAST RESULT */}

            <h3
                style={{
                    color:
                        "var(--text-primary)",
                    fontSize: "16px",
                    marginBottom: "14px",
                }}
            >
                Last Execution Result
            </h3>

            <div
                style={{
                    background:
                        "var(--surface)",
                    border:
                        "1px solid var(--border)",
                    borderRadius:
                        "var(--radius)",
                    padding: "18px",
                }}
            >
                {transaction.lastResult ? (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(180px, 1fr))",
                            gap: "15px",
                        }}
                    >
                        <div>
                            <span
                                style={{
                                    display:
                                        "block",
                                    fontSize:
                                        "11px",
                                    color:
                                        "var(--text-muted)",
                                    marginBottom:
                                        "6px",
                                }}
                            >
                                Result
                            </span>

                            <strong
                                style={{
                                    color:
                                        transaction
                                            .lastResult
                                            .success ===
                                            false
                                            ? "var(--down)"
                                            : "var(--up)",
                                }}
                            >
                                {transaction
                                    .lastResult
                                    .success ===
                                    false
                                    ? "FAILED"
                                    : "SUCCESS"}
                            </strong>
                        </div>

                        <div>
                            <span
                                style={{
                                    display:
                                        "block",
                                    fontSize:
                                        "11px",
                                    color:
                                        "var(--text-muted)",
                                    marginBottom:
                                        "6px",
                                }}
                            >
                                Total Time
                            </span>

                            <strong
                                style={{
                                    color:
                                        "var(--text-primary)",
                                }}
                            >
                                {transaction
                                    .lastResult
                                    .totalTimeMs !=
                                    null
                                    ? `${transaction.lastResult.totalTimeMs} ms`
                                    : "N/A"}
                            </strong>
                        </div>
                    </div>
                ) : (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "20px",
                            color:
                                "var(--text-muted)",
                        }}
                    >
                        This transaction has not
                        been executed yet.
                    </div>
                )}
            </div>
        </AppShell>
    );
}

// ==========================================
// SUMMARY CARD
// ==========================================

function SummaryCard({ title, value }) {
    return (
        <div
            style={{
                background:
                    "var(--surface)",
                border:
                    "1px solid var(--border)",
                borderRadius:
                    "var(--radius)",
                padding: "18px",
            }}
        >
            <div
                style={{
                    fontSize: "11px",
                    color:
                        "var(--text-muted)",
                    marginBottom: "8px",
                }}
            >
                {title}
            </div>

            <div
                style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color:
                        "var(--text-primary)",
                    wordBreak:
                        "break-word",
                }}
            >
                {value}
            </div>
        </div>
    );
}

export default SyntheticTransactionDetails;