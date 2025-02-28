import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuestions, getRating, getFinalFeedback } from "../gemini/geminiService";
import { useLocation } from "react-router-dom";
import LoggedinNav from "../components/LoggedinNav";
import Sidebar from "../components/Sidebar";

const SkillAssessmentPage = () => {
    const { skill } = useParams();
    const location = useLocation(); // Get location to access passed state
    const { skillId } = location.state || {}; // Access the skillId from state

    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [ratings, setRatings] = useState({});
    const [showSummary, setShowSummary] = useState(false);
    const [loading, setLoading] = useState(true);
    const [finalFeedback, setFinalFeedback] = useState("");
    const [correctAnswers, setCorrectAnswers] = useState(0); // Track correct answers
    const [btnloading, btnsetLoading] = useState(false); // Added loading state
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        getQuestions(skill).then((q) => {
            setQuestions(q);
            setLoading(false);
        });
    }, [skill]);

    const handleAnswerChange = (e) => {
        setAnswers((prev) => ({ ...prev, [currentIndex]: e.target.value }));
    };

    const handleSubmit = async () => {
        const answer = answers[currentIndex];
        if (!answer) return;

        btnsetLoading(true); // Set the loading state to true when submitting

        try {
            const rating = await getRating(questions[currentIndex], answer);
            setRatings((prev) => ({ ...prev, [currentIndex]: rating }));

            // If the rating is 4 or higher, consider it correct
            if (parseInt(rating.rating) >= 4) {
                setCorrectAnswers((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Error getting rating:", error);
        }

        if (currentIndex + 1 < questions.length) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            const totalScore = Object.values(ratings).reduce((sum, r) => sum + (parseInt(r.rating) || 0), 0);
            getFinalFeedback(skill, totalScore).then(setFinalFeedback);
            setShowSummary(true);

            // If the user got 7 or more answers correct, update the skill
            if (correctAnswers >= 7) {
                updateSkillVerification();
            }
        }

        btnsetLoading(false); // Set loading state back to false when done
    };

    const updateSkillVerification = async () => {
        try {
            // Retrieve the token from localStorage
            const accessToken = localStorage.getItem("access");

            // Check if the token is present
            if (!accessToken) {
                console.error("Access token not found");
                return;
            }
            const response = await fetch(`/api/skills/${skillId}/verify/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`, // Include the token
                },
            });
            const data = await response.json();
            if (response.ok) {
                console.log(data.message);
            } else {
                console.error(data.error);
            }
        } catch (error) {
            console.error("Error updating skill verification:", error);
        }
    };

    // Function to toggle the sidebar visibility
    const toggleSidebar = () => {
        setIsSidebarOpen(prevState => !prevState);
    };

    console.log("QUESTIONS", questions)

    return (
        <>
            <div className="hidden md:flex">
                <Sidebar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
            </div>
            <div>
                <LoggedinNav />
            </div>

            <div className={`h-screen flex flex-col justify-center items-center text-white px-4 md:px-8 ${isSidebarOpen ? "md:ml-[20%]" : "md:ml-[10%]"}`}>
                {loading ? (
                    <p className="text-lg font-semibold text-gray-400">Loading questions...</p>
                ) : !showSummary ? (
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-3xl transition-all transform hover:scale-105">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-200">
                            {skill} Assessment - Question {currentIndex + 1}/{questions.length}
                        </h2>
                        <p className="mt-3 font-medium text-gray-300">{questions[currentIndex]}</p>
                        <textarea
                            placeholder="Type your answer..."
                            value={answers[currentIndex] || ""}
                            onChange={handleAnswerChange}
                            className="mt-3 p-4 w-full bg-gray-700 text-white rounded-md resize-none transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-600"
                            rows="6"
                        />
                        <button
                            onClick={handleSubmit}
                            className="mt-3 px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-200 ease-in-out transform hover:scale-105"
                        >
                            {btnloading ? (
                                <div className="animate-spin w-6 h-6 border-4 border-t-transparent border-purple-500 rounded-full"></div> // Loading spinner
                            ) : (
                                "Submit"
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-3xl h-[95vh] overflow-y-auto transition-all transform">
                        <h2 className="text-3xl font-semibold mb-6 text-gray-200">Assessment Complete!</h2>
                        {Object.entries(answers).map(([index, answer]) => (
                            <div key={index} className="mt-3 p-4 bg-gray-700 rounded-md">
                                <p className="font-medium text-gray-300">Question: {questions[index]}</p>
                                <p className={`text-${ratings[index]?.rating >= 4 ? 'green' : 'red'}-400`}>
                                    Your Answer: {answer}
                                </p>
                                <p className="text-yellow-400">Suggestion: {ratings[index]?.suggestion}</p>
                                <p className={`text-${ratings[index]?.rating >= 4 ? 'green' : 'red'}-400`}>
                                    {ratings[index]?.rating >= 4 ? 'Correct' : 'Failed'}
                                </p>
                            </div>
                        ))}

                        <div className="mt-6 p-4 bg-gray-700 rounded-md">
                            <h3 className="text-lg font-semibold text-white">Final Review</h3>
                            <p className="text-gray-300">{finalFeedback || "Fetching feedback..."}</p>
                        </div>

                        <div className="mt-6 p-4 bg-gray-700 rounded-md">
                            <h3 className="text-lg font-semibold text-white">
                                {correctAnswers >= 3
                                    ? "Your skill has been successfully verified"
                                    : "Your skill hasn't been verified unfortunately"}
                            </h3>
                            {correctAnswers >= 3 ? (
                                <p className="text-green-400">Congratulations, you passed the assessment!</p>
                            ) : (
                                <p className="text-red-400">
                                    You can choose to retake the skill verification.
                                </p>
                            )}
                        </div>

                        <div className="mt-6 p-4 bg-gray-700 rounded-md">
                            <h3 className="text-lg font-semibold text-white">
                                Correct answers: {correctAnswers} out of {questions.length}
                            </h3>
                        </div>

                        <button
                            onClick={() => navigate(-1)}
                            className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-700 via-purple-800 to-purple-900 
               hover:from-purple-800 hover:via-purple-900 hover:to-black 
               text-white rounded-lg shadow-lg transition-all duration-300 
               transform hover:scale-105 hover:shadow-purple-500/50 
               border border-purple-600 hover:border-purple-400"
                        >
                            Back to Profile
                        </button>

                    </div>


                )}
            </div>
        </>

    );
};


export default SkillAssessmentPage;