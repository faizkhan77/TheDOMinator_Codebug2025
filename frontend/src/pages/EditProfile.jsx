import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../AuthContext";
import Sidebar from "../components/Sidebar";
import { FaGithub, FaLinkedin, FaInstagram, FaFacebook, FaEnvelope, FaLink, FaMapMarkerAlt } from "react-icons/fa";
import LoggedinNav from "../components/LoggedinNav";

const EditProfile = () => {
    const [profile, setProfile] = useState(null);
    const [profileData, setProfileData] = useState({
        user: "",
        full_name: "",
        role: "",
        skills: "",
        experience: "",
        github: "",
        linkedin: "",
        instagram: "",
        portfolio: "",
        teams: [],  // Initialize teams as an empty array
        email: "",
        bio: "",
        location: ""
    });
    const [newAvatar, setNewAvatar] = useState(null); // For handling new avatar uploads
    const navigate = useNavigate();
    const { accessToken } = useAuth(); // Access token for authorization
    const [errors, setErrors] = useState({});
    const [btnloading, btnsetLoading] = useState(false);

    useEffect(() => {
        // ✅ Load profile data from localStorage
        const storedProfile = localStorage.getItem("userProfile");
        if (storedProfile) {
            const parsedProfile = JSON.parse(storedProfile);

            setProfile(parsedProfile);

            setProfileData({
                user: parsedProfile.user,
                full_name: parsedProfile.full_name,
                role: parsedProfile.role,
                skills: parsedProfile.skills ? parsedProfile.skills.map(skill => skill.skill_name).join(", ") : "", // Convert array to string
                experience: parsedProfile.experience,
                github: parsedProfile.github,
                linkedin: parsedProfile.linkedin,
                instagram: parsedProfile.instagram,
                portfolio: parsedProfile.portfolio,
                email: parsedProfile.email,
                location: parsedProfile.location,
                bio: parsedProfile.bio,
                teams: parsedProfile.teams || [], // Ensure teams is always an array
            });
        }
    }, []);

    const handleChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e) => {
        setNewAvatar(e.target.files[0]); // Capture new avatar file
    };

    const validateURLs = () => {
        const newErrors = {};
        const urlFields = ["github", "linkedin", "instagram", "portfolio"];

        urlFields.forEach((field) => {
            const value = profileData[field];
            if (value && !value.startsWith("https://")) {
                newErrors[field] = "URL must start with https://";
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };


    const handleSaveProfile = async (e) => {
        e.preventDefault();

        btnsetLoading(true); // Set the loading state to true when submitting

        if (!validateURLs()) {
            return;
        }

        try {

            const formData = new FormData();

            // Append profile data to the FormData object
            formData.append("user", profileData.user);
            formData.append("full_name", profileData.full_name);
            formData.append("role", profileData.role);
            formData.append("experience", profileData.experience);
            formData.append("github", profileData.github);
            formData.append("linkedin", profileData.linkedin);
            formData.append("instagram", profileData.instagram);
            formData.append("portfolio", profileData.portfolio);
            formData.append("email", profileData.email);
            formData.append("bio", profileData.bio);
            formData.append("location", profileData.location);

            // If a new avatar is provided, append it to the FormData object
            if (newAvatar) {
                formData.append("avatar", newAvatar); // Append new avatar if changed
            }

            // Ensure teams field is not null by passing an empty array if no teams are selected
            (profileData.teams || []).forEach((teamId) => {
                formData.append("teams", teamId);  // Add each team ID to FormData
            });


            // 🔹 Step 1: Update the Profile First
            const profileResponse = await axios.put(
                `/api/profiles/${profile.id}/`,
                formData,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );


            console.log("✅ Profile Updated Successfully", profileResponse.data);

            // 🔹 Step 2: Handle Skills Update
            const storedSkills = profile.skills.map(skill => skill.skill_name);

            // Convert input string into array, remove duplicates & spaces
            const enteredSkills = Array.from(
                new Set(
                    profileData.skills
                        .split(",")
                        .map(skill => skill.trim())
                        .filter(skill => skill)
                )
            );

            // Find new skills to add
            const newSkills = enteredSkills.filter(skill => !storedSkills.includes(skill));

            // Find skills to remove
            const removedSkills = storedSkills.filter(skill => !enteredSkills.includes(skill));

            // const requests = [];

            console.log("STORED SKILLS", storedSkills)
            console.log("ENTERED SKILLS", enteredSkills)
            console.log("NEW SKILLS", newSkills)


            // 🔹 Step 3: Send New Skills (Only if new skills exist)
            if (newSkills.length > 0) {
                const formattedSkills = newSkills.map(skill => skill); // Just use skill names as strings

                console.log("FORMATTED SKILLS", formattedSkills)

                await axios.post(
                    `/api/profiles/${profile.id}/add_skills/`,
                    { skills: formattedSkills }, // Send the correctly formatted skills
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                );

                console.log("✅ New Skills Added:", formattedSkills);
            }


            // 🔹 Step 4: Remove Skills that are no longer in the list
            if (removedSkills.length > 0) {
                for (let skill of removedSkills) {
                    const skillToRemove = profile.skills.find(s => s.skill_name === skill);

                    // Debugging the skillToRemove
                    console.log("Skill to remove:", skillToRemove);

                    if (skillToRemove) {
                        await axios.delete(
                            `/api/skills/${skillToRemove.id}/delete_skill/`,
                            { headers: { Authorization: `Bearer ${accessToken}` } }
                        );

                        console.log("❌ Removed Skill:", skill);
                    }
                }
            }

            // // // 🔹 Step 5: Update localStorage with new profile data
            fetchUserProfile()
            // const updatedProfile = {
            //     ...profileResponse.data,
            //     skills: [...profileResponse.data.skills, ...newSkills], // Add new skills to existing ones
            // };

            // localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
            // console.log("UPDATED PROFILE", updatedProfile)
            // console.log("✅ Profile and Skills updated in localStorage");


            console.log("✅ Profile Update Complete!");
            navigate(-1);
        } catch (err) {
            console.error("🔹 Error Response:", err.response?.data || err.message);
        }

        btnsetLoading(false); // Set loading state back to false when done
    };


    const fetchUserProfile = async () => {
        const token = localStorage.getItem("access");

        try {
            const response = await axios.get(`/api/users/${profile.id}/`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            // Reset profile in localStorage
            localStorage.setItem("userProfile", JSON.stringify(response.data.profile));
            console.log("✅ userProfile updated in localStorage");
        } catch (error) {
            console.error("Failed to fetch user profile:", error);
        }
    };



    // console.log("profile", profile)

    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar state
    const toggleSidebar = () => {
        setIsSidebarOpen(prevState => !prevState);
    };


    return (
        <>
            <div className="flex flex-col md:flex-row bg-[#0a0a0a] text-white min-h-screen">
    {/* Sidebar */}
    <div className="hidden md:flex">
        <Sidebar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
    </div>

    {/* Main Content */}
    <div className="flex-1">
        <LoggedinNav />

        <div className={`mt-4 flex justify-center items-center px-4 sm:px-6 ${isSidebarOpen ? "md:ml-[20%]" : "md:ml-[10%]"}`}>
            <div className="w-full max-w-4xl p-6 bg-[#141414] rounded-2xl shadow-xl">
                <h1 className="text-2xl sm:text-3xl font-bold text-center text-white mb-6 sm:mb-8">Edit Profile</h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    {/* Personal Details Section */}
                    <div>
                        <div className="flex flex-col gap-4 mb-6">
                            <label className="font-semibold">Avatar</label>
                            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                                <div className="w-24 sm:w-32 h-24 sm:h-32 rounded-full flex justify-center items-center overflow-hidden border-4 border-white shadow-lg">
                                    <img src={profile?.avatar || "/avatar.svg"} alt="Avatar Preview" className="w-full h-full object-cover" />
                                </div>
                                <label className="cursor-pointer bg-white hover:bg-white text-black px-4 py-2 rounded-full shadow-md transition duration-300">
                                    Upload
                                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                </label>
                            </div>
                        </div>

                        <h2 className="text-xl sm:text-2xl font-semibold mb-4">Personal Details</h2>
                        <div className="space-y-4">
                            {['full_name', 'role', 'experience'].map((field, index) => (
                                <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                    <label className="w-32">{field.replace('_', ' ')}</label>
                                    <input type="text" name={field} value={profileData[field]} onChange={handleChange} 
                                        className="w-full bg-[#1a1a1a] p-2 rounded focus:outline-none focus:ring-2 focus:ring-white transition duration-300" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Social Links Section */}
                    <div>
                        <h2 className="text-xl sm:text-2xl font-semibold mb-4">Social Links</h2>
                        <div className="space-y-4">
                            {[{ name: "github", icon: <FaGithub className="text-white text-2xl" /> },
                              { name: "linkedin", icon: <FaLinkedin className="text-blue-500 text-2xl" /> },
                              { name: "instagram", icon: <FaInstagram className="text-pink-500 text-2xl" /> },
                              { name: "portfolio", icon: <FaLink className="text-green-500 text-2xl" /> }].map((item, index) => (
                                <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                    {item.icon}
                                    <input type="text" name={item.name} value={profileData[item.name]} onChange={handleChange} 
                                        className="w-full bg-[#1a1a1a] p-2 rounded focus:outline-none focus:ring-2 focus:ring-white transition duration-300" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bio & Skills Section */}
                <div className="mt-6">
                    <h2 className="text-xl sm:text-2xl font-semibold mb-4">Bio</h2>
                    <textarea name="bio" value={profileData.bio} onChange={handleChange} rows="4" 
                        className="w-full bg-[#1a1a1a] p-2 rounded focus:outline-none focus:ring-2 focus:ring-white transition duration-300"></textarea>
                </div>

                <div className="mt-6">
                    <h2 className="text-xl sm:text-2xl font-semibold mb-4">Skills</h2>
                    <textarea name="skills" value={profileData.skills} onChange={handleChange} rows="4" 
                        className="w-full bg-[#1a1a1a] p-2 rounded focus:outline-none focus:ring-2 focus:ring-white transition duration-300"></textarea>
                </div>

                <div className="flex justify-center mt-6 sm:mt-8">
                <button onClick={handleSaveProfile} className="bg-white hover:bg-gray-300 text-black py-3 px-8 rounded-full shadow-md transition duration-300">
    {btnloading ? <div className="animate-spin w-6 h-6 border-4 border-t-transparent border-black rounded-full"></div> : "Save Changes"}
</button>

                </div>
            </div>
        </div>
    </div>
</div>


        </>

    );
};

export default EditProfile;
