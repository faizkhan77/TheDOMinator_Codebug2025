import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import axios from "axios";
import {
    FaGithub,
    FaLinkedin,
    FaInstagram,
    FaFacebook,
    FaEnvelope,
    FaLink,
} from "react-icons/fa";

const CreateProfile = () => {
    const { accessToken, user } = useAuth();
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState({
        full_name: "",
        role: "",
        skills: "",
        experience: "",
        github: "",
        linkedin: "",
        instagram: "",
        portfolio: "",
        email: "",
        bio: "",
        location: ""
    });

    const [error, setError] = useState("");
    const [linkerrors, setlinkErrors] = useState({});
    const [btnloading, btnsetLoading] = useState(false);

    const handleChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
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

        setlinkErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        btnsetLoading(true);
        setError("");

        if (!validateURLs()) {
            return; // Stop the function if validation fails
        }

        console.log("🔹 Access Token:", accessToken);
        console.log("🔹 User Object:", user);
        console.log("🔹 User ID:", user?.id); // Check if user.id exists

        try {
            // 🔹 Step 1: Create the Profile First (Without Skills)
            const profilePayload = {
                full_name: profileData.full_name,
                role: profileData.role,
                experience: profileData.experience,
                github: profileData.github,
                linkedin: profileData.linkedin,
                instagram: profileData.instagram,
                portfolio: profileData.portfolio,
                email: profileData.email,
                bio: profileData.bio,
                location: profileData.location,
                user: user.id, // Ensure user ID is passed
                teams: [], // Ensure teams is passed as an empty array if no teams are selected
            };

            console.log("🔹 Creating Profile with Payload:", profilePayload);

            const profileResponse = await axios.post(
                "/api/profiles/",
                profilePayload,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );

            const createdProfile = profileResponse.data;
            console.log("✅ Profile Created Successfully:", createdProfile);

            // Store profile in localStorage
            localStorage.setItem("userProfile", JSON.stringify(createdProfile));

            // Get the newly created profile ID
            const profileId = createdProfile.id;

            // 🔹 Step 2: Send Skills (Now That Profile Exists)
            const skillsArray = profileData.skills
                .split(",")
                .map((skill) => skill.trim())
                .filter((skill) => skill.length > 0);


            if (skillsArray.length > 0) {
                console.log("🔹 Sending Skills:", skillsArray);

                await axios.post(
                    `/api/profiles/${profileId}/add_skills/`,
                    { skills: skillsArray }, // Send a list of strings, not objects
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                );


                console.log("✅ Skills Added Successfully!");

                // 🔹 Step 3: Fetch Updated Profile After Adding Skills
                const updatedProfileResponse = await axios.get(
                    `/api/profiles/${profileId}/`,
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                );

                const updatedProfile = updatedProfileResponse.data;
                console.log("✅ Updated Profile Fetched:", updatedProfile);

                // 🔹 Step 4: Update localStorage with the latest profile data
                localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
            }

            // Redirect after profile setup
            navigate("/loggedinhome");
        } catch (err) {
            console.log("🔹 Error response:", err.response); // Log the error response for debugging
            setError("Profile creation failed");
        }

        btnsetLoading(false);
    };






    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white p-6">
        <div className="w-full max-w-6xl bg-[#141414] rounded-2xl shadow-xl p-8 flex flex-col md:flex-row items-center gap-8">
            {/* Left Section - Form */}
            <div className="w-full md:w-2/3">
                <h1 className="text-3xl font-bold text-center text-white mb-8">Create Your Profile</h1>
                {error && <p className="text-red-500 text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Details */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Personal Details</h2>
                            <div className="space-y-4">
                                {['full_name', 'role', 'location', 'experience'].map((field, index) => (
                                    <div key={index} className="flex flex-col">
                                        <label className="text-gray-400 capitalize">{field.replace('_', ' ')}</label>
                                        <input
                                            type="text"
                                            name={field}
                                            placeholder={`Enter your ${field.replace('_', ' ')}`}
                                            className="w-full bg-[#0a0a0a] p-3 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-white transition"
                                            value={profileData[field]}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Social Links */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Social Links</h2>
                            <div className="space-y-4">
                                {[
                                    { name: 'github', icon: <FaGithub className="text-white text-2xl" /> },
                                    { name: 'linkedin', icon: <FaLinkedin className="text-blue-500 text-2xl" /> },
                                    { name: 'instagram', icon: <FaInstagram className="text-pink-500 text-2xl" /> },
                                    { name: 'email', icon: <FaEnvelope className="text-red-500 text-2xl" />, type: 'email' },
                                    { name: 'portfolio', icon: <FaLink className="text-green-500 text-2xl" /> }
                                ].map(({ name, icon, type = 'text' }, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        {icon}
                                        <input
                                            type={type}
                                            name={name}
                                            placeholder={`${name.charAt(0).toUpperCase() + name.slice(1)} URL`}
                                            className="w-full bg-[#0a0a0a] p-3 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-white transition"
                                            value={profileData[name] || ''}
                                            onChange={handleChange}
                                        />
                                        {linkerrors[name] && <p className="text-red-500 text-sm">{linkerrors[name]}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Bio and Skills */}
                    {['bio', 'skills'].map((field, index) => (
                        <div key={index}>
                            <h2 className="text-xl font-semibold mb-4">{field.charAt(0).toUpperCase() + field.slice(1)}</h2>
                            <textarea
                                name={field}
                                placeholder={`Write about your ${field}...`}
                                className="w-full bg-[#0a0a0a] p-3 rounded border border-gray-700 h-32 focus:outline-none focus:ring-2 focus:ring-white transition"
                                value={profileData[field]}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    ))}
                    {/* Submit Button */}
                    <div className="text-center">
                        <button type="submit" className="bg-white text-black px-6 py-3 rounded-full shadow-lg hover:bg-gray-300 transition">
                            {btnloading ? <div className="animate-spin w-6 h-6 border-4 border-t-transparent border-black rounded-full"></div> : "Save Profile"}
                        </button>
                    </div>
                </form>
            </div>
            {/* Right Section - Image */}
<div className="hidden md:flex w-1/3 self-stretch rounded-lg">
    <img src="https://i.pinimg.com/736x/3a/83/d1/3a83d14ebf6939dbdc1f155087c7be71.jpg" 
        alt="Profile Illustration" 
        className="w-full h-full rounded-lg shadow-lg object-cover" />
</div>

        </div>
    </div>
    );
};

export default CreateProfile;
