const express = require("express");
const router = express.Router();
const { createMaintenance, getMaintenances, deleteMaintenance } = require("../controllers/maintenanceController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createMaintenance);
router.get("/", protect, getMaintenances);
router.delete("/:id", protect, deleteMaintenance);

module.exports = router;