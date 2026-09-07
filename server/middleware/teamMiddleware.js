const Team = require("../models/Team");

const getTeam = async (req, res, next) => {
    try {
        // Get teamId safely from different possible locations
        const teamId =
            req.params.teamId ||
            req.body?.teamId ||
            req.query?.teamId ||
            req.user?.teamId;

        // If no team ID was supplied
        if (!teamId) {
            return res.status(400).json({
                success: false,
                message: "Team ID is required",
            });
        }

        // Find the team
        const team = await Team.findById(teamId);

        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found",
            });
        }

        // Make team available to the next controller
        req.team = team;

        next();
    } catch (error) {
        console.error("Get team middleware error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to load team",
            error: error.message,
        });
    }
};

module.exports = {
    getTeam,
};