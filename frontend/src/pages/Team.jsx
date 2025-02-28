import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import LoggedinNav from "../components/LoggedinNav";

const Team = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const team = location.state?.team;

    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    const profile = JSON.parse(localStorage.getItem("userProfile"));
    const userId = loggedInUser?.id;
    const [btnloading, btnsetLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const [members, setMembers] = useState(team.members || []);

    if (!team) {
        return <p>No team data found.</p>;
    }

    const updateLocalStorageTeams = (updatedTeam) => {
        let teams = JSON.parse(localStorage.getItem("teams")) || [];

        // Replace the updated team in the stored teams array
        teams = teams.map((t) => (t.id === updatedTeam.id ? updatedTeam : t));

        localStorage.setItem("teams", JSON.stringify(teams));
    };

    // Update activities in localStorage
    const addActivity = (message, teamId) => {
        let activities = JSON.parse(localStorage.getItem("activities")) || [];
        const activity = { message, teamId, timestamp: new Date().toISOString() }; // Include teamId and timestamp
        activities.unshift(activity); // Add latest activity at the top
        localStorage.setItem("activities", JSON.stringify(activities));
    };

    const handleJoinTeam = async () => {
        if (team.team_type === "PRIVATE") {
            setShowModal(true); // Show modal for private teams
            return;
        }

        btnsetLoading(true);
        const token = localStorage.getItem("access");
        if (!token) {
            console.error("No access token found.");
            alert("You must be logged in to join a team.");
            btnsetLoading(false);
            return;
        }

        try {
            if (team.team_type === "PUBLIC") {
                // Directly join public teams
                await joinPublicTeam();
                alert("You have successfully joined the team!");
            } else {
                // Send a join request for private teams (this won't be reached due to early return above)
                await sendJoinRequest();
                alert("Join request sent. Please wait for admin approval.");
            }
        } catch (error) {
            console.error("Error joining team:", error.response?.data || error.message);
            alert("Failed to join the team. Please try again.");
        }

        
        btnsetLoading(false);
    };

    const joinPublicTeam = async () => {
        const token = localStorage.getItem("access");
        const userId = JSON.parse(localStorage.getItem("user"))?.id; // ✅ Get user ID from local storage
    
        if (!token || !userId) {
            alert("User not authenticated. Please log in again.");
            return;
        }
    
        try {
            // ✅ Send request to join the public team
            await axios.post(
                `/api/teams/${team.id}/join/`, 
                {}, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            // ✅ Fetch updated user profile (includes new team in "teams[]")
            await fetchUserProfile(token, userId);
    
            // ✅ Fetch and update teams after joining
            await fetchAndUpdateMyTeams();
    
            alert("You have successfully joined the team!");
        } catch (error) {
            console.error("Failed to join public team:", error.response?.data || error.message);
            alert(error.response?.data?.detail || "Failed to join the team. Please try again.");
        }
    };
    
    
    

    const sendJoinRequest = async () => {
        const token = localStorage.getItem("access");

        try {
            // Sending the join request to the backend
            await axios.post(
                `/api/join-requests/`,  // Correct endpoint for join request
                { team_id: team.id },    // Ensure the team_id is passed
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Alert user about the request being sent
            alert("Join request sent. Please wait for admin approval.");
            setShowModal(false);
        } catch (error) {
            console.error("Failed to send join request:", error.response?.data || error.message);
            alert("Failed to send join request. Please try again.");
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
                teams: profile.teams.filter((teamId) => teamId !== team.id)
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
            console.error("Error leaving team:", error.response?.data || error.message);
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

        console.log("kicked member's username", memberUsername)

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
                    ? { ...t, members: t.members.filter((member) => member.id !== memberId) }
                    : t
            );

            // Save updated myTeams back to localStorage
            localStorage.setItem("myTeams", JSON.stringify(updatedMyTeams));

            // Add activity log for kicking
            addActivity(`${memberUsername} was kicked from ${team.name} by ${loggedInUser.username}`, team.id);

        } catch (error) {
            console.error("Error kicking member:", error.response?.data || error.message);
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

    console.warn("team data", team)
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
                className={`text-white min-h-screen py-10 px-5 sm:px-10 lg:px-20 transition-all duration-300 ${isSidebarOpen ? "md:ml-[15%]" : "md:ml-[1%]"}`}

            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Team Info Card */}
                    <div className="bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 mb-10">
                        <h1 className="text-3xl sm:text-4xl font-bold mb-4">{team.name}
                            {team.admin.id === loggedInUser.id && (
                                <button
                                    onClick={() => navigate(`/team/edit/${team.id}`, { state: { team } })}
                                    className="ml-4 bg-green-600 text-white px-6 py-2 rounded-md shadow-lg hover:bg-green-700 transition duration-300"
                                >
                                    Edit Team
                                </button>
                            )}
                        </h1>
                        <p className="text-xl text-gray-400 mb-6">{team.description}</p>

                        {team.project_idea && (
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold mb-2">Project Idea</h3>
                                <p>{team.project_idea}</p>
                            </div>
                        )}

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">Looking For</h3>
                            <p>{team.looking_for}</p>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">Team Type</h3>
                            <p>{team.team_type}</p>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">Created On</h3>
                            <p>{getTimeAgo(team.created)}</p>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-2">Last Updated</h3>
                            <p>{getTimeAgo(team.updated)}</p>
                        </div>
                    </div>

                    {/* Members Section */}
                    <div className="mt-10">
                        <h3 className="text-3xl sm:text-4xl font-semibold mb-4">
                            Team Members ({members.length}/{team.members_limit})
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {members.map((member) => (
                                <div
                                    key={member.id}
                                    className="bg-gray-800 text-white p-6 rounded-lg shadow-lg transform transition hover:scale-105 cursor-pointer"
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center mb-4">
                                            {member.profile?.avatar ? (
                                                <img
                                                    src={member.profile.avatar || "/avatar.svg"}
                                                    alt={member.username}
                                                    className="rounded-full w-full h-full object-cover"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = "/default-avatar.png"; }}
                                                />
                                            ) : (
                                                <span className="text-2xl font-semibold">
                                                    {member.username[0]}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xl font-bold mb-2">@{member.username}</p>
                                        <p className="text-gray-400 mb-4">{member.id === team.admin.id ? "Admin" : member.profile?.role || "Member"}</p>

                                        {/* Kick Button: Only if the logged-in user is admin & the member is NOT the admin */}
                                        {isAdmin && member.id !== team.admin.id && (
                                            <button
                                                onClick={() => handleKickMember(member.id)}
                                                className="bg-red-600 text-white px-4 py-2 rounded-md shadow-lg hover:bg-red-700 transition duration-300"
                                            >
                                                {btnloading ? (
                                                    <div className="animate-spin w-6 h-6 border-4 border-t-transparent border-white rounded-full"></div>
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
                    <div className="mt-10 flex flex-wrap gap-4">
                        {isAdmin ? (
                            <p className="text-red-400">Admins cannot leave.</p>
                        ) : isMember ? (
                            <button onClick={handleLeaveTeam} className="bg-red-600 text-white px-6 py-2 rounded-md shadow-lg hover:bg-red-700 transition duration-300">
                                {btnloading ? (
                                    <div className="animate-spin w-6 h-6 border-4 border-t-transparent border-white rounded-full"></div>
                                ) : (
                                    "Leave Team"
                                )}
                            </button>
                        ) : isFull ? (
                            <p className="text-red-400">Team is full.</p>
                        ) : (
                            <button onClick={handleJoinTeam} className="bg-green-600 text-white px-6 py-2 rounded-md shadow-lg hover:bg-green-700 transition duration-300">
                                {btnloading ? (
                                    <div className="animate-spin w-6 h-6 border-4 border-t-transparent border-white rounded-full"></div>
                                ) : (
                                    "Join Team"
                                )}
                            </button>
                        )}
                        {showModal && (
                            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
                                    <h2 className="text-xl font-semibold text-white mb-4">Private Team</h2>
                                    <p className="text-white mb-4">This team is private. You need to send a join request and wait for approval.</p>
                                    <button
                                        onClick={sendJoinRequest}
                                        className="bg-green-600 text-white px-6 py-2 rounded-md shadow-lg hover:bg-green-700 transition duration-300"
                                    >
                                        Send Join Request
                                    </button>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="ml-4 bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition duration-300"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}



                        {isMember && (
                            <button onClick={goToChat} className="bg-blue-600 text-white px-6 py-2 rounded-md shadow-lg hover:bg-blue-700 transition duration-300">
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
