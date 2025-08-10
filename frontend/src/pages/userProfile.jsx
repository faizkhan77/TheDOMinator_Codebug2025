// src/pages/userProfile.jsx

import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";
import {
  FaGithub,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaGlobe,
} from "react-icons/fa"; // Import icons
import LoggedinNav from "../components/LoggedinNav";
import SkillAssessmentModal from "../components/SkillAssessmentModal";
import "./Scrollbar.css";
import Card from "../components/Card";
import AddProjectForm from "../components/AddProjectForm";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { id } = useParams(); // ✅ Get user ID from URL
  const loggedInUser = JSON.parse(localStorage.getItem("user")); // ✅ Get logged-in user
  const loggedInUserProfile = JSON.parse(localStorage.getItem("userProfile")); // ✅ Get logged-in user profile
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchdata = async () => {
      setIsLoading(true); // Start loading
      await fetchUserProfile();
      setIsLoading(false);
    };

    fetchdata();
  }, [id]);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("access");

    try {
      const response = await axios.get(`/api/users/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setUser(response.data.username);
      setProfile(response.data.profile);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleEditProfile = () => {
    navigate("/editprofile");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  const openModal = (skill) => setSelectedSkill(skill);
  const closeModal = () => setSelectedSkill(null);
  const startAssessment = (skill) => {
    setSelectedSkill(null);
    navigate(`/assessment/${skill.skill_name}`, {
      state: { skillId: skill.id },
    }); // Redirect to assessment page
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
        className={`p-6 min-h-screen transition-all duration-300 max-w-6xl mx-auto ${
          isSidebarOpen ? "md:ml-[20%]" : "md:ml-[10%]"
        }`}
      >
        {/* Breadcrumb */}
        <nav className="text-sm mb-6">
          <ol className="flex space-x-3 text-gray-400">
            <li>
              <Link to="/loggedinhome" className="hover:underline">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <span className="hover:underline">User</span>
            </li>
            <li>/</li>
            <li className="text-white">User Profile</li>
          </ol>
        </nav>

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="flex justify-center items-center h-[50vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white border-solid"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Card */}
              <div className="bg-[#141414] rounded-2xl shadow-lg p-6 w-full">
                <div className="flex flex-col items-center text-center">
                  <img
                    src={profile?.avatar}
                    alt="User Avatar"
                    className="rounded-full w-44 md:w-56 border-4 border-gray-500 mb-4 object-cover h-44 md:h-56"
                  />
                  <h4 className="text-2xl font-semibold text-white">
                    {profile?.full_name}
                  </h4>
                  <p className="text-gray-400 text-lg">{profile?.role}</p>
                  <p className="text-gray-500 text-sm">{profile?.location}</p>
                </div>

                {/* Edit Button */}
                {loggedInUser?.id === profile?.user && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={handleEditProfile}
                      className="bg-white text-black px-6 py-2 rounded-lg hover:bg-gray-300"
                    >
                      Edit Profile
                    </button>
                  </div>
                )}
              </div>

              {/* Profile Details */}
              <div className="bg-[#141414] rounded-2xl shadow-lg p-6 w-full">
                <h6 className="text-white text-lg font-semibold mb-4">
                  Profile Details
                </h6>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <h6 className="text-white">Full Name</h6>
                    <p className="text-gray-400">{profile?.full_name}</p>
                  </div>
                  <div className="flex justify-between">
                    <h6 className="text-white">Email</h6>
                    <p className="text-gray-400">{profile?.email}</p>
                  </div>
                  <div className="flex justify-between">
                    <h6 className="text-white">Location</h6>
                    <p className="text-gray-400">{profile?.location}</p>
                  </div>
                  <div className="flex justify-between">
                    <h6 className="text-white">Role</h6>
                    <p className="text-gray-400">{profile?.role}</p>
                  </div>

                  <div className="bg-[#0a0a0a] rounded-lg  p-4 mt-4 max-h-72 overflow-y-auto">
                    <h6 className="text-white text-lg font-semibold mb-3">
                      Skills
                    </h6>
                    {profile?.skills && profile.skills.length > 0 ? (
                      profile.skills.map((skill) => (
                        <div
                          key={skill.id}
                          className="flex bg-[#141414] justify-between items-center mb-2  p-2 rounded-md"
                        >
                          <span className="text-gray-300 ">
                            {skill.skill_name}
                          </span>
                          <div className="flex items-center space-x-2">
                            {skill.verified && (
                              <span className="flex items-center bg-[#FFD700] text-[#141414] text-xs font-semibold py-1 px-3 rounded-full">
                                <i className="fas fa-check-circle mr-2"></i>{" "}
                                Verified
                              </span>
                            )}
                            {loggedInUserProfile?.id === skill.user_profile &&
                              !skill.verified && (
                                <button
                                  onClick={() => openModal(skill)}
                                  className="bg-white text-[#0a0a0a] px-3 py-1 rounded hover:bg-[#e5e5e5]"
                                >
                                  Verify
                                </button>
                              )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400">No skills listed</p>
                    )}

                    {selectedSkill && (
                      <SkillAssessmentModal
                        selectedSkill={selectedSkill}
                        onClose={closeModal}
                        onStart={startAssessment}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-[#141414] rounded-2xl shadow-lg p-6 w-full">
                <h6 className="text-white text-lg font-semibold mb-4">
                  Social Links
                </h6>
                <ul className="space-y-4">
                  <li className="flex items-center text-white">
                    <FaGlobe className="mr-3 text-gray-400 text-xl" />
                    {profile?.portfolio ? (
                      <a
                        href={profile.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        Visit {profile.full_name}'s Website
                      </a>
                    ) : (
                      <span className="text-gray-400">Not provided</span>
                    )}
                  </li>
                  <li className="flex items-center text-white">
                    <FaGithub className="mr-3 text-gray-400 text-xl" />
                    {profile?.github ? (
                      <a
                        href={profile.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        Check {profile.full_name}'s GitHub
                      </a>
                    ) : (
                      <span className="text-gray-400">Not provided</span>
                    )}
                  </li>
                  <li className="flex items-center text-white">
                    <FaInstagram className="mr-3 text-gray-400 text-xl" />
                    {profile?.instagram ? (
                      <a
                        href={profile.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        Visit {profile.full_name}'s Instagram
                      </a>
                    ) : (
                      <span className="text-gray-400">Not provided</span>
                    )}
                  </li>
                  <li className="flex items-center text-white">
                    <FaLinkedin className="mr-3 text-gray-400 text-xl" />
                    {profile?.linkedin ? (
                      <a
                        href={profile.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        Connect with {profile.full_name} on LinkedIn
                      </a>
                    ) : (
                      <span className="text-gray-400">Not provided</span>
                    )}
                  </li>
                </ul>
              </div>

              {/* Bio & Experience */}
              <div className="bg-[#141414] rounded-2xl shadow-lg p-6 w-full">
                <h6 className="text-white text-lg font-semibold mb-4">Bio</h6>
                <p className="text-gray-400 whitespace-pre-line">
                  {profile?.bio || "No bio available"}
                </p>
                <h6 className="text-white text-lg font-semibold mt-4">
                  Experience
                </h6>
                <p className="text-gray-400 whitespace-pre-line">
                  {profile?.experience || "No experience details provided"}
                </p>
              </div>
            </div>

            {/* Projects Showcase - New Section */}
            <div className="bg-[#141414] rounded-2xl mt-4 shadow-lg p-6 w-full md:col-span-2 relative z-0">
              {/* === THIS IS THE CORRECTED SECTION === */}
              <div className="flex justify-between items-center mb-4">
                <h6 className="text-white text-lg font-semibold">
                  Projects Showcase
                </h6>

                {/* Conditionally render the button */}
                {loggedInUser?.id === profile?.user && (
                  <button
                    onClick={() => setIsOpen(true)}
                    className="bg-[#1f1f1f] text-white px-4 py-2 rounded-lg shadow-md hover:bg-[#292929] transition flex items-center gap-2"
                  >
                    <span className="text-sm font-medium">Add Project</span>
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      ></path>
                    </svg>
                  </button>
                )}
              </div>
              {/* === END OF CORRECTED SECTION === */}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.isArray(profile?.projects) &&
                profile.projects.length > 0 ? (
                  profile.projects
                    .filter((project) => project && project.title)
                    .map((project) => (
                      <Card key={project.id} project={project} />
                    ))
                ) : (
                  <p className="text-gray-500 text-center col-span-3">
                    No projects added
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {isOpen && (
          <AddProjectForm
            onClose={() => setIsOpen(false)}
            onProjectAdded={fetchUserProfile}
          />
        )}
      </div>
    </>
  );
};

export default UserProfile;
