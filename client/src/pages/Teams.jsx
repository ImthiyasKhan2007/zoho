import { useEffect, useState } from "react";

import AppShell from "../components/AppShell";

import {
    getCurrentTeam,
    inviteUser,
    removeMember,
    changeMemberRole,
} from "../api/teamApi";

import { useTeam } from "../context/TeamContext";

function Teams() {
    const { currentTeam } = useTeam();

    const [team, setTeam] = useState(null);

    const [email, setEmail] =
        useState("");

    const [role, setRole] =
        useState("member");

    const [loading, setLoading] =
        useState(true);

    const loadTeam = async () => {
        if (!currentTeam) return;

        try {
            const data =
                await getCurrentTeam(
                    currentTeam._id
                );

            setTeam(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTeam();
    }, [currentTeam]);

    const getMyRole = () => {
        if (!team) return null;

        const member =
            team.members.find(
                (item) =>
                    item.user._id ===
                    JSON.parse(
                        localStorage.getItem(
                            "user"
                        ) || "{}"
                    )._id
            );

        return member?.role;
    };

    const handleInvite = async () => {
        if (!email.trim()) {
            alert("Enter email");
            return;
        }

        try {
            const result =
                await inviteUser(
                    currentTeam._id,
                    email,
                    role
                );

            alert(
                `Invitation created.\nToken: ${result.invitation.token}`
            );

            setEmail("");

        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Invitation failed"
            );
        }
    };

    const handleRemove = async (userId) => {
        if (
            !window.confirm(
                "Remove this member?"
            )
        ) {
            return;
        }

        try {
            await removeMember(
                currentTeam._id,
                userId
            );

            loadTeam();
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed"
            );
        }
    };

    const handleRoleChange = async (
        userId,
        newRole
    ) => {
        try {
            await changeMemberRole(
                currentTeam._id,
                userId,
                newRole
            );

            loadTeam();
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed"
            );
        }
    };

    if (!currentTeam) {
        return (
            <AppShell>
                <h2>No team selected</h2>
            </AppShell>
        );
    }

    if (loading) {
        return (
            <AppShell>
                <h2>Loading...</h2>
            </AppShell>
        );
    }

    const myRole = getMyRole();

    return (
        <AppShell>
            <div
                style={{
                    padding: "30px",
                }}
            >
                <h1>
                    {team?.name}
                </h1>

                <p>
                    Your role:{" "}
                    <strong>
                        {myRole}
                    </strong>
                </p>

                {(myRole === "owner" ||
                    myRole === "admin") && (
                        <div
                            style={{
                                marginTop: "30px",
                                marginBottom: "30px",
                            }}
                        >
                            <h2>
                                Invite Member
                            </h2>

                            <input
                                type="email"
                                placeholder="User email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(
                                        e.target.value
                                    )
                                }
                            />

                            <select
                                value={role}
                                onChange={(e) =>
                                    setRole(
                                        e.target.value
                                    )
                                }
                            >
                                <option value="member">
                                    Member
                                </option>

                                <option value="admin">
                                    Admin
                                </option>
                            </select>

                            <button
                                onClick={
                                    handleInvite
                                }
                            >
                                Invite
                            </button>
                        </div>
                    )}

                <h2>
                    Members
                </h2>

                <table
                    style={{
                        width: "100%",
                        borderCollapse:
                            "collapse",
                    }}
                >
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>

                            {(myRole ===
                                "owner" ||
                                myRole ===
                                "admin") && (
                                    <th>
                                        Actions
                                    </th>
                                )}
                        </tr>
                    </thead>

                    <tbody>
                        {team?.members.map(
                            (member) => (
                                <tr
                                    key={
                                        member.user
                                            ._id
                                    }
                                >
                                    <td>
                                        {
                                            member
                                                .user
                                                .name
                                        }
                                    </td>

                                    <td>
                                        {
                                            member
                                                .user
                                                .email
                                        }
                                    </td>

                                    <td>
                                        {member.role}
                                    </td>

                                    {(myRole ===
                                        "owner" ||
                                        myRole ===
                                        "admin") && (
                                            <td>
                                                {member.role !==
                                                    "owner" && (
                                                        <>
                                                            <select
                                                                value={
                                                                    member.role
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) =>
                                                                    handleRoleChange(
                                                                        member
                                                                            .user
                                                                            ._id,
                                                                        e
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                            >
                                                                <option value="member">
                                                                    Member
                                                                </option>

                                                                <option value="admin">
                                                                    Admin
                                                                </option>
                                                            </select>

                                                            <button
                                                                onClick={() =>
                                                                    handleRemove(
                                                                        member
                                                                            .user
                                                                            ._id
                                                                    )
                                                                }
                                                            >
                                                                Remove
                                                            </button>
                                                        </>
                                                    )}
                                            </td>
                                        )}
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>
        </AppShell>
    );
}

export default Teams;