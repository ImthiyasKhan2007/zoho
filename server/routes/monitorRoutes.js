const express = require("express");
const router = express.Router();
const {
    createMonitor,
    getMonitors,
    getMonitorById,
    updateMonitor,
    deleteMonitor,
    getMonitorStats,
    exportMonitorReport,
    getAllIncidents,
    getPublicStatus,
} = require("../controllers/monitorController");

const { protect } = require("../middleware/authMiddleware");
router.post("/", protect, createMonitor);
router.get("/", protect, getMonitors);
router.get("/incidents/all", protect, getAllIncidents);
router.get("/public/:userId", getPublicStatus);
router.get("/:id", protect, getMonitorById);
router.put("/:id", protect, updateMonitor);
router.delete("/:id", protect, deleteMonitor);
router.get("/:id/stats", protect, getMonitorStats);
router.get("/:id/report", protect, exportMonitorReport);

module.exports = router;