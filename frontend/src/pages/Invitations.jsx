import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import LoggedinNav from "../components/LoggedinNav";

const Invitations = () => {
    const [invitations, setInvitations] = useState([]);
    const [joinRequests, setJoinRequests] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [currentTab, setCurrentTab] = useState("invitations"); // "invitations" or "joinRequests"
    const userProfile = JSON.parse(localStorage.getItem("userProfile")) || {};
    const userId = userProfile?.id; // Logged-in user ID
    const [isLoading, setIsLoading] = useState(true);
    const [acceptLoading, setAcceptLoading] = useState(false);
    const [rejectLoading, setRejectLoading] = useState(false);


    useEffect(() => {
        const fetchdata = async () => {
            setIsLoading(true);
            await fetchInvitations();
            await fetchJoinRequests();
            setIsLoading(false);
        }

        fetchdata()
    }, []);

    const fetchInvitations = async () => {
        const token = localStorage.getItem("access");

        try {
            const response = await axios.get("/api/invitations/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            // Filter only invitations sent to the logged-in user
            const receivedInvitations = response.data.filter(invite => invite.recipient.id === userProfile.user);
            setInvitations(receivedInvitations);
        } catch (error) {
            console.error("Failed to fetch invitations:", error);
        }
    };

    const fetchJoinRequests = async () => {
        const token = localStorage.getItem("access");

        try {
            const response = await axios.get("/api/join-requests/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            // Filter only join requests where the logged-in user is the admin of the team
            const filteredJoinRequests = response.data.filter(
                (joinReq) => joinReq.team.admin.id === userProfile.user
            );
            setJoinRequests(filteredJoinRequests);
        } catch (error) {
            console.error("Failed to fetch join requests:", error);
        }
    };

    const acceptInvitation = async (invite) => {
        setAcceptLoading(true);
        const token = localStorage.getItem("access");
        const updatedTeams = [...(JSON.parse(localStorage.getItem("myTeams")) || []), invite.team];

        try {
            await axios.post(`/api/invitations/${invite.id}/respond/`, {
                action: "accept"
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local storage
            localStorage.setItem("myTeams", JSON.stringify(updatedTeams));
            userProfile.teams = [...(userProfile.teams || []), invite.team.id];
            localStorage.setItem("userProfile", JSON.stringify(userProfile));

            // Remove accepted invitation from UI
            setInvitations(invitations.filter(i => i.id !== invite.id));
        } catch (error) {
            console.error("Failed to accept invitation:", error);
        }
        setAcceptLoading(false);
    };

    const rejectInvitation = async (inviteId) => {
        setRejectLoading(true);
        const token = localStorage.getItem("access");

        try {
            await axios.post(`/api/invitations/${inviteId}/respond/`, {
                action: "reject"
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Remove rejected invitation from UI
            setInvitations(invitations.filter(i => i.id !== inviteId));
        } catch (error) {
            console.error("Failed to reject invitation:", error);
        }
        setRejectLoading(false);
    };

    const acceptJoinRequest = async (joinRequest) => {
        setAcceptLoading(true);
        const token = localStorage.getItem("access");

        try {
            await axios.post(`/api/join-requests/${joinRequest.id}/respond/`, {
                action: "accept"
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Remove accepted join request from UI
            setJoinRequests(joinRequests.filter(req => req.id !== joinRequest.id));
        } catch (error) {
            console.error("Failed to accept join request:", error);
        }
        setAcceptLoading(false);
    };

    const rejectJoinRequest = async (joinRequestId) => {
        setRejectLoading(true);
        const token = localStorage.getItem("access");

        try {
            await axios.post(`/api/join-requests/${joinRequestId}/respond/`, {
                action: "reject"
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Remove rejected join request from UI
            setJoinRequests(joinRequests.filter(req => req.id !== joinRequestId));
        } catch (error) {
            console.error("Failed to reject join request:", error);
        }
        setRejectLoading(false);
    };

    console.log("INVITATION", userProfile)
    return (
        <>
            {/* Sidebar Component */}
            <div className="hidden md:flex">
                <Sidebar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
            </div>
            <LoggedinNav />

            <div className={`lg:px-8 px-4 py-6 transition-all duration-300 ${isSidebarOpen ? "md:ml-[20%]" : "md:ml-[10%]"}`} style={{ overflowY: "auto" }}>
                <h2 className="text-3xl font-semibold text-white mb-6">My Invitations & Join Requests</h2>

                <div className="mb-4">
                    <button
                        onClick={() => setCurrentTab("invitations")}
                        className={`px-6 py-2 rounded-lg ${currentTab === "invitations" ? "bg-blue-500 text-white" : "bg-gray-600 text-gray-200"}`}
                    >
                        Invitations
                    </button>
                    <button
                        onClick={() => setCurrentTab("joinRequests")}
                        className={`ml-4 px-6 py-2 rounded-lg ${currentTab === "joinRequests" ? "bg-blue-500 text-white" : "bg-gray-600 text-gray-200"}`}
                    >
                        Join Requests
                    </button>
                </div>

                {currentTab === "invitations" ? (
                    // Loading Spinner for Invitations
                    isLoading ? (
                        <div className="flex justify-center items-center h-[50vh]">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
                        </div>
                    ) : (
                        <>
                            {invitations.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto">
                                    {invitations.map((invite) => (
                                        <div key={invite.id} className="bg-[#141414] text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300">
                                            <h3 className="text-xl font-semibold mb-2">{invite.team.name}</h3>
                                            <p className="text-sm text-gray-400 mb-4">Invited by: {invite.sender.username}</p>
                                            <div className="flex justify-between">
                                                <button onClick={() => acceptInvitation(invite)} className="bg-white  px-4 py-2 rounded-lg text-black hover:bg-gray-600 transition">
                                                    {acceptLoading ? (
                                                        <div className="animate-spin w-6 h-6 border-4 border-t-transparent border-white rounded-full"></div>
                                                    ) : (
                                                        "Accept"
                                                    )}
                                                </button>
                                                <button onClick={() => rejectInvitation(invite.id)} className="bg-red-500 px-4 py-2 rounded-lg text-white hover:bg-red-600 transition">
                                                    {rejectLoading ? (
                                                        <div className="animate-spin w-6 h-6 border-4 border-t-transparent border-white rounded-full"></div>
                                                    ) : (
                                                        "Reject"
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-white">No invitations received.</p>
                            )}
                        </>
                    )
                ) : (
                    // Loading Spinner for Join Requests
                    isLoading ? (
                        <div className="flex justify-center items-center h-[50vh]">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
                        </div>
                    ) : (
                        <>
                            {joinRequests.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto">
                                    {joinRequests.map((joinRequest) => (
                                        <div key={joinRequest.id} className="bg-gray-800 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300">
                                            <h3 className="text-xl font-semibold mb-2">{joinRequest.team.name}</h3>
                                            <p className="text-sm text-gray-400 mb-4">Requested by: {joinRequest.user.username}</p>
                                            <div className="flex justify-between">
                                                <button onClick={() => acceptJoinRequest(joinRequest)} className="bg-green-500 px-4 py-2 rounded-lg text-white hover:bg-green-600 transition">
                                                    {acceptLoading ? (
                                                        <div className="animate-spin w-6 h-6 border-4 border-t-transparent border-white rounded-full"></div>
                                                    ) : (
                                                        "Accept"
                                                    )}
                                                </button>
                                                <button onClick={() => rejectJoinRequest(joinRequest.id)} className="bg-red-500 px-4 py-2 rounded-lg text-white hover:bg-red-600 transition">
                                                    {rejectLoading ? (
                                                        <div className="animate-spin w-6 h-6 border-4 border-t-transparent border-white rounded-full"></div>
                                                    ) : (
                                                        "Reject"
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-white">No join requests to manage.</p>
                            )}
                        </>
                    )
                )}

            </div>
        </>
    );
};


export default Invitations;
