import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import AppShell from "../components/AppShell";
import { useToast } from "../components/Toast";

function SyntheticTransactions() {
    const navigate = useNavigate();
    const showToast = useToast();

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [runningId, setRunningId] = useState(null);

    // ==========================================
    // FETCH TRANSACTIONS
    // ==========================================

    const fetchTransactions = async () => {
        try {
            const response = await api.get("/synthetic-transactions");
            const data =
                response.data?.transactions ||
                response.data ||
                [];

            setTransactions(
                Array.isArray(data) ? data : []
            );
        } catch (error) {
            console.error(
                "Failed to load transactions:",
                error
            );

            showToast(
                error.response?.data?.message ||
                "Failed to load transactions",
                "error"
            );

            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        fetchTransactions();
    }, []);

    // ==========================================
    // REFRESH
    // ==========================================

    const handleRefresh = async () => {
        setRefreshing(true);

        await fetchTransactions();

        setRefreshing(false);

        showToast("Transactions refreshed");
    };

    // ==========================================
    // RUN TRANSACTION
    // ==========================================

    const handleRun = async (transaction) => {
        if (!transaction?._id) {
            showToast(
                "Transaction ID not found",
                "error"
            );
            return;
        }

        if (runningId) {
            return;
        }

        try {
            setRunningId(transaction._id);

            showToast(
                `Running "${transaction.name || "transaction"}"...`
            );

            const response = await api.post(`/synthetic-transactions/${transaction._id}/execute`);


            const updatedTransaction =
                response.data?.syntheticTransaction;

            if (updatedTransaction) {
                setTransactions((previous) =>
                    previous.map((item) =>
                        item._id === updatedTransaction._id
                            ? updatedTransaction
                            : item
                    )
                );
            } else {
                await fetchTransactions();
            }

            const result =
                response.data?.result ||
                updatedTransaction?.lastResult;

            if (result?.success === false) {
                showToast(
                    `Transaction failed${result.failedStep
                        ? ` at ${result.failedStep}`
                        : ""
                    }`,
                    "error"
                );
            } else {
                showToast(
                    "Transaction executed successfully"
                );
            }
        } catch (error) {
            console.error(
                "Run transaction error:",
                error
            );

            showToast(
                error.response?.data?.message ||
                "Failed to execute transaction",
                "error"
            );

            await fetchTransactions();
        } finally {
            setRunningId(null);
        }
    };

    // ==========================================
    // VIEW TRANSACTION
    // ==========================================

    const handleView = (transaction) => {
        if (!transaction) {
            showToast(
                "Transaction not found",
                "error"
            );
            return;
        }

        if (!transaction._id) {
            showToast(
                "Transaction ID not found",
                "error"
            );
            return;
        }

        navigate(
            `/synthetic-transactions/${transaction._id}`,
            {
                state: {
                    transaction: transaction,
                },
            }
        );
    };

    // ==========================================
    // DELETE TRANSACTION
    // ==========================================

    const handleDelete = async (transaction) => {
        if (!transaction?._id) {
            showToast(
                "Transaction ID not found",
                "error"
            );
            return;
        }

        const confirmed = window.confirm(
            `Delete "${transaction.name || "this transaction"}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(`/synthetic-transactions/${transaction._id}`
            );

            setTransactions((previous) =>
                previous.filter(
                    (item) =>
                        item._id !== transaction._id
                )
            );

            showToast(
                "Transaction deleted"
            );
        } catch (error) {
            console.error(
                "Delete transaction error:",
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
    // STATUS STYLE
    // ==========================================

    const getStatusStyle = (status) => {
        const currentStatus =
            String(status || "pending").toLowerCase();

        if (currentStatus === "up") {
            return {
                color: "var(--up)",
                background: "var(--up-bg)",
            };
        }

        if (currentStatus === "down") {
            return {
                color: "var(--down)",
                background: "var(--down-bg)",
            };
        }

        return {
            color: "var(--pending)",
            background: "var(--pending-bg)",
        };
    };

    // ==========================================
    // SEARCH
    // ==========================================

    const filteredTransactions =
        transactions.filter((transaction) => {
            const searchText =
                search.toLowerCase().trim();

            if (!searchText) {
                return true;
            }

            const name =
                transaction.name || "";

            const id =
                transaction._id || "";

            const status =
                transaction.status || "";

            return (
                name
                    .toLowerCase()
                    .includes(searchText) ||
                id
                    .toLowerCase()
                    .includes(searchText) ||
                status
                    .toLowerCase()
                    .includes(searchText)
            );
        });

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <AppShell
                title="Synthetic Transactions"
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
                    Loading synthetic transactions...
                </div>
            </AppShell>
        );
    }

    // ==========================================
    // PAGE
    // ==========================================

    return (
        <AppShell
            title="Synthetic Transactions"
            onRefresh={handleRefresh}
            refreshing={refreshing}
        >
            {/* ================================= */}
            {/* HEADER */}
            {/* ================================= */}

            <div
                style={{
                    display: "flex",
                    justifyContent:
                        "space-between",
                    alignItems: "center",
                    gap: "15px",
                    flexWrap: "wrap",
                    marginBottom: "22px",
                }}
            >
                <div>
                    <h2
                        style={{
                            margin: 0,
                            color:
                                "var(--text-primary)",
                            fontSize: "22px",
                        }}
                    >
                        Synthetic Transactions
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
                        Monitor multi-step website
                        and API transactions.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        navigate(
                            "/synthetic-transactions/create"
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
                            "10px 16px",
                        cursor: "pointer",
                        fontWeight: 600,
                    }}
                >
                    + Create Transaction
                </button>
            </div>

            {/* ================================= */}
            {/* SEARCH */}
            {/* ================================= */}

            <div
                style={{
                    background:
                        "var(--surface)",
                    border:
                        "1px solid var(--border)",
                    borderRadius:
                        "var(--radius)",
                    padding: "15px",
                    marginBottom: "20px",
                }}
            >
                <input
                    type="text"
                    placeholder="Search transactions..."
                    value={search}
                    onChange={(event) =>
                        setSearch(
                            event.target.value
                        )
                    }
                    style={{
                        width: "100%",
                        boxSizing:
                            "border-box",
                        background:
                            "var(--background)",
                        color:
                            "var(--text-primary)",
                        border:
                            "1px solid var(--border)",
                        borderRadius:
                            "var(--radius)",
                        padding:
                            "11px 13px",
                        outline: "none",
                        fontSize: "13px",
                    }}
                />
            </div>

            {/* ================================= */}
            {/* SUMMARY */}
            {/* ================================= */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: "12px",
                    marginBottom: "20px",
                }}
            >
                <SummaryCard
                    title="Total"
                    value={transactions.length}
                />

                <SummaryCard
                    title="Up"
                    value={
                        transactions.filter(
                            (item) =>
                                String(
                                    item.status
                                ).toLowerCase() ===
                                "up"
                        ).length
                    }
                />

                <SummaryCard
                    title="Down"
                    value={
                        transactions.filter(
                            (item) =>
                                String(
                                    item.status
                                ).toLowerCase() ===
                                "down"
                        ).length
                    }
                />

                <SummaryCard
                    title="Pending"
                    value={
                        transactions.filter(
                            (item) =>
                                ![
                                    "up",
                                    "down",
                                ].includes(
                                    String(
                                        item.status
                                    ).toLowerCase()
                                )
                        ).length
                    }
                />
            </div>

            {/* ================================= */}
            {/* TRANSACTIONS */}
            {/* ================================= */}

            {filteredTransactions.length ===
                0 ? (
                <div
                    style={{
                        background:
                            "var(--surface)",
                        border:
                            "1px solid var(--border)",
                        borderRadius:
                            "var(--radius)",
                        padding: "50px 20px",
                        textAlign: "center",
                    }}
                >
                    <h3
                        style={{
                            margin:
                                "0 0 8px",
                            color:
                                "var(--text-primary)",
                        }}
                    >
                        {search
                            ? "No transactions found"
                            : "No synthetic transactions"}
                    </h3>

                    <p
                        style={{
                            margin: 0,
                            color:
                                "var(--text-muted)",
                            fontSize: "13px",
                        }}
                    >
                        {search
                            ? "Try a different search."
                            : "Create a synthetic transaction to start monitoring."}
                    </p>
                </div>
            ) : (
                <div
                    style={{
                        display: "flex",
                        flexDirection:
                            "column",
                        gap: "12px",
                    }}
                >
                    {filteredTransactions.map(
                        (transaction, index) => {
                            const status =
                                String(
                                    transaction.status ||
                                    "pending"
                                ).toLowerCase();

                            const steps =
                                Array.isArray(
                                    transaction.steps
                                )
                                    ? transaction.steps
                                    : [];

                            const lastResult =
                                transaction.lastResult ||
                                {};

                            const isRunning =
                                runningId ===
                                transaction._id;

                            return (
                                <div
                                    key={
                                        transaction._id ||
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
                                    {/* CARD HEADER */}

                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            justifyContent:
                                                "space-between",
                                            alignItems:
                                                "center",
                                            gap: "15px",
                                            flexWrap:
                                                "wrap",
                                        }}
                                    >
                                        <div>
                                            <h3
                                                style={{
                                                    margin:
                                                        0,
                                                    color:
                                                        "var(--text-primary)",
                                                    fontSize:
                                                        "16px",
                                                }}
                                            >
                                                {transaction.name ||
                                                    "Unnamed Transaction"}
                                            </h3>

                                            <p
                                                style={{
                                                    margin:
                                                        "5px 0 0",
                                                    color:
                                                        "var(--text-muted)",
                                                    fontSize:
                                                        "11px",
                                                }}
                                            >
                                                ID:{" "}
                                                {
                                                    transaction._id
                                                }
                                            </p>
                                        </div>

                                        <span
                                            style={{
                                                ...getStatusStyle(
                                                    status
                                                ),
                                                padding:
                                                    "6px 12px",
                                                borderRadius:
                                                    "20px",
                                                fontSize:
                                                    "10px",
                                                fontWeight:
                                                    700,
                                                textTransform:
                                                    "uppercase",
                                            }}
                                        >
                                            {status}
                                        </span>
                                    </div>

                                    {/* CARD DETAILS */}

                                    <div
                                        style={{
                                            display:
                                                "grid",
                                            gridTemplateColumns:
                                                "repeat(auto-fit, minmax(150px, 1fr))",
                                            gap: "15px",
                                            marginTop:
                                                "18px",
                                            paddingTop:
                                                "15px",
                                            borderTop:
                                                "1px solid var(--border)",
                                        }}
                                    >
                                        <InfoItem
                                            label="Steps"
                                            value={
                                                steps.length
                                            }
                                        />

                                        <InfoItem
                                            label="Interval"
                                            value={`${transaction.interval || 5} min`}
                                        />

                                        <InfoItem
                                            label="Response Time"
                                            value={
                                                lastResult.totalTimeMs !=
                                                    null
                                                    ? `${lastResult.totalTimeMs} ms`
                                                    : "N/A"
                                            }
                                        />

                                        <InfoItem
                                            label="Last Checked"
                                            value={
                                                transaction.lastChecked
                                                    ? new Date(
                                                        transaction.lastChecked
                                                    ).toLocaleString()
                                                    : "Not checked"
                                            }
                                        />
                                    </div>

                                    {/* CARD ACTIONS */}

                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            justifyContent:
                                                "flex-end",
                                            gap: "8px",
                                            marginTop:
                                                "16px",
                                            paddingTop:
                                                "14px",
                                            borderTop:
                                                "1px solid var(--border)",
                                        }}
                                    >
                                        {/* RUN NOW */}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRun(
                                                    transaction
                                                )
                                            }
                                            disabled={
                                                runningId !==
                                                null
                                            }
                                            style={{
                                                background:
                                                    isRunning
                                                        ? "var(--text-muted)"
                                                        : "var(--up)",
                                                color:
                                                    "#fff",
                                                border:
                                                    "none",
                                                borderRadius:
                                                    "var(--radius)",
                                                padding:
                                                    "8px 14px",
                                                cursor:
                                                    runningId !==
                                                        null
                                                        ? "not-allowed"
                                                        : "pointer",
                                                fontSize:
                                                    "12px",
                                                fontWeight:
                                                    600,
                                                opacity:
                                                    runningId !==
                                                        null &&
                                                        !isRunning
                                                        ? 0.6
                                                        : 1,
                                            }}
                                        >
                                            {isRunning
                                                ? "Running..."
                                                : "▶ Run Now"}
                                        </button>

                                        {/* VIEW */}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleView(
                                                    transaction
                                                )
                                            }
                                            style={{
                                                background:
                                                    "var(--accent)",
                                                color:
                                                    "#fff",
                                                border:
                                                    "none",
                                                borderRadius:
                                                    "var(--radius)",
                                                padding:
                                                    "8px 14px",
                                                cursor:
                                                    "pointer",
                                                fontSize:
                                                    "12px",
                                                fontWeight:
                                                    600,
                                            }}
                                        >
                                            View
                                        </button>

                                        {/* DELETE */}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(
                                                    transaction
                                                )
                                            }
                                            disabled={
                                                runningId !==
                                                null
                                            }
                                            style={{
                                                background:
                                                    "transparent",
                                                color:
                                                    "var(--down)",
                                                border:
                                                    "1px solid var(--border)",
                                                borderRadius:
                                                    "var(--radius)",
                                                padding:
                                                    "8px 14px",
                                                cursor:
                                                    runningId !==
                                                        null
                                                        ? "not-allowed"
                                                        : "pointer",
                                                fontSize:
                                                    "12px",
                                                opacity:
                                                    runningId !==
                                                        null
                                                        ? 0.6
                                                        : 1,
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        }
                    )}
                </div>
            )}
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
                padding: "16px",
            }}
        >
            <div
                style={{
                    color:
                        "var(--text-muted)",
                    fontSize: "11px",
                    marginBottom: "7px",
                }}
            >
                {title}
            </div>

            <div
                style={{
                    color:
                        "var(--text-primary)",
                    fontSize: "22px",
                    fontWeight: 700,
                }}
            >
                {value}
            </div>
        </div>
    );
}

// ==========================================
// INFO ITEM
// ==========================================

function InfoItem({ label, value }) {
    return (
        <div>
            <div
                style={{
                    color:
                        "var(--text-muted)",
                    fontSize: "10px",
                    marginBottom: "5px",
                }}
            >
                {label}
            </div>

            <div
                style={{
                    color:
                        "var(--text-primary)",
                    fontSize: "13px",
                    fontWeight: 600,
                    wordBreak:
                        "break-word",
                }}
            >
                {value}
            </div>
        </div>
    );
}

export default SyntheticTransactions;