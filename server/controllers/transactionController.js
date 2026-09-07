
const axios = require("axios");
const Transaction = require("../models/Transaction");

// ==========================================
// CREATE TRANSACTION
// ==========================================

const createTransaction = async (req, res) => {
    try {
        const { name, steps, interval } = req.body;

        if (!name || !Array.isArray(steps) || steps.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Name and at least one step are required",
            });
        }

        // Team comes from teamMiddleware
        if (!req.team) {
            return res.status(400).json({
                success: false,
                message: "Team is required",
            });
        }

        const transaction = await Transaction.create({
            user: req.user._id,
            team: req.team._id,
            name,
            steps,
            interval: interval || 5,
        });

        res.status(201).json({
            success: true,
            transaction,
        });
    } catch (error) {
        console.error(
            "Create transaction error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==========================================
// GET ALL TRANSACTIONS
// ==========================================

const getTransactions = async (req, res) => {
    try {
        if (!req.team) {
            return res.status(400).json({
                success: false,
                message: "Team is required",
            });
        }

        const transactions = await Transaction.find({
            team: req.team._id,
        }).sort({
            createdAt: -1,
        });

        res.status(200).json({
            success: true,
            transactions,
        });
    } catch (error) {
        console.error(
            "Get transactions error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==========================================
// GET SINGLE TRANSACTION
// ==========================================

const getTransaction = async (req, res) => {
    try {
        if (!req.team) {
            return res.status(400).json({
                success: false,
                message: "Team is required",
            });
        }

        const transaction = await Transaction.findOne({
            _id: req.params.id,
            team: req.team._id,
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found",
            });
        }

        res.status(200).json({
            success: true,
            transaction,
        });
    } catch (error) {
        console.error(
            "Get transaction error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==========================================
// EXECUTE TRANSACTION
// ==========================================

const executeTransaction = async (req, res) => {
    try {
        if (!req.team) {
            return res.status(400).json({
                success: false,
                message: "Team is required",
            });
        }

        const transaction = await Transaction.findOne({
            _id: req.params.id,
            team: req.team._id,
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found",
            });
        }

        if (
            !Array.isArray(transaction.steps) ||
            transaction.steps.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "No steps configured for this transaction",
            });
        }

        const stepResults = [];
        let overallSuccess = true;
        let failedStep = null;

        const transactionStart = Date.now();

        // ==========================================
        // EXECUTE EACH STEP
        // ==========================================

        for (
            let i = 0;
            i < transaction.steps.length;
            i++
        ) {
            const step = transaction.steps[i];

            const stepStart = Date.now();

            try {
                const method = (
                    step.method || "GET"
                ).toUpperCase();

                const response = await axios({
                    method,
                    url: step.url,
                    headers: step.headers || {},
                    data: step.body || undefined,

                    // Don't throw automatically for 4xx/5xx
                    validateStatus: () => true,

                    timeout: 30000,
                });

                const timeMs =
                    Date.now() - stepStart;

                const expectedStatus =
                    Number(
                        step.expectedStatusCode || 200
                    );

                const success =
                    response.status ===
                    expectedStatus;

                stepResults.push({
                    stepIndex: i,
                    success,
                    statusCode: response.status,
                    timeMs,
                });

                if (
                    !success &&
                    overallSuccess
                ) {
                    overallSuccess = false;

                    failedStep =
                        step.name ||
                        `Step ${i + 1}`;
                }
            } catch (error) {
                const timeMs =
                    Date.now() - stepStart;

                overallSuccess = false;

                if (!failedStep) {
                    failedStep =
                        step.name ||
                        `Step ${i + 1}`;
                }

                stepResults.push({
                    stepIndex: i,
                    success: false,
                    statusCode:
                        error.response?.status ||
                        null,
                    timeMs,
                });
            }
        }

        const totalTimeMs =
            Date.now() - transactionStart;

        // ==========================================
        // SAVE RESULT
        // ==========================================

        transaction.lastChecked =
            new Date();

        transaction.lastResult = {
            success: overallSuccess,
            totalTimeMs,
            failedStep,
            steps: stepResults,
        };

        transaction.status =
            overallSuccess
                ? "up"
                : "down";

        await transaction.save();

        // ==========================================
        // RESPONSE
        // ==========================================

        res.status(200).json({
            success: true,

            message: overallSuccess
                ? "Transaction executed successfully"
                : "Transaction execution failed",

            transaction,

            result:
                transaction.lastResult,
        });
    } catch (error) {
        console.error(
            "Execute transaction error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==========================================
// DELETE TRANSACTION
// ==========================================

const deleteTransaction = async (req, res) => {
    try {
        if (!req.team) {
            return res.status(400).json({
                success: false,
                message: "Team is required",
            });
        }

        const transaction =
            await Transaction.findOne({
                _id: req.params.id,
                team: req.team._id,
            });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message:
                    "Transaction not found",
            });
        }

        await transaction.deleteOne();

        res.status(200).json({
            success: true,
            message:
                "Transaction deleted",
        });
    } catch (error) {
        console.error(
            "Delete transaction error:",
            error
        );

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
    createTransaction,
    getTransactions,
    getTransaction,
    executeTransaction,
    deleteTransaction,
};
