const axios = require("axios");
const Monitor = require("../models/Monitor");
const Check = require("../models/Check");
const User = require("../models/User");
const net = require("net");
const { sendDownAlert, sendUpAlert } = require("./emailService");
const Maintenance = require("../models/Maintenance");

const checkAllMonitors = async () => {
    try {
        const monitors = await Monitor.find({ isActive: true });
        const now = Date.now();

        for (const monitor of monitors) {
            const intervalMs = (monitor.interval || 5) * 60 * 1000; // interval is in minutes
            const lastCheckedMs = monitor.lastChecked
                ? new Date(monitor.lastChecked).getTime()
                : 0;

            const dueForCheck = now - lastCheckedMs >= intervalMs;

            if (dueForCheck) {
                await checkSingleMonitor(monitor);
            }
        }
    } catch (error) {
        console.error("Error checking monitors:", error.message);
    }
};


const checkSingleMonitor = async (monitor) => {
    const startTime = Date.now();
    let status = "down";
    let statusCode = null;

    try {
        if (monitor.checkType === "tcp") {
            // TCP port check
            await checkTcpPort(monitor.url, monitor.port);
            status = "up";
            statusCode = null;
        } else {
            // HTTP check (existing behavior)
            const axiosConfig = {
                method: monitor.method || "GET",
                url: monitor.url,
                timeout: 10000,
                headers: monitor.headers ? Object.fromEntries(monitor.headers) : {},
            };

            if (["POST", "PUT", "PATCH"].includes(monitor.method) && monitor.body) {
                try {
                    axiosConfig.data = JSON.parse(monitor.body);
                } catch {
                    axiosConfig.data = monitor.body;
                }
            }

            const response = await axios(axiosConfig);
            statusCode = response.status;

            if (monitor.expectedStatusCode) {
                status = response.status === monitor.expectedStatusCode ? "up" : "down";
            } else if (response.status >= 200 && response.status < 400) {
                status = "up";
            }
        }
    } catch (error) {
        status = "down";
        if (error.response) {
            statusCode = error.response.status;
            if (monitor.expectedStatusCode && error.response.status === monitor.expectedStatusCode) {
                status = "up";
            }
        }
    }
    const responseTime = Date.now() - startTime;
    const previousStatus = monitor.status;

    if (status === "down") {
        monitor.consecutiveDownCount = (monitor.consecutiveDownCount || 0) + 1;
    } else {
        monitor.consecutiveDownCount = 0;
    }

    monitor.status = status;
    monitor.lastChecked = new Date();
    await monitor.save();

    await Check.create({
        monitor: monitor._id,
        status,
        responseTime,
        statusCode,
    });

    console.log(
        `🔍 Checked "${monitor.name}" (${monitor.url}) → ${status.toUpperCase()} (${responseTime}ms)`
    );

    // Only alert if the status actually CHANGED (and it's not the very first check)
    const threshold = monitor.alertThreshold || 1;

    const now = new Date();
    const activeMaintenance = await Maintenance.findOne({
        monitor: monitor._id,
        startTime: { $lte: now },
        endTime: { $gte: now },
    });

    if (!activeMaintenance) {
        if (status === "down" && monitor.consecutiveDownCount === threshold) {
            const user = await User.findById(monitor.user);
            if (user && user.emailNotifications) {
                await sendDownAlert(user.email, monitor);
            }
        }

        if (status === "up" && previousStatus === "down" && monitor.consecutiveDownCount === 0) {
            const user = await User.findById(monitor.user);
            if (user && user.emailNotifications) {
                await sendUpAlert(user.email, monitor);
            }
        }
    } else {
        console.log(`🔧 Skipping alert for "${monitor.name}" — active maintenance window: "${activeMaintenance.title}"`);
    }
};
const Server = require("../models/Server");

const checkOfflineServers = async () => {
    try {
        const cutoff = new Date(Date.now() - 3 * 60 * 1000); // 3 minutes without a report = offline
        await Server.updateMany(
            { lastSeen: { $lt: cutoff }, status: "online" },
            { status: "offline" }
        );
    } catch (error) {
        console.error("Error checking offline servers:", error.message);
    }
    const checkTcpPort = (host, port) => {
        return new Promise((resolve, reject) => {
            const socket = new net.Socket();
            const timeout = 5000;

            socket.setTimeout(timeout);

            socket.on("connect", () => {
                socket.destroy();
                resolve();
            });

            socket.on("timeout", () => {
                socket.destroy();
                reject(new Error("Connection timed out"));
            });

            socket.on("error", (err) => {
                socket.destroy();
                reject(err);
            });

            socket.connect(port, host);
        });
    };
};
module.exports = { checkAllMonitors, checkSingleMonitor, checkOfflineServers };