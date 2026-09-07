const express = require("express");
const router = express.Router();

const SyntheticTransaction = require("../models/SyntheticTransaction");

// If your project already has auth middleware,
// change this path/name to match your existing middleware.
const { protect } = require("../middleware/authMiddleware");


// =====================================================
// GET ALL SYNTHETIC TRANSACTIONS
// =====================================================

router.get("/", protect, async (req, res) => {
    try {
        const transactions = await SyntheticTransaction.find({
            user: req.user.id,
        }).sort({ createdAt: -1 });

        res.json(transactions);
    } catch (error) {
        console.error("Get transactions error:", error);

        res.status(500).json({
            message: "Failed to fetch synthetic transactions",
        });
    }
});


// =====================================================
// GET ONE SYNTHETIC TRANSACTION
// =====================================================

router.get("/:id", protect, async (req, res) => {
    try {
        const transaction = await SyntheticTransaction.findOne({
            _id: req.params.id,
            user: req.user.id,
        });

        if (!transaction) {
            return res.status(404).json({
                message: "Synthetic transaction not found",
            });
        }

        res.json(transaction);
    } catch (error) {
        console.error("Get transaction error:", error);

        res.status(500).json({
            message: "Failed to fetch transaction",
        });
    }
});


// =====================================================
// CREATE SYNTHETIC TRANSACTION
// =====================================================

router.post("/", protect, async (req, res) => {
    try {
        const {
            name,
            description,
            steps,
            interval,
        } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Transaction name is required",
            });
        }

        if (!steps || steps.length === 0) {
            return res.status(400).json({
                message: "At least one step is required",
            });
        }

        const transaction = await SyntheticTransaction.create({
            user: req.user.id,
            name,
            description: description || "",
            steps,
            interval: interval || 60,
            status: "pending",
            enabled: true,
        });

        res.status(201).json(transaction);

    } catch (error) {
        console.error("Create transaction error:", error);

        res.status(500).json({
            message: "Failed to create synthetic transaction",
            error: error.message,
        });
    }
});


// =====================================================
// UPDATE SYNTHETIC TRANSACTION
// =====================================================

router.put("/:id", protect, async (req, res) => {
    try {
        const transaction = await SyntheticTransaction.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user.id,
            },
            {
                $set: req.body,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!transaction) {
            return res.status(404).json({
                message: "Synthetic transaction not found",
            });
        }

        res.json(transaction);

    } catch (error) {
        console.error("Update transaction error:", error);

        res.status(500).json({
            message: "Failed to update transaction",
        });
    }
});


// =====================================================
// DELETE SYNTHETIC TRANSACTION
// =====================================================

router.delete("/:id", protect, async (req, res) => {
    try {
        const transaction = await SyntheticTransaction.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id,
        });

        if (!transaction) {
            return res.status(404).json({
                message: "Synthetic transaction not found",
            });
        }

        res.json({
            message: "Synthetic transaction deleted",
        });

    } catch (error) {
        console.error("Delete transaction error:", error);

        res.status(500).json({
            message: "Failed to delete transaction",
        });
    }
});
// =====================================================
// EXECUTE (RUN) SYNTHETIC TRANSACTION
// =====================================================

router.post("/:id/execute", protect, async (req, res) => {
    try {
        const transaction = await SyntheticTransaction.findOne({
            _id: req.params.id,
            user: req.user.id,
        });

        if (!transaction) {
            return res.status(404).json({
                message: "Synthetic transaction not found",
            });
        }

        // TODO: put your actual "run the steps" logic here.
        // For now, this just marks it as executed so the button works.
        const result = {
            success: true,
            totalTimeMs: 0,
        };

        transaction.status = result.success ? "up" : "down";
        transaction.lastChecked = new Date();
        transaction.lastResult = result;

        await transaction.save();

        res.json({
            transaction,
            result,
        });

    } catch (error) {
        console.error("Execute transaction error:", error);

        res.status(500).json({
            message: "Failed to execute transaction",
        });
    }
});

module.exports = router;