import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";
import { FaGithub, FaFacebook, FaInstagram, FaLinkedin, FaGlobe } from "react-icons/fa"; // Import icons
import LoggedinNav from "../components/LoggedinNav";
import SkillAssessmentModal from "../components/SkillAssessmentModal";

const UserProfile = () => {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null);
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { id } = useParams(); // ✅ Get user ID from URL
    const loggedInUser = JSON.parse(localStorage.getItem("user")); // ✅ Get logged-in user
    const loggedInUserProfile = JSON.parse(localStorage.getItem("userProfile")); // ✅ Get logged-in user profile
    const [selectedSkill, setSelectedSkill] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchdata = async () => {
            setIsLoading(true); // Start loading
            await fetchUserProfile();
            setIsLoading(false);
        }

        fetchdata()
    }, [id]);

    const fetchUserProfile = async () => {
        const token = localStorage.getItem("access");

        try {
            const response = await axios.get(`/api/users/${id}/`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            setUser(response.data.username);
            setProfile(response.data.profile);

            // Reset profile in localStorage
            // localStorage.setItem("userProfile", JSON.stringify(response.data.profile));
            console.log("✅ userProfile updated in localStorage");
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

    // Function to toggle the sidebar visibility
    const toggleSidebar = () => {
        setIsSidebarOpen(prevState => !prevState);
    };

    console.log("loggedin user", loggedInUser?.id)
    console.log("profile", profile?.skills)


    const openModal = (skill) => setSelectedSkill(skill);
    const closeModal = () => setSelectedSkill(null);
    const startAssessment = (skill) => {
        setSelectedSkill(null);
        navigate(`/assessment/${skill.skill_name}`, { state: { skillId: skill.id } }); // Redirect to assessment page
    };

    return (
        <>
        <div className="hidden md:flex">
          <Sidebar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        </div>
        <div>
          <LoggedinNav />
        </div>
      
        <div className={`p-6 min-h-screen transition-all duration-300 max-w-6xl mx-auto ${isSidebarOpen ? "md:ml-[20%]" : "md:ml-[10%]"}`}>
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
                      className="rounded-full w-36 md:w-48 border-4 border-gray-500 mb-4"
                    />
                    <h4 className="text-2xl font-semibold text-white">{profile?.full_name}</h4>
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
                  <h6 className="text-white text-lg font-semibold mb-4">Profile Details</h6>
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
      
                    <div className="bg-[#0a0a0a] rounded-lg p-4 mt-4 max-h-48 overflow-y-auto">
                      <h6 className="text-white text-lg font-semibold mb-3">Skills</h6>
                      {profile?.skills && profile.skills.length > 0 ? (
                        profile.skills.map((skill) => (
                          <div key={skill.id} className="flex justify-between items-center mb-2 bg-gray-700 p-2 rounded-md">
                            <span className="text-gray-300">{skill.skill_name}</span>
                            <div className="flex items-center space-x-2">
                              {skill.verified && (
                                <span className="flex items-center bg-gray-500 text-white text-xs font-semibold py-1 px-3 rounded-full">
                                  <i className="fas fa-check-circle mr-2"></i> Verified
                                </span>
                              )}
                              {loggedInUserProfile?.id === skill.user_profile && !skill.verified && (
                                <button
                                  onClick={() => openModal(skill)}
                                  className="bg-white text-black px-3 py-1 rounded hover:bg-gray-300"
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
                        <SkillAssessmentModal selectedSkill={selectedSkill} onClose={closeModal} onStart={startAssessment} />
                      )}
                    </div>
                  </div>
                </div>
      
                {/* Social Links */}
                <div className="bg-[#141414] rounded-2xl shadow-lg p-6 w-full">
                  <h6 className="text-white text-lg font-semibold mb-4">Social Links</h6>
                  <ul className="space-y-4">
                    <li className="flex items-center text-white">
                      <FaGlobe className="mr-3 text-gray-400 text-xl" />
                      {profile?.portfolio ? (
                        <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          Visit {profile.full_name}'s Website
                        </a>
                      ) : (
                        <span className="text-gray-400">Not provided</span>
                      )}
                    </li>
                    <li className="flex items-center text-white">
                      <FaGithub className="mr-3 text-gray-400 text-xl" />
                      {profile?.github ? (
                        <a href={profile.github} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          Check {profile.full_name}'s GitHub
                        </a>
                      ) : (
                        <span className="text-gray-400">Not provided</span>
                      )}
                    </li>
                    <li className="flex items-center text-white">
                      <FaInstagram className="mr-3 text-gray-400 text-xl" />
                      {profile?.instagram ? (
                        <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          Visit {profile.full_name}'s Instagram
                        </a>
                      ) : (
                        <span className="text-gray-400">Not provided</span>
                      )}
                    </li>
                    <li className="flex items-center text-white">
                      <FaLinkedin className="mr-3 text-gray-400 text-xl" />
                      {profile?.linkedin ? (
                        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline">
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
                  <p className="text-gray-400 whitespace-pre-line">{profile?.bio || "No bio available"}</p>
                  <h6 className="text-white text-lg font-semibold mt-4">Experience</h6>
                  <p className="text-gray-400 whitespace-pre-line">{profile?.experience || "No experience details provided"}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </>
      

    );
};

export default UserProfile;
