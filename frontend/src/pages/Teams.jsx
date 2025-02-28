import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import LoggedinNav from "../components/LoggedinNav";

const Teams = () => {
    const [teams, setTeams] = useState([]);
    const [searchQuery, setSearchQuery] = useState(""); // ✅ State for search input
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTeams = async () => {
            setIsLoading(true); // Start loading
            await getTeams(); // Fetch teams
            setIsLoading(false); // Stop loading after data is fetched
        };

        fetchTeams();
    }, []);

    const getTeams = async () => {
        const token = localStorage.getItem("access");

        try {
            const response = await axios.get("/api/teams/", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            setTeams(response.data);
            localStorage.setItem("teams", JSON.stringify(response.data));
        } catch (error) {
            console.error("Failed to fetch teams:", error);
        }
    };

    // ✅ Filter teams based on name or "looking_for" field
    const filteredTeams = teams.filter((team) =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (team.looking_for &&
            team.looking_for.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State to track sidebar visibility

    // Function to toggle the sidebar visibility
    const toggleSidebar = () => {
        setIsSidebarOpen(prevState => !prevState);
    };

    const getTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.floor((now - date) / 1000); // Difference in seconds

        if (diffTime < 60) {
            return `${diffTime} second${diffTime !== 1 ? "s" : ""} ago`;
        } else if (diffTime < 3600) {
            const minutes = Math.floor(diffTime / 60);
            return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
        } else if (diffTime < 86400) {
            const hours = Math.floor(diffTime / 3600);
            return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
        } else {
            const days = Math.floor(diffTime / 86400);
            return `${days} day${days !== 1 ? "s" : ""} ago`;
        }
    };

    return (
        <>
            {/* Sidebar Component */}
            <div className="hidden md:flex">
                <Sidebar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
            </div>
            <LoggedinNav />

            <div
                className={`px-8 py-6 transition-all duration-300 ${isSidebarOpen ? "md:ml-[20%]" : "md:ml-[10%]"}`}
            >
                <h2 className="text-3xl font-semibold text-white mb-6">Teams</h2>

                {/* Search Input */}
                <input
                    type="text"
                    placeholder="Search teams by name or required roles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 mb-6 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition duration-300"
                />

                {/* Create Team Button */}
                <Link to="/team/new">
                    <button className="w-full p-3 bg-primary text-white font-semibold rounded-lg mb-6 hover:bg-primary-dark transition duration-300">
                        Create Team
                    </button>
                </Link>

                {/* Loading Spinner */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-[50vh]">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
                    </div>
                ) : (
                    <>
                        {/* Display Teams */}
                        {filteredTeams.length > 0 ? (
                            <div
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto"
                                style={{ maxHeight: '70vh' }} // Adjust the height as needed
                            >
                                {filteredTeams.map((team) => (
                                    <div
                                        key={team.id}
                                        className="bg-gray-800 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300"
                                    >
                                        <Link to={`/team/${team.id}`} state={{ team }} className="block">
                                            <h3 className="text-xl font-semibold mb-2">{team.name}</h3>
                                            <p className="text-sm text-gray-400 mb-4">Looking for: {team.looking_for || "Not specified"}</p>
                                            <p className="text-sm mb-4">{team.description}</p>
                                            <p className="text-sm text-gray-400 mb-2">Admin: {team.admin.username}</p>
                                            <p className="text-sm text-gray-400">Members Limit: {team.members_limit}</p>
                                            <p className="text-sm text-gray-400">Type: {team.team_type}</p>
                                            <p className="text-sm text-gray-400 mb-2">Created: {getTimeAgo(team.created)}</p>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-white">No teams found.</p>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default Teams;
