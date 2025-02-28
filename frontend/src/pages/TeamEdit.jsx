import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import LoggedinNav from "../components/LoggedinNav";

const TeamEdit = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const team = location.state?.team; // If editing, this will contain team data
    const token = localStorage.getItem("access");
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [btnloading, btnsetLoading] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get("/api/users/", {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                setLoggedInUser(response.data); // Save user details
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };
        fetchUser();
    }, [token]);

    const [formData, setFormData] = useState({
        name: team?.name || "",
        description: team?.description || "",
        project_idea: team?.project_idea || "",
        looking_for: team?.looking_for || "",
        admin: team?.admin || loggedInUser?.id || "", // If creating, set logged-in user
        members: team?.members || [loggedInUser?.id] || [], // If creating, auto-add logged-in user
        members_limit: team?.members_limit || 5, // Default limit
        team_type: team?.team_type || ""
    });

    useEffect(() => {
        if (!team && loggedInUser) {
            setFormData((prevData) => ({
                ...prevData,
                admin: loggedInUser.id,
                members: [loggedInUser.id],
            }));
        }
    }, [loggedInUser, team]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        btnsetLoading(true);
        try {
            let response;
            if (team) {
                // If editing an existing team
                response = await axios.put(
                    `/api/teams/${team.id}/`,
                    formData,
                    {
                        headers: {
                            "Authorization": `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
            } else {
                // If creating a new team
                response = await axios.post("/api/teams/", formData, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                const newTeamId = response.data.id; // Get the new team ID

                // Update userProfile in localStorage
                const storedProfile = JSON.parse(localStorage.getItem("userProfile")) || {};
                const updatedProfile = {
                    ...storedProfile,
                    teams: storedProfile.teams ? [...storedProfile.teams, newTeamId] : [newTeamId], // Append new team ID
                };

                localStorage.setItem("userProfile", JSON.stringify(updatedProfile));

                // Send update request to backend
                await axios.patch(
                    `/api/profiles/${storedProfile.id}/`,
                    { teams: updatedProfile.teams },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            navigate(`/team/${response.data.id}`, { state: { team: response.data } });

        } catch (error) {
            console.error("Error saving team:", error);
        }

        btnsetLoading(false);
    };

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Function to toggle the sidebar visibility
    const toggleSidebar = () => {
        setIsSidebarOpen((prevState) => !prevState);
    };

    return (
        <>
            <div className="hidden md:flex">
                <Sidebar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
            </div>
            <div>
                <LoggedinNav />
            </div>

            <div
                className="min-h-screen flex items-center justify-center p-4 transition-all duration-300 lg:ml-[20%] md:ml-[10%]"
            >
                <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-2xl text-gray-200">
                    <h1 className="text-3xl font-bold mb-6 text-center text-lg sm:text-2xl md:text-3xl">
                        {team ? "Edit Team" : "Create Team"}
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2" htmlFor="name">
                                Name:
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" htmlFor="description">
                                Description:
                            </label>
                            <textarea
                                name="description"
                                id="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" htmlFor="project_idea">
                                Project Idea:
                            </label>
                            <textarea
                                name="project_idea"
                                id="project_idea"
                                value={formData.project_idea}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" htmlFor="looking_for">
                                Looking For:
                            </label>
                            <input
                                type="text"
                                name="looking_for"
                                id="looking_for"
                                value={formData.looking_for}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" htmlFor="team_type">
                                Team Type:
                            </label>
                            <select
                                name="team_type"
                                id="team_type"
                                value={formData.team_type}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            >
                                <option value="PUBLIC">Public</option>
                                <option value="PRIVATE">Private</option>
                            </select>
                        </div>


                        <div>
                            <label className="block text-sm font-medium mb-2" htmlFor="members_limit">
                                Members Limit:
                            </label>
                            <input
                                type="number"
                                name="members_limit"
                                id="members_limit"
                                value={formData.members_limit}
                                onChange={handleChange}
                                min="1"
                                className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg shadow-md transition-all duration-300 flex justify-center items-center"
                        >
                            {btnloading ? (
                                <div className="animate-spin w-6 h-6 border-4 border-t-transparent border-white rounded-full"></div>
                            ) : (
                                team ? "Save Changes" : "Create Team"
                            )}
                        </button>

                    </form>
                </div>
            </div>
        </>
    );
};

export default TeamEdit;
