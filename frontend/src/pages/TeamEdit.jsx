// src/pages/TeamEdit.jsx

import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import LoggedinNav from "../components/LoggedinNav";

const TeamEdit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const team = location.state?.team; // If editing, this will contain team data
  const token = localStorage.getItem("access");
  const [btnloading, btnsetLoading] = useState(false);

  // --- CORRECTED formData STATE ---
  // We REMOVE admin and members. The backend handles setting them on creation.
  // We provide a valid default for team_type.
  const [formData, setFormData] = useState({
    name: team?.name || "",
    description: team?.description || "",
    project_idea: team?.project_idea || "",
    looking_for: team?.looking_for || "",
    members_limit: team?.members_limit || 5,
    team_type: team?.team_type || "PUBLIC", // Set a valid default
  });

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
          formData, // Sends the simplified, correct data
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        // If creating a new team
        response = await axios.post(
          "/api/teams/",
          formData, // Sends the simplified, correct data
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const newTeamId = response.data.id;

        // Update userProfile in localStorage
        const storedProfile =
          JSON.parse(localStorage.getItem("userProfile")) || {};
        const updatedProfile = {
          ...storedProfile,
          teams: storedProfile.teams
            ? [...storedProfile.teams, newTeamId]
            : [newTeamId],
        };
        localStorage.setItem("userProfile", JSON.stringify(updatedProfile));

        // Send update request to backend to sync the user's profile
        await axios.patch(
          `/api/profiles/${storedProfile.id}/`,
          { teams: updatedProfile.teams },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      navigate(`/team/${response.data.id}`, { state: { team: response.data } });
    } catch (error) {
      // Log the detailed error from the backend for easier debugging
      console.error(
        "Error saving team:",
        error.response?.data || error.message
      );
      alert(`Failed to save team: ${JSON.stringify(error.response?.data)}`);
    }

    btnsetLoading(false);
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <div className="w-full">
          <LoggedinNav />
        </div>

        <div className="flex flex-1">
          <div className="hidden md:block fixed h-full">
            <Sidebar
              toggleSidebar={toggleSidebar}
              isSidebarOpen={isSidebarOpen}
            />
          </div>

          <div className="flex-1 flex items-center justify-center p-4 transition-all duration-300 md:ml-[10%] lg:ml-[20%]">
            <div className="w-full max-w-2xl bg-[#141414] rounded-lg shadow-xl p-6 text-gray-200">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 text-center">
                {team ? "Edit Team" : "Create Team"}
              </h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium">
                      Name:
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-[#0a0a0a] text-gray-200 rounded-lg focus:ring-2 focus:ring-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="looking_for"
                      className="block text-sm font-medium"
                    >
                      Looking For:
                    </label>
                    <input
                      type="text"
                      name="looking_for"
                      id="looking_for"
                      value={formData.looking_for}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-[#0a0a0a] text-gray-200 rounded-lg focus:ring-2 focus:ring-white focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium"
                  >
                    Description:
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-[#0a0a0a] text-gray-200 rounded-lg focus:ring-2 focus:ring-white focus:outline-none min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="project_idea"
                    className="block text-sm font-medium"
                  >
                    Project Idea:
                  </label>
                  <textarea
                    name="project_idea"
                    id="project_idea"
                    value={formData.project_idea}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-[#0a0a0a] text-gray-200 rounded-lg focus:ring-2 focus:ring-white focus:outline-none min-h-[100px]"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="team_type"
                      className="block text-sm font-medium"
                    >
                      Team Type:
                    </label>
                    <select
                      name="team_type"
                      id="team_type"
                      value={formData.team_type}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-[#0a0a0a] text-gray-200 rounded-lg focus:ring-2 focus:ring-white focus:outline-none"
                    >
                      <option value="PUBLIC">Public</option>
                      <option value="PRIVATE">Private</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="members_limit"
                      className="block text-sm font-medium"
                    >
                      Members Limit:
                    </label>
                    <input
                      type="number"
                      name="members_limit"
                      id="members_limit"
                      value={formData.members_limit}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-4 py-2 bg-[#0a0a0a] text-gray-200 rounded-lg focus:ring-2 focus:ring-white focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-white hover:bg-gray-400 text-black font-bold py-2 rounded-lg shadow-md transition-all duration-300 flex justify-center items-center"
                >
                  {btnloading ? (
                    <div className="animate-spin w-6 h-6 border-4 border-t-transparent border-white rounded-full"></div>
                  ) : team ? (
                    "Save Changes"
                  ) : (
                    "Create Team"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TeamEdit;
