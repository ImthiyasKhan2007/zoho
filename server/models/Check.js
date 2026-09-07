const mongoose = require("mongoose");

const checkSchema = new mongoose.Schema(
    {
        monitor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Monitor",
            required: true,
        },
        status: {
            type: String,
            enum: ["up", "down"],
            required: true,
        },
        responseTime: {
            type: Number, // in milliseconds
            required: true,
        },
        statusCode: {
            type: Number, // e.g. 200, 404, 500 (optional, for debugging)
            default: null,
        },
        checkedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: false } // we already track checkedAt ourselves
);

module.exports = mongoose.model("Check", checkSchema);