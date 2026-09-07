const Log = require("../models/Log");

const createLog = async (req, res) => {
    try {
        const { source, level, message } = req.body;
        if (!source || !message) {
            return res.status(400).json({ success: false, message: "Source and message are required" });
        }

        const log = await Log.create({
            user: req.user._id,
            source,
            level: level || "info",
            message,
        });

        res.status(201).json({ success: true, log });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getLogs = async (req, res) => {
    try {
        const { source, level, search } = req.query;
        const query = { user: req.user._id };

        if (source) query.source = source;
        if (level) query.level = level;
        if (search) query.message = { $regex: search, $options: "i" };

        const logs = await Log.find(query).sort({ createdAt: -1 }).limit(200);

        res.status(200).json({ success: true, logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteLog = async (req, res) => {
    try {
        const log = await Log.findOne({ _id: req.params.id, user: req.user._id });
        if (!log) {
            return res.status(404).json({ success: false, message: "Log not found" });
        }
        await log.deleteOne();
        res.status(200).json({ success: true, message: "Log deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const clearLogs = async (req, res) => {
    try {
        await Log.deleteMany({ user: req.user._id });
        res.status(200).json({ success: true, message: "All logs cleared" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createLog, getLogs, deleteLog, clearLogs };