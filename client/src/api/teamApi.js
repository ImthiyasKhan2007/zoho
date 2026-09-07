
import api from "./axios";

// Get all teams of logged-in user
export const getTeams = async () => {
    const response = await api.get("/teams");
    return response.data;
};

// Create a new team
export const createTeam = async (name) => {
    const response = await api.post("/teams", {
        name,
    });

    return response.data;
};

// Get current team details
export const getCurrentTeam = async (teamId) => {
    const response = await api.get("/teams/current", {
        headers: {
            "x-team-id": teamId,
        },
    });

    return response.data;
};

// Invite user to team
export const inviteUser = async (
    teamId,
    email,
    role = "member"
) => {
    const response = await api.post(
        "/teams/invite",
        {
            email,
            role,
        },
        {
            headers: {
                "x-team-id": teamId,
            },
        }
    );

    return response.data;
};

// Get my pending invitations
export const getMyInvitations = async () => {
    const response = await api.get(
        "/teams/invitations/me"
    );

    return response.data;
};

// Accept invitation
export const acceptInvitation = async (token) => {
    const response = await api.post(
        "/teams/invitations/accept",
        {
            token,
        }
    );

    return response.data;
};

// Remove member
export const removeMember = async (
    teamId,
    userId
) => {
    const response = await api.delete(
        `/teams/members/${userId}`,
        {
            headers: {
                "x-team-id": teamId,
            },
        }
    );

    return response.data;
};

// Change member role
export const changeMemberRole = async (
    teamId,
    userId,
    role
) => {
    const response = await api.patch(
        `/teams/members/${userId}/role`,
        {
            role,
        },
        {
            headers: {
                "x-team-id": teamId,
            },
        }
    );

    return response.data;
};

// Delete team
export const deleteTeam = async (teamId) => {
    const response = await api.delete(
        "/teams/current",
        {
            headers: {
                "x-team-id": teamId,
            },
        }
    );

    return response.data;
};

