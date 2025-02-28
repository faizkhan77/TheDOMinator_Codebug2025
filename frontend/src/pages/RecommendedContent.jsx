import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import LoggedinNav from "../components/LoggedinNav";

const RecommendedContent = () => {
    const [selectedOption, setSelectedOption] = useState("teams"); // Default to "teams"
    const [recommendedTeams, setRecommendedTeams] = useState([]);
    const [recommendedUsers, setRecommendedUsers] = useState([]);
    const [userTeams, setUserTeams] = useState([]); // Teams the user is part of
    const [selectedTeam, setSelectedTeam] = useState(""); // Currently selected team for recommendations
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
    const [selectedUser, setSelectedUser] = useState(null); // Selected user for invitation
    const [myTeams, setMyTeams] = useState([]);


    useEffect(() => {
        if (selectedOption === "teams") {
            fetchRecommendedTeams();
        } else if (selectedOption === "users") {
            fetchUserTeams();
        }
    }, [selectedOption]);

    useEffect(() => {

        loadMyTeams();
    }, []);

    const fetchRecommendedTeams = async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("access");

        try {
            const response = await axios.get("/api/recommend-teams/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            console.log("Fetched Teams:", response.data);
            setRecommendedTeams(response.data.recommended_teams || []);
        } catch (err) {
            console.error("Failed to fetch recommended teams:", err);
            setError("Failed to load recommendations.");
        } finally {
            setLoading(false);
        }
    };

    const fetchUserTeams = () => {
        setLoading(true);
        setError(null);

        try {
            const teamsData = localStorage.getItem("myTeams");
            if (teamsData) {
                setUserTeams(JSON.parse(teamsData)); // Parse the stored teams data
            } else {
                setError("No teams found in localStorage.");
            }
        } catch (err) {
            console.error("Failed to load teams from localStorage:", err);
            setError("Failed to load teams.");
        } finally {
            setLoading(false);
        }
    };


    const handleTeamSelection = async (teamId) => {
        setSelectedTeam(teamId);
        setRecommendedUsers([]); // Reset previous results
        if (!teamId) return; // If no team is selected, exit

        setLoading(true);
        setError(null);
        const token = localStorage.getItem("access");

        try {
            const response = await axios.get(`/api/recommend-users/${teamId}/`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            setRecommendedUsers(response.data.recommended_users || []);
        } catch (err) {
            console.error("Failed to fetch recommended users:", err);
            setError("Failed to load user recommendations.");
        } finally {
            setLoading(false);
        }
    };

    const loadMyTeams = () => {
        const storedTeams = localStorage.getItem("myTeams");
        if (storedTeams) {
            setMyTeams(JSON.parse(storedTeams));
        }
    };

    const openInviteModal = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedUser(null);
        setIsModalOpen(false);
    };

    const sendInvitation = async (teamId) => {
        const token = localStorage.getItem("access");

        try {
            await axios.post(
                "/api/invitations/",
                {
                    recipient_id: selectedUser.user,
                    team_id: teamId,
                },
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            alert(`Invitation sent to ${selectedUser.full_name} for team ${teamId}`);
            closeModal();
        } catch (error) {
            console.error("Failed to send invitation:", error);
            alert("Failed to send invitation. Please try again.");
        }
    };

    console.log("user", selectedUser)
    console.log("teams", myTeams)
    console.log("recommended", recommendedTeams)


    return (
        <>
            <div className="hidden md:flex">
                <Sidebar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
            </div>
            <LoggedinNav />
            <div className={`bg-gray-900 p-6 rounded-lg shadow-xl max-w-2xl mx-auto mt-4 ${isSidebarOpen ? "md:ml-[30%]" : "md:ml-[30%]"} `}>

                <h2 className="text-xl font-semibold text-white mb-4 text-center">Recommended Content</h2>
                <p className="text-white mb-4 text-center">use our powerful recommendation system to find you the best team or teammates!</p>

                {/* Selection buttons */}
                <div className="text-center mb-4">
                    <button
                        onClick={() => setSelectedOption("teams")}
                        className={`px-4 py-2 ${selectedOption === "teams" ? "bg-blue-500" : "bg-gray-600"} text-white rounded-md`}
                    >
                        Teams
                    </button>
                    <button
                        onClick={() => setSelectedOption("users")}
                        className={`ml-4 px-4 py-2 ${selectedOption === "users" ? "bg-blue-500" : "bg-gray-600"} text-white rounded-md`}
                    >
                        Users
                    </button>
                </div>

                {/* Loading and error states */}
                {loading && <p className="text-gray-400 text-center">Loading...</p>}
                {error && <p className="text-red-500 text-center">{error}</p>}

                {/* Recommended teams */}
                {selectedOption === "teams" && recommendedTeams.length > 0 && (
                    <ul className="space-y-4 max-h-[70vh] overflow-y-auto">
                        {recommendedTeams.map((team, index) => (
                            <li
                                key={team.id || `team-${index}`} // Fallback to index if id is missing
                                className="bg-gray-800 p-4 rounded-xl shadow-lg hover:shadow-2xl hover:bg-gray-700 transition duration-300"
                            >
                                <Link
                                    to={`/team/${team.id}`}
                                    state={{ team }}
                                    className="text-lg font-semibold text-indigo-400 hover:underline"
                                >
                                    {team.name}
                                </Link>
                                <p className="text-gray-300 text-sm mt-1">Looking for: {team.looking_for || "Not specified"}</p>
                                <p className="text-gray-400 text-sm mt-1">{team.description}</p>
                            </li>
                        ))}
                    </ul>
                )}

                {/* Recommended users */}
                {selectedOption === "users" && (
                    <div>
                        {/* Team selection dropdown */}
                        {userTeams.length > 0 ? (
                            <select
                                onChange={(e) => handleTeamSelection(e.target.value)}
                                className="bg-gray-800 text-white p-2 rounded-md w-full"
                            >
                                <option value="">Select a team</option>
                                {userTeams.map((team) => (
                                    <option key={team.id} value={team.id}>
                                        {team.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <p className="text-gray-400 text-center">No teams found.</p>
                        )}

                        {/* Recommended users list */}
                        {selectedTeam && recommendedUsers.length > 0 ? (
                            <ul className="space-y-4 mt-4 max-h-[70vh] overflow-y-auto">
                                {recommendedUsers.map((user, index) => (
                                    <li
                                        key={user.id || `user-${index}`} // Fallback to index if id is missing
                                        className="bg-gray-800 p-4 rounded-xl shadow-lg hover:shadow-2xl hover:bg-gray-700 transition duration-300"
                                    >
                                        <p className="text-lg font-semibold text-indigo-400">{user.full_name}</p>
                                        <p className="text-gray-400 text-sm mt-1">Role: {user.role}</p>
                                        <p className="text-gray-300 text-sm mt-1">
                                            Skills: {user.skills.map(skill => skill.skill_name).join(", ")}
                                        </p>

                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-semibold text-white">{user.profile?.full_name}</span>
                                            <button
                                                onClick={() => openInviteModal(user)}
                                                className="px-4 py-2 bg-blue-500 text-white rounded-md"
                                            >
                                                Invite
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : selectedTeam && !loading ? (
                            <p className="text-gray-400 text-center mt-4">No recommended users found.</p>
                        ) : null}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-96">
                        <h3 className="text-xl font-semibold text-white mb-4">
                            Invite {selectedUser?.full_name} to a Team
                        </h3>

                        {myTeams.length > 0 ? (
                            <ul className="space-y-2">
                                {myTeams.map((team) => (
                                    <li key={team.id} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                                        <span className="text-white">{team.name}</span>
                                        <button
                                            onClick={() => sendInvitation(team.id)}
                                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
                                        >
                                            Invite
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-400">You are not in any teams.</p>
                        )}

                        <button
                            onClick={closeModal}
                            className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg w-full"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default RecommendedContent;
