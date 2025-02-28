import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns"; // Ensure you have date-fns installed
import LoggedinNav from "../components/LoggedinNav";

const ActivitiesPage = () => {
    const [activities, setActivities] = useState([]);
    const userProfile = JSON.parse(localStorage.getItem("userProfile"));
    const userTeams = userProfile?.teams || []; // List of team IDs the user is part of
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State to track sidebar visibility
    const navigate = useNavigate();

    useEffect(() => {
        // Only fetch and filter activities when the component mounts
        const storedActivities = JSON.parse(localStorage.getItem("activities")) || [];

        // Filter activities to show only those belonging to the user's teams
        const filteredActivities = storedActivities.filter(
            (activity) => userTeams.includes(activity.teamId)
        );

        setActivities(filteredActivities);

        console.log("activities", userProfile)
    }, []); // Empty dependency array means this runs only once when the component mounts

    // Function to toggle the sidebar visibility
    const toggleSidebar = () => {
        setIsSidebarOpen(prevState => !prevState);
    };

    return (
        <>
            {/* Sidebar Component */}


            <div className=" hidden md:block">
                <Sidebar className="" toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
            </div>
            <div className="h-full">
                <LoggedinNav />
            </div>
            <div
                className={`px-8 py-6 transition-all duration-300 ${isSidebarOpen ? "md:ml-[20%]" : "md:ml-[10%]"}`}
                style={{ height: "97vh", overflowY: "auto" }} // Fixed height with scrollbar
            >
                <h2 className="text-3xl font-semibold text-white mb-6">Recent Activities</h2>

                {/* Display Activities */}
                {activities.length > 0 ? (
                    <div className="space-y-8">
                        {activities
                            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // Sort by newest first
                            .map((activity, index) => ( // No slice(), display all
                                <div
                                    key={index}
                                    className="bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl hover:bg-gray-700 transition-all duration-300"
                                >
                                    <div className="text-gray-300 text-base mt-4 italic">
                                        "{activity.message}"
                                    </div>
                                    <div className="text-gray-400 text-sm mt-2">
                                        {format(new Date(activity.timestamp), "EEEE, MMMM d, yyyy - hh:mm a")}
                                    </div>
                                </div>
                            ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center">No recent activities.</p>
                )}
            </div>

        </>
    );
};

export default ActivitiesPage;
