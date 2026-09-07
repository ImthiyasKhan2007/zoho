
import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    getTeams,
    createTeam,
} from "../api/teamApi";

const TeamContext = createContext(null);

export function TeamProvider({ children }) {
    const [teams, setTeams] = useState([]);
    const [currentTeam, setCurrentTeam] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadTeams = async () => {
        try {
            const data = await getTeams();

            setTeams(data);

            const savedTeamId =
                localStorage.getItem("monitorx_team_id");

            let selectedTeam = null;

            if (savedTeamId) {
                selectedTeam = data.find(
                    (team) => team._id === savedTeamId
                );
            }

            if (!selectedTeam && data.length > 0) {
                selectedTeam = data[0];
            }

            if (selectedTeam) {
                setCurrentTeam(selectedTeam);

                localStorage.setItem(
                    "monitorx_team_id",
                    selectedTeam._id
                );
            }
        } catch (error) {
            console.error(
                "Failed to load teams:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token =
            localStorage.getItem("token");

        if (token) {
            loadTeams();
        } else {
            setLoading(false);
        }
    }, []);

    const switchTeam = (team) => {
        setCurrentTeam(team);

        localStorage.setItem(
            "monitorx_team_id",
            team._id
        );

        window.location.reload();
    };

    const addTeam = async (name) => {
        const result = await createTeam(name);

        const team = result.team;

        setTeams((previous) => [
            team,
            ...previous,
        ]);

        setCurrentTeam(team);

        localStorage.setItem(
            "monitorx_team_id",
            team._id
        );

        return team;
    };

    return (
        <TeamContext.Provider
            value={{
                teams,
                currentTeam,
                loading,
                switchTeam,
                addTeam,
                reloadTeams: loadTeams,
            }}
        >
            {children}
        </TeamContext.Provider>
    );
}

export function useTeam() {
    return useContext(TeamContext);
}

