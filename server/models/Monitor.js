const mongoose = require("mongoose");

const monitorSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: null,
        },
        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            default: true,
        },
        name: {
            type: String,
            required: [true, "Monitor name is required"],
            trim: true,
        },
        url: {
            type: String,
            required: [true, "URL is required"],
            trim: true,
        },
        interval: {
            type: Number,
            default: 60,
        },
        status: {
            type: String,
            enum: ["up", "down", "pending"],
            default: "pending",
        },
        lastChecked: {
            type: Date,
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isPublic: {
            type: Boolean,
            default: false,
        },
        method: {
            type: String,
            enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
            default: "GET",
        },
        headers: {
            type: Map,
            of: String,
            default: {},
        },
        body: {
            type: String,
            default: "",
        },
        expectedStatusCode: {
            type: Number,
            default: 200,
        },
        alertThreshold: {
            type: Number,
            default: 1,
        },
        consecutiveDownCount: {
            type: Number,
            default: 0,
        },
        checkType: {
            type: String,
            enum: ["http", "tcp"],
            default: "http",
        },
        port: {
            type: Number,
            default: null,
        },
    },
    { timestamps: true }
);


module.exports = mongoose.model("Monitor", monitorSchema);