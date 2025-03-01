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
  className={`px-8 py-6 transition-all duration-300 flex ${isSidebarOpen ? "md:ml-[20%]" : "md:ml-[10%]"}`}
  style={{ height: "97vh", backgroundColor: "#0a0a0a" }} // Dark background
>
  {/* Scrollable Activities Section */}
  <div className="w-3/4 h-[80vh] overflow-y-auto pr-4">
    <h2 className="text-3xl font-semibold text-white mb-6">Recent Activities</h2>

    {activities.length > 0 ? (
      <div className="space-y-8">
        {activities
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .map((activity, index) => (
            <div
              key={index}
              className="bg-[#141414] p-8 rounded-2xl shadow-lg hover:shadow-xl hover:bg-gray-700 transition-all duration-300"
            >
              <div className="text-white text-base mt-4 italic">"{activity.message}"</div>
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

  {/* Image on the Right */}
  <div className="w-1/4 flex justify-center items-center">
    <img
      src="https://i.pinimg.com/474x/dc/8a/a2/dc8aa2ee498140243ece775d2fae468a.jpg"
      alt=""
      className="rounded-2xl shadow-lg object-cover w-full"
    />
  </div>
</div>


        </>
    );
};

export default ActivitiesPage;
