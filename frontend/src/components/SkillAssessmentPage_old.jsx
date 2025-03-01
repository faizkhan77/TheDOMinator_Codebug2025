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

  // Speech Recognition Setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = false; // Stops when speech ends
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcriptText = event.results[0][0].transcript;
      setTranscript(transcriptText);
    };

    recognition.onend = () => {
      setIsRecording(false);
      handleSubmit(); // Auto-submit when speech ends
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
    const answer = transcript.trim();
    if (!answer) return;

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
      setTranscript(""); // Reset transcript for the next question
    } else {
      getFinalFeedback(skill, ratings).then(setFinalFeedback);
      setShowSummary(true);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-[#1f1e24] text-gray-50 rounded-xl shadow-lg">
      {loading ? (
        <p>Loading questions...</p>
      ) : showSummary ? (
        <div>
          <h2 className="text-xl font-bold">Assessment Summary</h2>
          <p>Correct Answers: {correctAnswers} / {questions.length}</p>
          <p>{finalFeedback}</p>
          <button onClick={() => navigate("/")} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
            Go Back
          </button>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-bold">Question {currentIndex + 1}</h2>
          <p>{questions[currentIndex]}</p>

          {/* Webcam Section */}
          <div className="relative border-2 border-gray-500 rounded-lg overflow-hidden">
            <Webcam ref={webcamRef} className="w-80 h-60" />
          </div>

          {capturedImage && (
            <div className="mt-4">
              <img src={capturedImage} alt="Captured" className="w-40 h-30 rounded-lg border-2 border-gray-600" />
            </div>
          )}

          {/* Webcam Controls */}
          <div className="flex gap-4">
            <button
              onClick={captureImage}
              className="bg-[#6556cd] hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Video size={20} /> Capture Image
            </button>
          </div>

          {/* Speech Recognition Section */}
          <div className="w-full max-w-md bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-300">{transcript || "Start speaking..."}</p>
          </div>

          {/* Speech Controls */}
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

          {/* Submit Answer Button */}
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
};

export default SkillAssessmentPage;