const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        role: {
            type: String,
            enum: ["owner", "admin", "member"],
            default: "member",
        },

        joinedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: false }
);

const teamSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        members: {
            type: [teamMemberSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Team", teamSchema);