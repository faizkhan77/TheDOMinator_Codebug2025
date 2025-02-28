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
        <>


            <div className="min-h-screen mt-4  text-gray-50 flex justify-center items-center bg-primary">
                <div className="w-full max-w-4xl p-6 bg-gray-800 rounded-2xl shadow-xl">
                    <h1 className="text-3xl font-bold text-center text-purple-500 mb-8">
                        Create Your Profile
                    </h1>
                    {error && <p className="error-message">{error}</p>}
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Personal Details Section */}
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">Personal Details</h2>
                                <div className="space-y-4">
                                    {/* Name */}
                                    <div className="flex items-center gap-4">
                                        <label className="w-32">Name</label>
                                        <input
                                            type="text"
                                            name="full_name"
                                            placeholder="Enter your name"
                                            className="w-full bg-gray-700 p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
                                            value={profileData.full_name} onChange={handleChange} required
                                        />
                                    </div>

                                    {/* Role */}
                                    <div className="flex items-center gap-4">
                                        <label className="w-32">Role</label>
                                        <input
                                            type="text"
                                            placeholder="Your current role (e.g., Developer)"
                                            className="w-full bg-gray-700 p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
                                            name="role" value={profileData.role} onChange={handleChange} required
                                        />
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <label className="w-32">Location</label>
                                        <input
                                            type="text"  // We will keep this as text to manually control the input
                                            placeholder="Where are you located?"
                                            name="location" value={profileData.location} onChange={handleChange}
                                            className="w-full bg-gray-700 p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
                                        />
                                    </div>

                                    {/* Experience */}
                                    <div className="flex items-center gap-4">
                                        <label className="w-32">Experience</label>
                                        <input
                                            type="text"  // We will keep this as text to manually control the input
                                            placeholder="Years of experience"
                                            name="experience" value={profileData.experience} onChange={handleChange}
                                            className="w-full bg-gray-700 p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
                                        />
                                    </div>

                                </div>
                            </div>

                            {/* Social Links Section */}
                            <div>
                                <h2 className="text-2xl font-semibold mb-4">Social Links</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <FaGithub className="text-purple-500 text-2xl" />
                                        <input
                                            type="text"
                                            placeholder="GitHub Profile URL"
                                            className="w-full bg-gray-700 p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
                                            name="github" value={profileData.github} onChange={handleChange}
                                        />
                                        {linkerrors.github && <p className="text-red-500 text-sm">{linkerrors.github}</p>}
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <FaLinkedin className="text-blue-500 text-2xl" />
                                        <input
                                            type="text"
                                            placeholder="LinkedIn Profile URL"
                                            className="w-full bg-gray-700 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                                            name="linkedin" value={profileData.linkedin} onChange={handleChange}
                                        />
                                        {linkerrors.github && <p className="text-red-500 text-sm">{linkerrors.github}</p>}
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <FaInstagram className="text-pink-500 text-2xl" />
                                        <input
                                            type="text"
                                            placeholder="Instagram Profile URL"
                                            className="w-full bg-gray-700 p-2 rounded focus:outline-none focus:ring-2 focus:ring-pink-500 transition duration-300"
                                            name="instagram" value={profileData.instagram} onChange={handleChange}
                                        />
                                        {linkerrors.github && <p className="text-red-500 text-sm">{linkerrors.github}</p>}
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <FaEnvelope className="text-red-500 text-2xl" />
                                        <input
                                            type="email"
                                            placeholder="Email Address"
                                            className="w-full bg-gray-700 p-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-300"
                                        />
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <FaLink className="text-green-500 text-2xl" />
                                        <input
                                            type="text"
                                            placeholder="Portfolio URL"
                                            className="w-full bg-gray-700 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300"
                                            name="portfolio" value={profileData.portfolio} onChange={handleChange}
                                        />
                                        {linkerrors.github && <p className="text-red-500 text-sm">{linkerrors.github}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-2">
                                <h2 className="text-2xl font-semibold mb-4">Bio</h2>
                                <textarea
                                    placeholder="Write something about yourself..."
                                    className="w-full bg-gray-700 p-4 rounded h-40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
                                    name="bio" value={profileData.bio} onChange={handleChange} required
                                />
                            </div>

                            {/* Skills Section */}
                            <div className="col-span-2">
                                <h2 className="text-2xl font-semibold mb-4">Skills</h2>
                                <textarea
                                    placeholder="List your skills (e.g., JavaScript, React, Node.js)"
                                    className="w-full bg-gray-700 p-4 rounded h-40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
                                    name="skills" value={profileData.skills} onChange={handleChange} required
                                />
                            </div>

                        </div>

                        {/* Submit Button */}
                        <div className="mt-8 text-center">
                            <button type="submit" className=" bg-purple-500  hover:bg-purple-600 text-white px-6 py-2 rounded-full shadow-lg transition duration-300">
                                {btnloading ? (
                                    <div className="animate-spin w-6 h-6 border-4 border-t-transparent border-white rounded-full"></div>
                                ) : (
                                    "Save Profile"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CreateProfile;
