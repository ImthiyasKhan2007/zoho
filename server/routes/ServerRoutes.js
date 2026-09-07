const express = require("express");
const router = express.Router();
const { createServer, getServers, getServerById, deleteServer, reportStats } = require("../controllers/serverController");
const { protect } = require("../middleware/authMiddleware");

// Agent reporting endpoint - NOT protected by JWT (uses its own API key instead)
router.post("/report", reportStats);

// Everything else requires the user to be logged in
router.post("/", protect, createServer);
router.get("/", protect, getServers);
router.get("/:id", protect, getServerById);
router.delete("/:id", protect, deleteServer);

module.exports = router;