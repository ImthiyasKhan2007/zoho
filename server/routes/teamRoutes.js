const express = require("express");
const router = express.Router();

const Team = require("../models/Team");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");


// GET MY TEAM
router.get("/", protect, async (req, res) => {
    try {
        const team = await Team.findOne({
            "members.user": req.user.id,
        })
            .populate("owner", "name email")
            .populate("members.user", "name email");

        if (!team) {
            return res.json({ team: null });
        }

        res.json({ team });
    } catch (err) {
        res.status(500).json({
            message: "Failed to load team",
        });
    }
});


// CREATE TEAM
router.post("/", protect, async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Team name is required",
            });
        }

        const existingTeam = await Team.findOne({
            owner: req.user.id,
        });

        if (existingTeam) {
            return res.status(400).json({
                message: "You already own a team",
            });
        }

        const team = await Team.create({
            name: name.trim(),
            owner: req.user.id,
            members: [
                {
                    user: req.user.id,
                    role: "owner",
                },
            ],
        });

        res.status(201).json({
            message: "Team created",
            team,
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Failed to create team",
        });
    }
});


// ADD MEMBER
router.post("/members", protect, async (req, res) => {
    try {
        const { email, role = "member" } = req.body;

        const team = await Team.findOne({
            owner: req.user.id,
        });

        if (!team) {
            return res.status(404).json({
                message: "Team not found",
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found. They must register first.",
            });
        }

        const alreadyMember = team.members.some(
            (member) =>
                member.user.toString() === user._id.toString()
        );

        if (alreadyMember) {
            return res.status(400).json({
                message: "User is already a team member",
            });
        }

        team.members.push({
            user: user._id,
            role,
        });

        await team.save();

        const updatedTeam = await Team.findById(team._id)
            .populate("owner", "name email")
            .populate("members.user", "name email");

        res.json({
            message: "Member added",
            team: updatedTeam,
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Failed to add member",
        });
    }
});


// REMOVE MEMBER
router.delete("/members/:userId", protect, async (req, res) => {
    try {
        const team = await Team.findOne({
            owner: req.user.id,
        });

        if (!team) {
            return res.status(404).json({
                message: "Team not found",
            });
        }

        if (req.params.userId === req.user.id) {
            return res.status(400).json({
                message: "Owner cannot remove themselves",
            });
        }

        team.members = team.members.filter(
            (member) =>
                member.user.toString() !== req.params.userId
        );

        await team.save();

        res.json({
            message: "Member removed",
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to remove member",
        });
    }
});


// UPDATE MEMBER ROLE
router.put("/members/:userId", protect, async (req, res) => {
    try {
        const { role } = req.body;

        if (!["admin", "member"].includes(role)) {
            return res.status(400).json({
                message: "Invalid role",
            });
        }

        const team = await Team.findOne({
            owner: req.user.id,
        });

        if (!team) {
            return res.status(404).json({
                message: "Team not found",
            });
        }

        const member = team.members.find(
            (m) =>
                m.user.toString() === req.params.userId
        );

        if (!member) {
            return res.status(404).json({
                message: "Member not found",
            });
        }

        member.role = role;

        await team.save();

        res.json({
            message: "Role updated",
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to update role",
        });
    }
});


module.exports = router;