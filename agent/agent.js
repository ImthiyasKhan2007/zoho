const axios = require("axios");
const si = require("systeminformation");

// 🔑 Replace this with the API key from your Server (we'll get this in the next step)
const API_KEY = process.env.MONITORX_API_KEY;

if (!API_KEY) {
    console.error("❌ No API key provided. Run with: set MONITORX_API_KEY=your_key && node agent.js");
    process.exit(1);
}
const SERVER_URL = "http://localhost:5000/api/servers/report";

const collectAndSend = async () => {
    try {
        const cpu = await si.currentLoad();
        const mem = await si.mem();
        const disk = await si.fsSize();
        const time = await si.time();

        const cpuUsage = Math.round(cpu.currentLoad);
        const ramUsage = Math.round(mem.active / (1024 * 1024)); // MB
        const ramTotal = Math.round(mem.total / (1024 * 1024)); // MB
        const diskUsage = disk[0] ? Math.round(disk[0].used / (1024 * 1024 * 1024)) : 0; // GB
        const diskTotal = disk[0] ? Math.round(disk[0].size / (1024 * 1024 * 1024)) : 0; // GB
        console.log("Sending with API key:", API_KEY);
        await axios.post(SERVER_URL, {
            apiKey: API_KEY,
            cpuUsage,
            ramUsage,
            ramTotal,
            diskUsage,
            diskTotal,
            uptime: Math.round(time.uptime),
        });

        console.log(`📊 Sent stats: CPU ${cpuUsage}% | RAM ${ramUsage}/${ramTotal}MB | Disk ${diskUsage}/${diskTotal}GB`);
    } catch (error) {
        console.error("❌ Failed to send stats:", error.message);
    }
};

// Send immediately, then every 30 seconds
collectAndSend();
setInterval(collectAndSend, 30000);

console.log("🚀 Monitor X agent started. Sending stats every 30 seconds...");