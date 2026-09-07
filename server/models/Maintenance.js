const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        monitor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Monitor",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Maintenance", maintenanceSchema);