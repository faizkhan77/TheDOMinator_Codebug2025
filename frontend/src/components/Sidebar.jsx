import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import "./Sidebar.css"
import { useNavigate } from "react-router-dom";  // Import useNavigate

import { Link } from 'react-router-dom';

const Sidebar = ({ toggleSidebar }) => {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null);
    const { logout } = useAuth();
    const navigate = useNavigate();  // Initialize navigate function
    // console.warn(props.profile.avatar)

    useEffect(() => {
        // ✅ Load user profile from localStorage
        const storedProfile = localStorage.getItem("userProfile");

        // console.warn("Stored profile:", storedProfile);
        setProfile(JSON.parse(storedProfile)); // ✅ Convert to object
        setUser(JSON.parse(localStorage.getItem("user")))

        // console.warn("profile", profile)

    }, []);

    const handleLogout = () => {
        logout()
        navigate("/login")
    }


    return (
        <div id="nav-bar">
            <input id="nav-toggle" type="checkbox" onChange={toggleSidebar} />
            <div id="nav-header">
                <Link id="nav-title" to="/loggedinhome" rel="noopener noreferrer">
                    HackFusion
                </Link>
                <label htmlFor="nav-toggle">
                    <span id="nav-toggle-burger"></span>
                </label>
                <hr />
            </div>
            <div id="nav-content">
                <div className="nav-button" onClick={() => navigate("/loggedinhome")}>
                    <i className="fas fa-home"></i>  {/* Home icon */}
                    <span>Home</span>
                </div>
                <div className="nav-button" onClick={() => navigate(`/userslist`)}>
                    <i className="fas fa-users"></i>  {/* Users icon */}
                    <span>All Users</span>
                </div>
                <div className="nav-button" onClick={() => navigate(`/recommended-content`)}>
                    <i className="fas fa-star"></i>  {/* Recommended icon */}
                    <span>Recommendations</span>
                </div>
                <div className="nav-button" onClick={() => navigate("/teams")}>
                    <i className="fas fa-users"></i>  {/* Teams icon */}
                    <span>All Teams</span>
                </div>
                <hr />
                <div className="nav-button" onClick={() => navigate("/activities")}>
                    <i className="fas fa-calendar-check"></i>  {/* Activities icon */}
                    <span>My Team Activities</span>
                </div>
                <div className="nav-button" onClick={() => navigate("/invitations")}>
                    <i className="fas fa-user-plus"></i>  {/* Invitations icon */}
                    <span>Invitations</span>
                </div>
                <div className="nav-button" onClick={() => navigate("/team/new")}>
                    <i className="fas fa-users-cog"></i>  {/* Create a Team icon */}
                    <span>Create a Team</span>
                </div>
                <div className="nav-button" onClick={() => navigate("/myteams")}>
                    <i className="fas fa-users"></i>  {/* My Teams icon */}
                    <span>My Teams</span>
                </div>
                <hr />
                <div className="nav-button" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>  {/* Logout icon */}
                    <span>Logout</span>
                </div>
                <div id="nav-content-highlight"></div>
            </div>


            <input id="nav-footer-toggle" type="checkbox" />
            <div id="nav-footer">
                <Link to={`/user/${user?.id}`}>
                    <div id="nav-footer-heading">
                        <div id="nav-footer-avatar">
                            <img
                                src={profile?.avatar}
                                alt="Avatar"
                                className="w-12 h-12 rounded-full  border-2 border-gray-300 bg-cover "
                            />
                        </div>
                        <div id="nav-footer-titlebox">
                            <span id="nav-footer-title" rel="noopener noreferrer" style={{ fontSize: "15px" }}>
                                {profile ? profile.full_name.slice(0, 10) : "Guest"}
                            </span>
                            <span id="nav-footer-subtitle"></span>
                        </div>
                        <label htmlFor="nav-footer-toggle">
                            <i className="fas fa-caret-up"></i>
                        </label>
                    </div>
                </Link>

            </div>
        </div>
    );
};

export default Sidebar;