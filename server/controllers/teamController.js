const crypto = require("crypto");

const Team = require("../models/Team");
const TeamInvitation = require("../models/TeamInvitation");
const User = require("../models/User");


// CREATE TEAM
exports.createTeam = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Team name is required",
            });
        }

        const team = await Team.create({
            name: name.trim(),

            owner: req.user._id,

            members: [
                {
                    user: req.user._id,
                    role: "owner",
                },
            ],
        });

        const populatedTeam = await Team.findById(team._id)
            .populate("owner", "name email")
            .populate("members.user", "name email");

        res.status(201).json({
            message: "Team created successfully",
            team: populatedTeam,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to create team",
        });
    }
};


// GET MY TEAMS
exports.getMyTeams = async (req, res) => {
    try {
        const teams = await Team.find({
            "members.user": req.user._id,
        })
            .populate("owner", "name email")
            .populate("members.user", "name email")
            .sort({ createdAt: -1 });

        res.json(teams);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to get teams",
        });
    }
};


// GET TEAM
exports.getTeamDetails = async (req, res) => {
    try {
        const team = await Team.findById(req.team._id)
            .populate("owner", "name email")
            .populate("members.user", "name email");

        res.json(team);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to get team",
        });
    }
};


// INVITE USER
exports.inviteUser = async (req, res) => {
    try {
        const { email, role = "member" } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required",
            });
        }

        const normalizedEmail = email
            .trim()
            .toLowerCase();

        if (!["admin", "member"].includes(role)) {
            return res.status(400).json({
                message: "Invalid role",
            });
        }

        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {
            const alreadyMember = req.team.members.some(
                (member) =>
                    member.user.toString() ===
                    existingUser._id.toString()
            );

            if (alreadyMember) {
                return res.status(400).json({
                    message: "User is already a team member",
                });
            }
        }

        const existingInvitation =
            await TeamInvitation.findOne({
                team: req.team._id,
                email: normalizedEmail,
                status: "pending",
            });

        if (existingInvitation) {
            return res.status(400).json({
                message: "Invitation already sent",
            });
        }

        const token = crypto
            .randomBytes(32)
            .toString("hex");

        const invitation = await TeamInvitation.create({
            team: req.team._id,
            email: normalizedEmail,
            invitedBy: req.user._id,
            role,
            token,
        });

        res.status(201).json({
            message: "Invitation created successfully",

            invitation: {
                id: invitation._id,
                email: invitation.email,
                role: invitation.role,
                token: invitation.token,
            },
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to invite user",
        });
    }
};


// GET TEAM INVITATIONS
exports.getTeamInvitations = async (req, res) => {
    try {
        const invitations = await TeamInvitation.find({
            team: req.team._id,
            status: "pending",
        })
            .populate("invitedBy", "name email")
            .sort({ createdAt: -1 });

        res.json(invitations);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to get invitations",
        });
    }
};


// GET MY INVITATIONS
exports.getMyInvitations = async (req, res) => {
    try {
        const invitations =
            await TeamInvitation.find({
                email: req.user.email.toLowerCase(),
                status: "pending",
                expiresAt: { $gt: new Date() },
            })
                .populate("team", "name")
                .populate("invitedBy", "name email")
                .sort({ createdAt: -1 });

        res.json(invitations);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to get invitations",
        });
    }
};


// ACCEPT INVITATION
exports.acceptInvitation = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                message: "Invitation token is required",
            });
        }

        const invitation =
            await TeamInvitation.findOne({
                token,
                status: "pending",
            });

        if (!invitation) {
            return res.status(404).json({
                message: "Invitation not found or already used",
            });
        }

        if (invitation.expiresAt < new Date()) {
            invitation.status = "rejected";
            await invitation.save();

            return res.status(400).json({
                message: "Invitation has expired",
            });
        }

        if (
            req.user.email.toLowerCase() !==
            invitation.email.toLowerCase()
        ) {
            return res.status(403).json({
                message:
                    "This invitation belongs to another email",
            });
        }

        const team = await Team.findById(
            invitation.team
        );

        if (!team) {
            return res.status(404).json({
                message: "Team not found",
            });
        }

        const alreadyMember = team.members.some(
            (member) =>
                member.user.toString() ===
                req.user._id.toString()
        );

        if (!alreadyMember) {
            team.members.push({
                user: req.user._id,
                role: invitation.role,
            });

            await team.save();
        }

        invitation.status = "accepted";

        await invitation.save();

        const populatedTeam =
            await Team.findById(team._id)
                .populate("owner", "name email")
                .populate("members.user", "name email");

        res.json({
            message: "Invitation accepted",
            team: populatedTeam,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to accept invitation",
        });
    }
};


// REMOVE MEMBER
exports.removeMember = async (req, res) => {
    try {
        const { userId } = req.params;

        if (userId === req.team.owner.toString()) {
            return res.status(400).json({
                message: "Team owner cannot be removed",
            });
        }

        req.team.members =
            req.team.members.filter(
                (member) =>
                    member.user.toString() !== userId
            );

        await req.team.save();

        res.json({
            message: "Member removed successfully",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to remove member",
        });
    }
};


// CHANGE MEMBER ROLE
exports.changeMemberRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!["admin", "member"].includes(role)) {
            return res.status(400).json({
                message: "Invalid role",
            });
        }

        const member = req.team.members.find(
            (m) =>
                m.user.toString() === userId
        );

        if (!member) {
            return res.status(404).json({
                message: "Member not found",
            });
        }

        if (
            member.user.toString() ===
            req.team.owner.toString()
        ) {
            return res.status(400).json({
                message: "Owner role cannot be changed",
            });
        }

        member.role = role;

        await req.team.save();

        res.json({
            message: "Member role updated",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update role",
        });
    }
};


// DELETE TEAM
exports.deleteTeam = async (req, res) => {
    try {
        await Team.findByIdAndDelete(req.team._id);

        await TeamInvitation.deleteMany({
            team: req.team._id,
        });

        res.json({
            message: "Team deleted successfully",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to delete team",
        });
    }
};