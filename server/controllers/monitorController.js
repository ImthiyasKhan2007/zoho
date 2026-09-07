const Monitor = require("../models/Monitor");
const Check = require("../models/Check");
const Team = require("../models/Team");

// @desc    Create a new monitor
// @route   POST /api/monitors
const createMonitor = async (req, res) => {
    try {
        const { name, url, interval, method, headers, body, expectedStatusCode, alertThreshold, checkType, port } = req.body;

        if (!name || !url) {
            return res.status(400).json({
                success: false,
                message: "Name and URL are required",
            });
        }

        const monitor = await Monitor.create({
            user: req.user._id,
            name,
            url,
            interval,
            method: method || "GET",
            headers: headers || {},
            body: body || "",
            expectedStatusCode: expectedStatusCode || null,
            alertThreshold: alertThreshold || 1,
            checkType: checkType || "http",
            port: port || null,
        });

        res.status(201).json({
            success: true,
            monitor,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
    const teamId =
        req.headers["x-team-id"];

    if (!teamId) {
        return res.status(400).json({
            message: "Team ID required",
        });
    }

    const team =
        await Team.findById(teamId);

    if (!team) {
        return res.status(404).json({
            message: "Team not found",
        });
    }

    const member =
        team.members.find(
            (m) =>
                m.user.toString() ===
                req.user._id.toString()
        );

    if (!member) {
        return res.status(403).json({
            message:
                "You are not a member of this team",
        });
    }
};


// @desc    Get all monitors belonging to the logged-in user
// @route   GET /api/monitors
const getMonitors = async (req, res) => {
    try {
        const monitors = await Monitor.find({ user: req.user._id }).sort({
            createdAt: -1,
        });

        res.status(200).json({
            success: true,
            count: monitors.length,
            monitors,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get a single monitor by ID (only if it belongs to the user)
// @route   GET /api/monitors/:id
const getMonitorById = async (req, res) => {
    try {
        const monitor = await Monitor.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!monitor) {
            return res.status(404).json({
                success: false,
                message: "Monitor not found",
            });
        }

        res.status(200).json({
            success: true,
            monitor,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get public status page data for a user (no auth required)
// @route   GET /api/monitors/public/:userId
const getPublicStatus = async (req, res) => {
    try {
        const monitors = await Monitor.find({
            user: req.params.userId,
            isPublic: true,
        }).select("name status lastChecked url");

        res.status(200).json({
            success: true,
            monitors,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update a monitor
// @route   PUT /api/monitors/:id
const updateMonitor = async (req, res) => {
    try {
        let monitor = await Monitor.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!monitor) {
            return res.status(404).json({
                success: false,
                message: "Monitor not found",
            });
        }

        const {
            name,
            url,
            interval,
            isActive,
            method,
            headers,
            body,
            expectedStatusCode,
            alertThreshold,
            checkType,
            port,
            isPublic,
        } = req.body;

        if (name !== undefined) monitor.name = name;
        if (url !== undefined) monitor.url = url;
        if (interval !== undefined) monitor.interval = interval;
        if (isActive !== undefined) monitor.isActive = isActive;
        if (method !== undefined) monitor.method = method;
        if (headers !== undefined) monitor.headers = headers;
        if (body !== undefined) monitor.body = body;
        if (expectedStatusCode !== undefined) monitor.expectedStatusCode = expectedStatusCode;
        if (alertThreshold !== undefined) monitor.alertThreshold = alertThreshold;
        if (checkType !== undefined) monitor.checkType = checkType;
        if (port !== undefined) monitor.port = port;
        if (isPublic !== undefined) monitor.isPublic = isPublic;

        await monitor.save();

        res.status(200).json({
            success: true,
            monitor,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Delete a monitor
// @route   DELETE /api/monitors/:id
const deleteMonitor = async (req, res) => {
    try {
        const monitor = await Monitor.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!monitor) {
            return res.status(404).json({
                success: false,
                message: "Monitor not found",
            });
        }

        await monitor.deleteOne();

        res.status(200).json({
            success: true,
            message: "Monitor deleted",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get uptime stats + recent history for a monitor
// @route   GET /api/monitors/:id/stats
const getMonitorStats = async (req, res) => {
    try {
        const monitor = await Monitor.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!monitor) {
            return res.status(404).json({
                success: false,
                message: "Monitor not found",
            });
        }

        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const checks = await Check.find({
            monitor: monitor._id,
            checkedAt: { $gte: since },
        }).sort({ checkedAt: 1 });

        const totalChecks = checks.length;
        const upChecks = checks.filter((c) => c.status === "up").length;

        const uptimePercentage =
            totalChecks === 0 ? null : ((upChecks / totalChecks) * 100).toFixed(2);

        const avgResponseTime =
            upChecks === 0
                ? null
                : Math.round(
                    checks
                        .filter((c) => c.status === "up")
                        .reduce((sum, c) => sum + c.responseTime, 0) / upChecks
                );

        const incidents = [];
        let currentIncident = null;

        for (const check of checks) {
            if (check.status === "down") {
                if (!currentIncident) {
                    currentIncident = { start: check.checkedAt, end: check.checkedAt, checkCount: 1 };
                } else {
                    currentIncident.end = check.checkedAt;
                    currentIncident.checkCount += 1;
                }
            } else if (currentIncident) {
                incidents.push(currentIncident);
                currentIncident = null;
            }
        }
        if (currentIncident) incidents.push(currentIncident);

        const incidentsWithDuration = incidents
            .map((inc) => ({
                ...inc,
                durationMinutes: Math.max(1, Math.round((new Date(inc.end) - new Date(inc.start)) / 60000)),
            }))
            .reverse();

        res.status(200).json({
            success: true,
            monitor: {
                id: monitor._id,
                name: monitor.name,
                url: monitor.url,
                currentStatus: monitor.status,
            },
            stats: {
                totalChecks,
                upChecks,
                downChecks: totalChecks - upChecks,
                uptimePercentage,
                avgResponseTime,
            },
            history: checks,
            incidents: incidentsWithDuration,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Export check history as CSV
// @route   GET /api/monitors/:id/report
const exportMonitorReport = async (req, res) => {
    try {
        const monitor = await Monitor.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!monitor) {
            return res.status(404).json({
                success: false,
                message: "Monitor not found",
            });
        }

        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const checks = await Check.find({
            monitor: monitor._id,
            checkedAt: { $gte: since },
        }).sort({ checkedAt: 1 });

        const escapeCsv = (value) => `"${String(value).replace(/"/g, '""')}"`;

        let csv = "Date,Time,Status,Status Code,Response Time (ms)\n";
        checks.forEach((c) => {
            const date = new Date(c.checkedAt);
            csv += [
                escapeCsv(date.toLocaleDateString()),
                escapeCsv(date.toLocaleTimeString()),
                escapeCsv(c.status),
                escapeCsv(c.statusCode ?? ""),
                escapeCsv(c.responseTime),
            ].join(",") + "\n";
        });

        const filename = `${monitor.name.replace(/[^a-z0-9]/gi, "_")}_report.csv`;

        const csvWithBom = "\uFEFF" + csv;

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.status(200).send(csvWithBom);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get all incidents across all monitors for the logged-in user
// @route   GET /api/monitors/incidents/all
const getAllIncidents = async (req, res) => {
    try {
        const monitors = await Monitor.find({ user: req.user._id });
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const allIncidents = [];

        for (const monitor of monitors) {
            const checks = await Check.find({
                monitor: monitor._id,
                checkedAt: { $gte: since },
            }).sort({ checkedAt: 1 });

            let currentIncident = null;
            for (const check of checks) {
                if (check.status === "down") {
                    if (!currentIncident) {
                        currentIncident = { start: check.checkedAt, end: check.checkedAt };
                    } else {
                        currentIncident.end = check.checkedAt;
                    }
                } else if (currentIncident) {
                    allIncidents.push({
                        monitorId: monitor._id,
                        monitorName: monitor.name,
                        monitorUrl: monitor.url,
                        ...currentIncident,
                    });
                    currentIncident = null;
                }
            }
            if (currentIncident) {
                allIncidents.push({
                    monitorId: monitor._id,
                    monitorName: monitor.name,
                    monitorUrl: monitor.url,
                    ...currentIncident,
                    ongoing: true,
                });
            }
        }

        const withDuration = allIncidents
            .map((inc) => ({
                ...inc,
                durationMinutes: Math.max(1, Math.round((new Date(inc.end) - new Date(inc.start)) / 60000)),
            }))
            .sort((a, b) => new Date(b.start) - new Date(a.start));

        res.status(200).json({
            success: true,
            incidents: withDuration,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createMonitor,
    getMonitors,
    getMonitorById,
    getPublicStatus,
    updateMonitor,
    deleteMonitor,
    getMonitorStats,
    exportMonitorReport,
    getAllIncidents,
};