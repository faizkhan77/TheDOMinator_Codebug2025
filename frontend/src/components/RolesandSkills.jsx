import React, { useState } from "react";

const RolesandSkills = ({ setSearchQuery }) => {
    const roles = [
        "Frontend Developer",
        "Backend Developer",
        "Full Stack Developer",
        "UI/UX Designer",
        "Database Administrator",
        "Data Analyst",
        "Python Developer",
        "Software Engineer",
        "Cybersecurity Analyst",
        "Game Developer",
        "Cloud Engineer",
        "AI/ML Engineer"
    ];

    const skills = [
        "ReactJS",
        "NodeJS",
        "ExpressJS",
        "Django",
        "Flask",
        "Python",
        "JavaScript",
        "TypeScript",
        "Bootstrap",
        "TailwindCSS",
        "CSS",
        "HTML",
        "Machine Learning",
        "Deep Learning",
        "Figma",
        "Canva",
        "SQL",
        "NoSQL",
        "Git",
        "Docker",
        "Kubernetes",
        "AWS",
        "Azure",
        "Firebase"
    ];

    const [selectedCategory, setSelectedCategory] = useState("roles");

    return (

        <div className="bg-gradient-to-br from-[#0a0a0a] via-[#141414] to-[#141414] rounded-2xl p-4 sm:p-6 shadow-2xl w-full max-w-md sm:max-w-2xl mx-auto h-[90vh] flex flex-col">
        {/* Toggle Buttons */}
        <div className="flex justify-center mb-3 sm:mb-4">
          <button
            onClick={() => setSelectedCategory("roles")}
            className={`px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full font-semibold text-white mr-1.5 sm:mr-3 transition-all duration-300 
              ${
                selectedCategory === "roles"
                  ? "bg-[#6556cd]"
                  : "bg-[#1f1e24] hover:bg-[#25232b]"
              }`}
          >
            Roles
          </button>
          <button
            onClick={() => setSelectedCategory("skills")}
            className={`px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full font-semibold text-white transition-all duration-300 
              ${
                selectedCategory === "skills"
                  ? "bg-[#6556cd]"
                  : "bg-[#1f1e24] hover:bg-[#25232b]"
              }`}
          >
            Skills
          </button>
        </div>
      
        {/* Title */}
        <h4 className="text-sm sm:text-lg font-semibold text-white text-center mb-2 sm:mb-3">
          {selectedCategory === "roles" ? "Select a Role" : "Select a Skill"}
        </h4>
      
        {/* Role/Skill Buttons */}
        <div className="flex flex-wrap justify-center flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-[#25232b] scrollbar-track-[#1f1e24] p-2">
          {(selectedCategory === "roles" ? roles : skills).map((item) => (
            <button
              key={item}
              onClick={() => setSearchQuery(item)}
              className="bg-[#1f1e24] text-white text-xs sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4 rounded-full mx-1 sm:mx-2 my-1 hover:bg-[#25232b] transition-all duration-300"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      
    );
};

export default RolesandSkills;
