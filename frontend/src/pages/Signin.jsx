import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { Navbar } from "../components";
import styles from '../style';
import "./Spinner.css"

const Signin = () => {
    const { signup } = useAuth();
    const [loading, setLoading] = useState(false); // Added loading state
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await signup(
                formData.username,
                formData.password,
                formData.confirmPassword
            );

            navigate("/create-profile"); // Proceed to profile creation
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false); // Set loading to false after the process completes (for both login and signup)
        }
    };


    return (
        <>
            <div className={`${styles.paddingX} ${styles.flexCenter} bg-primary`}>
                <div className={`${styles.boxWidth}`}>
                    <Navbar />
                </div>
            </div>


            <div className="bg-[#00040f] text-white font-sans min-h-screen flex items-center justify-center">
                <div className="bg-gray-800 bg-opacity-90 w-full max-w-md p-8 rounded-xl shadow-2xl">
                    <h1 className="text-3xl font-bold text-center mb-6 text-purple-300">Create Account</h1>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                id="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full bg-gray-700 border border-transparent rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder-gray-400"
                                placeholder="Enter your username"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                id="password"
                                value={formData.password} onChange={handleChange} required
                                className="w-full bg-gray-700 border border-transparent rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder-gray-400"
                                placeholder="Enter your password"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword} onChange={handleChange} required
                                className="w-full bg-gray-700 border border-transparent rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none placeholder-gray-400"
                                placeholder="Confirm your password"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-purple-500 text-white py-3 rounded-md hover:bg-purple-400 focus:outline-none transition duration-300 flex justify-center items-center"
                            disabled={loading}
                        >
                            {loading ? <span className="spinner"></span> : "Sign Up"}
                        </button>
                    </form>
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-400">
                            Already have an account?{" "}
                            <span onClick={() => navigate("/login")} className="cursor-pointer text-purple-500 hover:underline">
                                Login
                            </span>
                        </p>
                    </div>
                </div>
            </div>


        </>
    );
};

export default Signin;
