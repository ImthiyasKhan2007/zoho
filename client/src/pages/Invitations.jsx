import { useEffect, useState } from "react";

import AppShell from "../components/AppShell";

import {
    getMyInvitations,
    acceptInvitation,
} from "../api/teamApi";

import { useTeam } from "../context/TeamContext";

function Invitations() {
    const [invitations, setInvitations] =
        useState([]);

    const {
        reloadTeams,
    } = useTeam();

    const loadInvitations = async () => {
        try {
            const data =
                await getMyInvitations();

            setInvitations(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadInvitations();
    }, []);

    const handleAccept = async (token) => {
        try {
            await acceptInvitation(token);

            alert(
                "Invitation accepted successfully"
            );

            await reloadTeams();

            loadInvitations();
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed to accept invitation"
            );
        }
    };

    return (
        <AppShell>
            <div
                style={{
                    padding: "30px",
                }}
            >
                <h1>
                    Team Invitations
                </h1>

                {invitations.length === 0 && (
                    <p>
                        No pending invitations.
                    </p>
                )}

                {invitations.map(
                    (invitation) => (
                        <div
                            key={
                                invitation._id
                            }
                            style={{
                                padding: "20px",
                                border: "1px solid #ddd",
                                marginBottom:
                                    "15px",
                                borderRadius:
                                    "10px",
                            }}
                        >
                            <h3>
                                {
                                    invitation
                                        .team
                                        .name
                                }
                            </h3>

                            <p>
                                Invited by:{" "}
                                {
                                    invitation
                                        .invitedBy
                                        ?.name
                                }
                            </p>

                            <p>
                                Role:{" "}
                                {
                                    invitation.role
                                }
                            </p>

                            <button
                                onClick={() =>
                                    handleAccept(
                                        invitation.token
                                    )
                                }
                            >
                                Accept
                            </button>
                        </div>
                    )
                )}
            </div>
        </AppShell>
    );
}

export default Invitations;