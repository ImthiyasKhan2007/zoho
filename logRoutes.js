const express = require("express");
const router = express.Router();
const { createLog, getLogs, deleteLog, clearLogs } = require("../controllers/logController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createLog);
router.get("/", protect, getLogs);
router.delete("/clear", protect, clearLogs);
router.delete("/:id", protect, deleteLog);

module.exports = router;