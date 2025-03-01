import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import LoggedinNav from "../components/LoggedinNav";

const MyTeams = () => {
    const [teams, setTeams] = useState([]);
    const [searchQuery, setSearchQuery] = useState(""); // ✅ State for search input
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar visibility state
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
        const userProfile = JSON.parse(localStorage.getItem("userProfile")); // ✅ Get userProfile
        const userTeamIds = userProfile?.teams || []; // ✅ Extract team IDs array


        console.warn("team Id", userTeamIds)

        try {
            const response = await axios.get("/api/teams/", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            // ✅ Filter only teams that the user is part of
            const myTeams = response.data.filter((team) => userTeamIds.includes(team.id));
            setTeams(myTeams);
            localStorage.setItem("myTeams", JSON.stringify(myTeams)); // ✅ Store in localStorage

            console.log("MY TEANS", response.data.team)
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

    // Function to toggle the sidebar visibility
    const toggleSidebar = () => {
        setIsSidebarOpen(prevState => !prevState);
    };

    return (
        <>
        {/* Sidebar Component */}
        <div className="md:flex hidden">
          <Sidebar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        </div>
        <LoggedinNav />
      
        <div
          className={`lg:px-8 px-4 py-6 transition-all duration-300 ${isSidebarOpen ? "md:ml-[20%]" : "md:ml-[10%]"}`}
          style={{ overflowY: "auto", backgroundColor: "#0a0a0a", minHeight: "100vh" }} // Dark background
        >
          <h2 className="text-3xl font-semibold text-white mb-6">My Teams</h2>
      
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search teams by name or required roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 mb-6 bg-[#141414] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6556cd] transition duration-300 shadow-md"
          />
      
          {/* Loading Spinner */}
          {isLoading ? (
            <div className="flex justify-center items-center h-[50vh]">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#6556cd] border-solid"></div>
            </div>
          ) : (
            <>
              {filteredTeams.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto pr-2">
                  {filteredTeams.map((team) => (
                    <div
                      key={team.id}
                      className="bg-[#141414] text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 border border-gray-700 hover:border-[#6556cd]"
                    >
                      <Link to={`/team/${team.id}`} state={{ team }} className="block">
                        <h3 className="text-xl font-semibold mb-2 text-[#6556cd]">{team.name}</h3>
                        <p className="text-sm text-gray-400 mb-4">
                          Looking for: {team.looking_for || "Not specified"}
                        </p>
                        <p className="text-sm mb-4">{team.description}</p>
                        <p className="text-sm text-gray-400 mb-2">Admin: {team.admin.username}</p>
                        <p className="text-sm text-gray-400">Members Limit: {team.members_limit}</p>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white text-center">You are not part of any teams.</p>
              )}
            </>
          )}
        </div>
      </>
      
    );
};

export default MyTeams;
