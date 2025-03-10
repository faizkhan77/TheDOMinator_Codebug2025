import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getQuestions, getRating, getFinalFeedback } from "../gemini/geminiService";
import Webcam from "react-webcam";
import { Mic, Video, StopCircle, RefreshCw } from "lucide-react";

const SkillAssessmentPage = () => {
  const { skill } = useParams();
  const location = useLocation();
  const { skillId } = location.state || {};
  const navigate = useNavigate();

  const webcamRef = useRef(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [ratings, setRatings] = useState({});
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(true);
  const [finalFeedback, setFinalFeedback] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [capturedImage, setCapturedImage] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [btnloading, btnsetLoading] = useState(false);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      const transcriptText = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");
      setTranscript(transcriptText);
    };
  }

  useEffect(() => {
    getQuestions(skill).then((q) => {
      setQuestions(q);
      setLoading(false);
    });
  }, [skill]);

  const startListening = () => {
    if (!recognition) return alert("Speech Recognition is not supported in your browser.");
    setIsRecording(true);
    recognition.start();
  };

  const stopListening = () => {
    if (!recognition) return;
    setIsRecording(false);
    recognition.stop();
  };

  const resetTranscript = () => {
    setTranscript("");
  };

  const captureImage = () => {
    if (webcamRef.current) {
      setCapturedImage(webcamRef.current.getScreenshot());
    }
  };

  const handleSubmit = async () => {
    stopListening();
    const answer = transcript.trim();
    if (!answer) return;

    btnsetLoading(true);

    try {
      const rating = await getRating(questions[currentIndex], answer);
      setRatings((prev) => ({ ...prev, [currentIndex]: rating }));
      setAnswers((prev) => ({ ...prev, [currentIndex]: answer }));

      if (parseInt(rating.rating) >= 4) {
        setCorrectAnswers((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error getting rating:", error);
    }

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      resetTranscript();
    } else {
      const totalScore = Object.values(ratings).reduce((sum, r) => sum + (parseInt(r.rating) || 0), 0);
      getFinalFeedback(skill, totalScore).then(setFinalFeedback);
      setShowSummary(true);
      if (correctAnswers >= 7) {
        updateSkillVerification();
      }
    }
    btnsetLoading(false);
  };

  const updateSkillVerification = async () => {
    try {
      const accessToken = localStorage.getItem("access");
      if (!accessToken) {
        console.error("Access token not found");
        return;
      }
      await fetch(`/api/skills/${skillId}/verify/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      console.error("Error verifying skill:", error);
    }
  };
  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-[#1f1e24] text-gray-50 rounded-xl shadow-lg">
      {loading ? (
        <p>Loading questions...</p>
      ) : showSummary ? (
        // Summary Section
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-3xl h-[95vh] overflow-y-auto transition-all transform">
          <h2 className="text-3xl font-semibold mb-6 text-gray-200">Assessment Complete!</h2>
          {Object.entries(answers).map(([index, answer]) => (
            <div key={index} className="mt-3 p-4 bg-gray-700 rounded-md">
              <p className="font-medium text-gray-300">Question: {questions[index]}</p>
              <p className={`text-${ratings[index]?.rating >= 4 ? "green" : "red"}-400`}>
                Your Answer: {answer}
              </p>
              <p className="text-yellow-400">Suggestion: {ratings[index]?.suggestion}</p>
              <p className={`text-${ratings[index]?.rating >= 4 ? "green" : "red"}-400`}>
                {ratings[index]?.rating >= 4 ? "Correct" : "Failed"}
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
              <p className="text-red-400">You can choose to retake the skill verification.</p>
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
      ) : (
        // Questions Section
        <>
          <h2 className="text-xl font-bold">Question {currentIndex + 1}</h2>
          <p>{questions[currentIndex]}</p>
  
          <div className="relative border-2 border-gray-500 rounded-lg overflow-hidden">
            <Webcam ref={webcamRef} className="w-80 h-60" />
          </div>
  
          {capturedImage && (
            <div className="mt-4">
              <img
                src={capturedImage}
                alt="Captured"
                className="w-40 h-30 rounded-lg border-2 border-gray-600"
              />
            </div>
          )}
  
          <div className="flex gap-4">
            <button
              onClick={captureImage}
              className="bg-[#6556cd] hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Video size={20} /> Capture Image
            </button>
          </div>
  
          <div className="w-full max-w-md bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-300">{transcript || "Start speaking..."}</p>
          </div>
  
          <div className="flex gap-4">
            {!isRecording ? (
              <button
                onClick={startListening}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Mic size={20} /> Start Recording
              </button>
            ) : (
              <button
                onClick={stopListening}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <StopCircle size={20} /> Stop Recording
              </button>
            )}
            <button
              onClick={resetTranscript}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <RefreshCw size={20} /> Reset Text
            </button>
          </div>
  
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mt-4"
          >
            Submit Answer
          </button>
        </>
      )}
    </div>
  );
}

export default SkillAssessmentPage;
