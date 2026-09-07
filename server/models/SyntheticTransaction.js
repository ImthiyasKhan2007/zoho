const mongoose = require("mongoose");

const stepSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            default: "Step",
        },

        method: {
            type: String,
            default: "GET",
        },

        url: {
            type: String,
            required: true,
        },

        expectedStatusCode: {
            type: Number,
            default: 200,
        },

        timeout: {
            type: Number,
            default: 10000,
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
            required: true,
            validate: {
                validator: function (value) {
                    return value && value.length > 0;
                },
                message: "At least one step is required",
            },
        },

        interval: {
            type: Number,
            default: 60,
            min: 10,
        },

        status: {
            type: String,
            enum: ["pending", "running", "success", "failed", "up", "down"],
            default: "pending",
        },

        enabled: {
            type: Boolean,
            default: true,
        },

        lastRun: {
            type: Date,
            default: null,
        },

        lastRunAt: {
            type: Date,
            default: null,
        },

        lastResponseTime: {
            type: Number,
            default: null,
        },

        lastError: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports =
    mongoose.models.SyntheticTransaction ||
    mongoose.model("SyntheticTransaction", syntheticTransactionSchema);