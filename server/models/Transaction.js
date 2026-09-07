const mongoose = require("mongoose");

const stepSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        method: {
            type: String,
            enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
            default: "GET",
        },

        url: {
            type: String,
            required: true,
            trim: true,
        },

        expectedStatusCode: {
            type: Number,
            default: 200,
        },

        body: {
            type: String,
            default: "",
        },

        headers: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    { _id: true }
);

const syntheticTransactionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
        },

        steps: {
            type: [stepSchema],
            default: [],
        },

        status: {
            type: String,
            enum: ["up", "down", "pending"],
            default: "pending",
        },

        lastRun: {
            type: Date,
            default: null,
        },

        lastResponseTime: {
            type: Number,
            default: null,
        },

        lastError: {
            type: String,
            default: "",
        },

        interval: {
            type: Number,
            default: 60,
        },

        enabled: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "SyntheticTransaction",
    syntheticTransactionSchema
);