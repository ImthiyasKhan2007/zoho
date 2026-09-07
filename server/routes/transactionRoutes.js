const express = require("express");

const router = express.Router();

const {
    createTransaction,
    getTransactions,
    getTransaction,
    executeTransaction,
    deleteTransaction,
} = require("../controllers/transactionController");

const { protect } = require("../middleware/authMiddleware");

const teamMiddleware = require("../middleware/teamMiddleware");

const getTeam = teamMiddleware.getTeam;



// ==========================================
// CREATE TRANSACTION
// ==========================================

router.post(
    "/",
    protect,
    getTeam,
    createTransaction
);

// ==========================================
// GET ALL TRANSACTIONS
// ==========================================

router.get(
    "/",
    protect,
    getTeam,
    getTransactions
);

// ==========================================
// GET SINGLE TRANSACTION
// ==========================================

router.get(
    "/:id",
    protect,
    getTeam,
    getTransaction
);

// ==========================================
// EXECUTE TRANSACTION
// ==========================================

router.post(
    "/:id/execute",
    protect,
    getTeam,
    executeTransaction
);

// ==========================================
// DELETE TRANSACTION
// ==========================================

router.delete(
    "/:id",
    protect,
    getTeam,
    deleteTransaction
);
console.log({ protect, getTeam, createTransaction });
module.exports = router
