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
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl w-full max-w-3xl mx-auto h-[90vh]">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-50 mb-6 sm:mb-8 text-center">
                Recent Activities
            </h2>
            {activities.length > 0 ? (
                <div className="space-y-6 sm:space-y-8 md:space-y-10">
                    <div className="h-[60vh] overflow-y-auto space-y-6 sm:space-y-8 md:space-y-10">
                        {activities
                            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                            .slice(0, 5) // Increased the number of activities to show
                            .map((activity, index) => {
                                const formattedTimestamp = format(
                                    new Date(activity.timestamp),
                                    "MMMM d, yyyy 'at' h:mm a"
                                );

                                return (
                                    <div
                                        key={index}
                                        className="bg-gray-800 mb-2 p-5 sm:p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:bg-gray-700 transition-all duration-300"
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
