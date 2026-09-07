const mongoose = require("mongoose");

const serverSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: [true, "Server name is required"],
            trim: true,
        },
        apiKey: {
            type: String,
            required: true,
            unique: true,
        },
        status: {
            type: String,
            enum: ["online", "offline", "pending"],
            default: "pending",
        },
        lastSeen: {
            type: Date,
            default: null,
        },
        latestStats: {
            cpuUsage: { type: Number, default: null },
            ramUsage: { type: Number, default: null },
            ramTotal: { type: Number, default: null },
            diskUsage: { type: Number, default: null },
            diskTotal: { type: Number, default: null },
            uptime: { type: Number, default: null },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Server", serverSchema);