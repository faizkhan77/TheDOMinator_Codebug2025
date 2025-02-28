import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import LoggedinNav from "../components/LoggedinNav";

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [myTeams, setMyTeams] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchdata = async () => {
            setIsLoading(true); // Start loading
            await fetchUsers();
            await loadMyTeams();
            setIsLoading(false); // Stop loading after data is fetched
        }

        fetchdata()
    }, []);

    const fetchUsers = async () => {
        const token = localStorage.getItem("access");

        try {
            const response = await axios.get("/api/users/", {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            setUsers(response.data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
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
                    recipient_id: selectedUser.id,
                    team_id: teamId,
                },
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            alert(`Invitation sent to ${selectedUser.profile.full_name} for team ${teamId}`);
            closeModal();
        } catch (error) {
            console.error("Failed to send invitation:", error);
            alert("Failed to send invitation. Please try again.");
        }
    };

    const filteredUsers = users.filter((user) => {
        const query = searchQuery.toLowerCase();

        return (
            user.username.toLowerCase().includes(query) ||
            (user.profile?.full_name && user.profile.full_name.toLowerCase().includes(query)) ||
            (user.profile?.role && user.profile.role.toLowerCase().includes(query)) ||
            (user.profile?.skills && user.profile.skills.some(skill => skill.skill_name.toLowerCase().includes(query)))
        );
    });



    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen((prevState) => !prevState);
    };

    console.log("users", users)

    return (
        <>
            <div className="hidden md:flex">
                <Sidebar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
            </div>
            <div>
                <LoggedinNav />
            </div>

            {/* Main container */}
            <div
                className={`lg:px-8 px-6 py-6 transition-all ${isSidebarOpen ? "md:ml-[20%]" : "md:ml-[5%]"
                    } duration-300 w-full mx-auto md:w-full lg:w-3/4`}
                style={{ height: "100vh", overflow: "hidden" }}
            >
                <h2 className="text-3xl font-semibold text-white mb-6">Users List</h2>

                <input
                    type="text"
                    placeholder="Search users by name, role, or skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 mb-4 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition duration-300"
                />

                {/* Loading Spinner */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-[50vh]">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
                    </div>
                ) : (
                    <>
                        {/* Scrollable User List */}
                        <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 180px)" }}>
                            {filteredUsers.length > 0 ? (
                                <ul className="list-none p-0">
                                    {filteredUsers.map((user) => (
                                        <li
                                            key={user.id}
                                            className="flex justify-between items-center p-4 mb-4 bg-gray-800 rounded-lg shadow-lg transition duration-300"
                                        >
                                            <div className="flex items-center cursor-pointer" onClick={() => navigate(`/user/${user.id}`)}>
                                                <img
                                                    src={user.profile?.avatar}
                                                    alt="Avatar"
                                                    className="w-12 h-12 rounded-full mr-4"
                                                />
                                                <div>
                                                    <h4 className="text-xl font-semibold text-white">
                                                        {user.profile?.full_name} ({user.username})
                                                    </h4>
                                                    <p className="text-sm text-gray-400">Role: {user.profile?.role}</p>
                                                    <p className="text-sm text-gray-400">
                                                        Skills: {user.profile?.skills?.map(skill => skill.skill_name).join(", ")}
                                                    </p>
                                                </div>

                                            </div>
                                            <button
                                                onClick={() => openInviteModal(user)}
                                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                                            >
                                                Invite
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-white">No users found.</p>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-96">
                        <h3 className="text-xl font-semibold text-white mb-4">
                            Invite {selectedUser.profile.full_name} to a Team
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

export default UsersList;
