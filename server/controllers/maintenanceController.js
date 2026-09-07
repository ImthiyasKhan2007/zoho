const Maintenance = require("../models/Maintenance");
const Monitor = require("../models/Monitor");

// @desc    Schedule a maintenance window for a monitor
// @route   POST /api/maintenance
const createMaintenance = async (req, res) => {
    try {
        const { monitorId, title, startTime, endTime } = req.body;

        if (!monitorId || !title || !startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: "Monitor, title, start time, and end time are required",
            });
        }

        const monitor = await Monitor.findOne({ _id: monitorId, user: req.user._id });
        if (!monitor) {
            return res.status(404).json({ success: false, message: "Monitor not found" });
        }

        const maintenance = await Maintenance.create({
            user: req.user._id,
            monitor: monitorId,
            title,
            startTime,
            endTime,
        });

        res.status(201).json({ success: true, maintenance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all maintenance windows for the logged-in user
// @route   GET /api/maintenance
const getMaintenances = async (req, res) => {
    try {
        const maintenances = await Maintenance.find({ user: req.user._id })
            .populate("monitor", "name")
            .sort({ startTime: -1 });

        res.status(200).json({ success: true, maintenances });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a maintenance window
// @route   DELETE /api/maintenance/:id
const deleteMaintenance = async (req, res) => {
    try {
        const maintenance = await Maintenance.findOne({ _id: req.params.id, user: req.user._id });
        if (!maintenance) {
            return res.status(404).json({ success: false, message: "Maintenance window not found" });
        }
        await maintenance.deleteOne();
        res.status(200).json({ success: true, message: "Maintenance window deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createMaintenance, getMaintenances, deleteMaintenance };