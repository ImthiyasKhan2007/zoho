const crypto = require("crypto");
const Server = require("../models/Server");
const ServerStat = require("../models/ServerStat");

// @desc    Create a new server to monitor (generates an API key for the agent)
// @route   POST /api/servers
const createServer = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: "Server name is required" });
        }

        const apiKey = crypto.randomBytes(24).toString("hex");

        const server = await Server.create({
            user: req.user._id,
            name,
            apiKey,
        });

        res.status(201).json({ success: true, server });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all servers for the logged-in user
// @route   GET /api/servers
const getServers = async (req, res) => {
    try {
        const servers = await Server.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, servers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get a single server + recent stat history
// @route   GET /api/servers/:id
const getServerById = async (req, res) => {
    try {
        const server = await Server.findOne({ _id: req.params.id, user: req.user._id });
        if (!server) {
            return res.status(404).json({ success: false, message: "Server not found" });
        }

        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const history = await ServerStat.find({ server: server._id, recordedAt: { $gte: since } }).sort({ recordedAt: 1 });

        res.status(200).json({ success: true, server, history });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a server
// @route   DELETE /api/servers/:id
const deleteServer = async (req, res) => {
    try {
        const server = await Server.findOne({ _id: req.params.id, user: req.user._id });
        if (!server) {
            return res.status(404).json({ success: false, message: "Server not found" });
        }
        await server.deleteOne();
        res.status(200).json({ success: true, message: "Server deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Agent pushes stats here (uses API key, NOT JWT auth, since it's a script not a browser)
// @route   POST /api/servers/report
const reportStats = async (req, res) => {
    try {
        const { apiKey, cpuUsage, ramUsage, ramTotal, diskUsage, diskTotal, uptime } = req.body;

        if (!apiKey) {
            return res.status(401).json({ success: false, message: "API key required" });
        }

        const server = await Server.findOne({ apiKey });
        if (!server) {
            return res.status(401).json({ success: false, message: "Invalid API key" });
        }

        server.status = "online";
        server.lastSeen = new Date();
        server.latestStats = { cpuUsage, ramUsage, ramTotal, diskUsage, diskTotal, uptime };
        await server.save();

        await ServerStat.create({
            server: server._id,
            cpuUsage,
            ramUsage,
            ramTotal,
            diskUsage,
            diskTotal,
        });

        res.status(200).json({ success: true, message: "Stats recorded" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createServer, getServers, getServerById, deleteServer, reportStats };