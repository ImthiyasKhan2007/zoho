const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    source: {
        type: String,
        required: true,
        trim: true,
    },
    level: {
        type: String,
        enum: ["info", "warning", "error"],
        default: "info",
    },
    message: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Log", logSchema);