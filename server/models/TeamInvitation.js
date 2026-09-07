const mongoose = require("mongoose");

const teamInvitationSchema = new mongoose.Schema(
    {
        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            required: true,
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        invitedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        role: {
            type: String,
            enum: ["admin", "member"],
            default: "member",
        },

        token: {
            type: String,
            required: true,
            unique: true,
        },

        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending",
        },

        expiresAt: {
            type: Date,
            default: () =>
                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "TeamInvitation",
    teamInvitationSchema
);