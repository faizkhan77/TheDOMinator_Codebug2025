import React, { useEffect, useState } from "react";
import { format } from "date-fns";

const Activities = () => {
    const [activities, setActivities] = useState([]);
    const userProfile = JSON.parse(localStorage.getItem("userProfile"));
    const userTeams = userProfile?.teams || [];

    useEffect(() => {
        const storedActivities = JSON.parse(localStorage.getItem("activities")) || [];
        const filteredActivities = storedActivities.filter(
            (activity) => userTeams.includes(activity.teamId)
        );
        setActivities(filteredActivities);
    }, []);

    return (
        <div className="bg-gradient-to-br from-[#0a0a0a] via-[#141414] to-[#141414] rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl w-full max-w-3xl mx-auto h-[90vh]">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">
          Recent Activities
        </h2>
      
        {activities.length > 0 ? (
          <div className="space-y-6 sm:space-y-8 md:space-y-10">
            <div className="h-[60vh] overflow-y-auto space-y-6 sm:space-y-8 md:space-y-10 scrollbar-thin scrollbar-thumb-[#25232b] scrollbar-track-[#1f1e24]">
              {activities
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, 5)
                .map((activity, index) => {
                  const formattedTimestamp = format(
                    new Date(activity.timestamp),
                    "MMMM d, yyyy 'at' h:mm a"
                  );
      
                  return (
                    <div
                      key={index}
                      className="bg-[#1f1e24] mb-2 p-5 sm:p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:bg-[#25232b] transition-all duration-300"
                    >
                      <div className="text-gray-300 text-base sm:text-lg italic">
                        "{activity.message}"
                      </div>
                      <div className="text-gray-400 text-sm sm:text-base mt-2 sm:mt-3">
                        {formattedTimestamp}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center text-sm sm:text-base">
            No recent activities.
          </p>
        )}
      </div>
      
    );
};

export default Activities;
