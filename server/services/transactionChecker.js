
const axios = require("axios");
const Transaction = require("../models/Transaction");

const checkAllTransactions = async () => {
    try {
        const transactions = await Transaction.find({
            isActive: true,
        });

        for (const transaction of transactions) {
            await checkSingleTransaction(transaction);
        }
    } catch (error) {
        console.error(
            "Error checking transactions:",
            error.message
        );
    }
};

const checkSingleTransaction = async (transaction) => {
    try {
        const startTime = Date.now();

        let status = "up";
        let failedStep = null;

        for (const step of transaction.steps) {
            try {
                const response = await axios({
                    method: step.method || "GET",
                    url: step.url,
                    timeout: 10000,
                    data: step.body || undefined,
                });

                const expected =
                    step.expectedStatusCode;

                const isOk = expected
                    ? response.status === expected
                    : response.status >= 200 &&
                    response.status < 400;

                if (!isOk) {
                    status = "down";
                    failedStep = step.name;
                    break;
                }
            } catch (error) {
                status = "down";
                failedStep = step.name;
                break;
            }
        }

        const totalTimeMs =
            Date.now() - startTime;

        /*
         * IMPORTANT:
         * Preserve the transaction's team.
         * The Transaction schema now requires it.
         */
        if (!transaction.team) {
            console.error(
                `Transaction "${transaction.name}" has no team. Skipping save.`
            );
            return;
        }

        transaction.status = status;

        transaction.lastChecked = new Date();

        transaction.lastResult = {
            success: status === "up",
            totalTimeMs,
            failedStep,
        };

        await transaction.save();

        console.log(
            `🔍 Transaction "${transaction.name}" → ${status.toUpperCase()}${failedStep
                ? ` (failed at "${failedStep}")`
                : ""
            } (${totalTimeMs}ms)`
        );
    } catch (error) {
        console.error(
            `Error checking transaction "${transaction.name}":`,
            error.message
        );
    }
};

module.exports = {
    checkAllTransactions,
};
