const mongoose = require("mongoose");

const serverStatSchema = new mongoose.Schema({
    server: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Server",
        required: true,
    },
    cpuUsage: Number,
    ramUsage: Number,
    ramTotal: Number,
    diskUsage: Number,
    diskTotal: Number,
    recordedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("ServerStat", serverStatSchema);