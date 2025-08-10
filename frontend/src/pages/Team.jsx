import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import LoggedinNav from "../components/LoggedinNav";
import { useAuth } from "../AuthContext";

const Team = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const team = location.state?.team;

  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const profile = JSON.parse(localStorage.getItem("userProfile"));
  const userId = loggedInUser?.id;
  const [btnloading, btnsetLoading] = useState(false);
  const { fetchUserProfile } = useAuth();
  const [showModal, setShowModal] = useState(false);

  // ✅ Use optional chaining to prevent errors
  const [members, setMembers] = useState(
    Array.isArray(team?.members) ? team.members : []
  );

  useEffect(() => {
    if (team?.members) {
      setMembers(team.members);
    }
  }, []);

  const updateLocalStorageTeams = (updatedTeam) => {
    let teams = JSON.parse(localStorage.getItem("teams")) || [];
    teams = teams.map((t) =>
      t.id === updatedTeam.id
        ? { ...updatedTeam, members: updatedTeam.members || [] }
        : t
    );
    localStorage.setItem("teams", JSON.stringify(teams));
  };

  const addActivity = (message, teamId) => {
    let activities = JSON.parse(localStorage.getItem("activities")) || [];
    const activity = { message, teamId, timestamp: new Date().toISOString() };
    activities.unshift(activity);
    localStorage.setItem("activities", JSON.stringify(activities));
  };

  const handleJoinTeam = async () => {
    if (team.team_type === "PRIVATE") {
      setShowModal(true);
      return;
    }

    btnsetLoading(true);
    const token = localStorage.getItem("access");
    const userId = JSON.parse(localStorage.getItem("user"))?.id;

    if (!token || !userId) {
      console.error("No access token found.");
      alert("You must be logged in to join a team.");
      btnsetLoading(false);
      return;
    }

    try {
      if (team.team_type === "PUBLIC") {
        await axios.post(
          `/api/teams/${team.id}/join/`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // ✅ Avoid directly modifying the team object
        const updatedTeam = {
          ...team,
          members: [...(team.members || []), { id: userId }],
        };
        updateLocalStorageTeams(updatedTeam);
        setMembers(updatedTeam.members);

        // ✅ Fetch latest user profile to ensure proper re-render
        await fetchUserProfile(token, userId);

        setTimeout(() => {
          alert("You have successfully joined the team!");
        }, 500);
      } else {
        await axios.post(
          `/api/join-requests/`,
          { team_id: team.id },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        alert("Join request sent. Please wait for admin approval.");
      }
    } catch (error) {
      console.error(
        "Error joining team:",
        error.response?.data || error.message
      );
      alert("Failed to join the team. Please try again.");
    }

    btnsetLoading(false);
  };

  const joinPublicTeam = async () => {
    const token = localStorage.getItem("access");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user?.id) {
      alert("User not authenticated. Please log in again.");
      return;
    }

    try {
      await axios.post(
        `/api/teams/${team.id}/join/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedMembers = [...members, { id: user.id, name: user.name }];
      setMembers(updatedMembers);

      const updatedTeam = { ...team, members: updatedMembers };
      updateLocalStorageTeams(updatedTeam);

      setTimeout(() => {
        alert("You have successfully joined the team!");
      }, 500);
    } catch (error) {
      console.error(
        "Failed to join public team:",
        error.response?.data || error.message
      );
      alert(
        error.response?.data?.detail ||
          "Failed to join the team. Please try again."
      );
    }
  };

  const sendJoinRequest = async () => {
    const token = localStorage.getItem("access");

    try {
      // Change `team_id` to `team` to match the new serializer
      await axios.post(
        `/api/join-requests/`,
        { team: team.id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Join request sent. Please wait for admin approval.");
      setShowModal(false);
    } catch (error) {
      // The new error messages from the backend will be more descriptive
      const errorDetail =
        error.response?.data?.detail ||
        "Failed to send join request. Please try again.";
      console.error(
        "Failed to send join request:",
        error.response?.data || error.message
      );
      alert(errorDetail);
    }
  };

  const handleLeaveTeam = async () => {
    btnsetLoading(true);
    const token = localStorage.getItem("access");
    if (!token) {
      console.error("No access token found.");
      return;
    }

    try {
      await axios.post(
        `/api/teams/${team.id}/leave/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove the user from the members list
      setMembers(members.filter((member) => member.id !== userId));

      // Remove the team ID from the user's profile in localStorage
      const updatedProfile = {
        ...profile,
        teams: profile.teams.filter((teamId) => teamId !== team.id),
      };
      localStorage.setItem("userProfile", JSON.stringify(updatedProfile));

      // Send request to update the backend profile
      await axios.patch(
        `/api/profiles/${profile.id}/`,
        { teams: updatedProfile.teams },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Add activity log
      addActivity(`${loggedInUser.username} left ${team.name}`, team.id);
    } catch (error) {
      console.error(
        "Error leaving team:",
        error.response?.data || error.message
      );
    }
    btnsetLoading(false);
  };

  const handleKickMember = async (memberId) => {
    btnsetLoading(true);
    const token = localStorage.getItem("access");
    if (!token) {
      console.error("No access token found.");
      return;
    }

    console.log(`Kicking member with ID: ${memberId} from team ${team.id}`);

    // Find the member's username before kicking them
    const kickedMember = members.find((member) => member.id === memberId);
    const memberUsername = kickedMember ? kickedMember.username : "Unknown";

    console.log("kicked member's username", memberUsername);

    try {
      // Sending the request to kick the member
      await axios.post(
        `/api/teams/${team.id}/kick/`,
        { memberId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove the kicked member from the members list
      setMembers(members.filter((member) => member.id !== memberId));

      // Update myTeams in localStorage
      const myTeams = JSON.parse(localStorage.getItem("myTeams")) || [];

      // Update the specific team in myTeams
      const updatedMyTeams = myTeams.map((t) =>
        t.id === team.id
          ? {
              ...t,
              members: t.members.filter((member) => member.id !== memberId),
            }
          : t
      );

      // Save updated myTeams back to localStorage
      localStorage.setItem("myTeams", JSON.stringify(updatedMyTeams));

      // Add activity log for kicking
      addActivity(
        `${memberUsername} was kicked from ${team.name} by ${loggedInUser.username}`,
        team.id
      );
    } catch (error) {
      console.error(
        "Error kicking member:",
        error.response?.data || error.message
      );
    }
    btnsetLoading(false);
  };

  const goToChat = () => {
    if (team.chatroom_id) {
      navigate(`/chat/${team.chatroom_id}`, { state: { team } });
    } else {
      console.error("Chatroom ID not found for this team.");
    }
  };

  const isMember = members.some((member) => member.id === userId);
  const isFull = members.length >= team.members_limit;
  const isAdmin = team.admin.id === userId;

  console.warn("team data", team);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar toggle state

  // Function to toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
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
      <div className="hidden md:flex">
        <Sidebar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      </div>
      <LoggedinNav />
      <div
        className={`text-white min-h-screen py-10 px-5 sm:px-10 lg:px-20 transition-all duration-300 ${
          isSidebarOpen ? "md:ml-[15%]" : "md:ml-[1%]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-[#0a0a0a] text-white">
          {/* Team Info Card */}
          <div className="bg-[#141414] rounded-xl shadow-2xl p-6 sm:p-8 mb-10 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {team.name}
              </h1>
              {team.admin.id === loggedInUser.id && (
                <button
                  onClick={() =>
                    navigate(`/team/edit/${team.id}`, { state: { team } })
                  }
                  className="mt-4 sm:mt-0 bg-green-600 text-white px-6 py-2 rounded-full font-medium hover:bg-green-700 transition duration-300 shadow-md"
                >
                  Edit Team
                </button>
              )}
            </div>
            <p className="text-lg text-gray-300 mb-6 leading-relaxed">
              {team.description}
            </p>

            {team.project_idea && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">
                  Project Idea
                </h3>
                <p className="text-gray-300">{team.project_idea}</p>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">
                Looking For
              </h3>
              <p className="text-gray-300">{team.looking_for}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">
                Team Type
              </h3>
              <p className="text-gray-300">{team.team_type}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Created On
                </h3>
                <p className="text-gray-300">{getTimeAgo(team.created)}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Last Updated
                </h3>
                <p className="text-gray-300">{getTimeAgo(team.updated)}</p>
              </div>
            </div>
          </div>

          {/* Members Section */}
          <div className="mt-12">
            <h3 className="text-3xl sm:text-4xl font-extrabold mb-6 tracking-tight">
              Team Members ({members.length}/{team.members_limit})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="bg-[#141414] p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mb-4 overflow-hidden">
                      {member.profile?.avatar ? (
                        <img
                          src={member.profile.avatar || "/avatar.svg"}
                          alt={member.username}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/default-avatar.png";
                          }}
                        />
                      ) : (
                        <span className="text-3xl font-bold text-white">
                          {member.username[0]}
                        </span>
                      )}
                    </div>

                    <p className="text-xl font-bold mb-2">@{member.username}</p>
                    <p className="text-gray-400 mb-4">
                      {member.id === team.admin.id
                        ? "Admin"
                        : member.profile?.role || "Member"}
                    </p>

                    {isAdmin && member.id !== team.admin.id && (
                      <button
                        onClick={() => handleKickMember(member.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-full font-medium shadow-md hover:bg-red-700 transition duration-300"
                      >
                        {btnloading ? (
                          <div className="animate-spin w-5 h-5 border-4 border-t-transparent border-white rounded-full"></div>
                        ) : (
                          "Kick"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-12 flex flex-wrap gap-4">
            {isAdmin ? (
              <p className="text-red-400 font-medium">Admins cannot leave.</p>
            ) : isMember ? (
              <button
                onClick={handleLeaveTeam}
                className="bg-red-600 text-white px-6 py-2 rounded-full font-medium shadow-md hover:bg-red-700 transition duration-300"
              >
                {btnloading ? (
                  <div className="animate-spin w-5 h-5 border-4 border-t-transparent border-white rounded-full"></div>
                ) : (
                  "Leave Team"
                )}
              </button>
            ) : isFull ? (
              <p className="text-red-400 font-medium">Team is full.</p>
            ) : (
              <button
                onClick={handleJoinTeam}
                className="bg-green-600 text-white px-6 py-2 rounded-full font-medium shadow-md hover:bg-green-700 transition duration-300"
              >
                {btnloading ? (
                  <div className="animate-spin w-5 h-5 border-4 border-t-transparent border-white rounded-full"></div>
                ) : (
                  "Join Team"
                )}
              </button>
            )}

            {showModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
                <div className="bg-[#141414] p-8 rounded-xl shadow-2xl text-center max-w-md w-full">
                  <h2 className="text-2xl font-semibold text-white mb-4">
                    Private Team
                  </h2>
                  <p className="text-gray-300 mb-6">
                    This team is private. You need to send a join request and
                    wait for approval.
                  </p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={sendJoinRequest}
                      className="bg-green-600 text-white px-6 py-2 rounded-full font-medium shadow-md hover:bg-green-700 transition duration-300"
                    >
                      Send Join Request
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="bg-gray-500 text-white px-6 py-2 rounded-full font-medium shadow-md hover:bg-gray-600 transition duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isMember && (
              <button
                onClick={goToChat}
                className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium shadow-md hover:bg-blue-700 transition duration-300"
              >
                Chat
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Team;
