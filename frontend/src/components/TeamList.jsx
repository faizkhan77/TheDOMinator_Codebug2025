import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const TeamList = ({ onSelectTeam, searchQuery, setSearchQuery }) => {
    const [teams, setTeams] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Loader state

    useEffect(() => {
        getTeams();
    }, []);

    const getTeams = async () => {
        const token = localStorage.getItem("access");

        try {
            const response = await axios.get("/api/teams/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            console.log(response.data);
            setTeams(response.data);
        } catch (error) {
            console.error("Failed to fetch teams:", error);
        } finally {
            setIsLoading(false); // Stop loading once the request is complete
        }
    };

    const filteredTeams = teams.filter((team) =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (team.looking_for &&
            team.looking_for.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="bg-gradient-to-br from-[#0a0a0a] via-[#141414] to-[#141414] rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto md:h-[90vh]">
  <h3 className="text-xl sm:text-2xl font-semibold text-white mb-4 text-center">All Teams</h3>

  <input
    type="text"
    placeholder="Search teams..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full p-2 sm:p-3 rounded-full text-sm sm:text-base text-white bg-[#1f1e24] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6556cd] transition-all duration-300"
  />

  {isLoading ? (
    // Animated Loader
    <div className="flex justify-center items-center h-48">
      <div className="flex space-x-2">
        <div className="w-4 h-4 bg-[#6556cd] rounded-full animate-bounce"></div>
        <div className="w-4 h-4 bg-[#6556cd] rounded-full animate-bounce delay-150"></div>
        <div className="w-4 h-4 bg-[#6556cd] rounded-full animate-bounce delay-300"></div>
      </div>
    </div>
  ) : filteredTeams.length > 0 ? (
    <ul className="mt-4 h-96 sm:h-[25rem] overflow-y-auto scrollbar-thin scrollbar-thumb-[#25232b] scrollbar-track-[#1f1e24] space-y-3 sm:space-y-4">
      {filteredTeams.map((team) => (
        <li
          key={team.id}
          className="bg-[#1f1e24] p-3 sm:p-4 rounded-2xl shadow-lg hover:shadow-xl hover:bg-[#25232b] transition-all duration-300"
        >
          <Link
            to={`/team/${team.id}`}
            state={{ team }}
            className="text-sm sm:text-base font-semibold text-white block"
          >
            {team.name} - Looking for: {team.looking_for || "Not specified"}
          </Link>
          {onSelectTeam && (
            <button
              onClick={() => onSelectTeam(team)}
              className="mt-2 bg-[#6556cd] text-white text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4 rounded-full hover:bg-[#5245b2] transition-all duration-300"
            >
              Select
            </button>
          )}
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-gray-500 text-center mt-4 text-sm sm:text-base">No teams found.</p>
  )}
</div>

    );
};

export default TeamList;