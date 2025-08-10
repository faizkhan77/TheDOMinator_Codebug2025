// src/components/SkillAssessmentPage.jsx

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  getQuestions,
  getRating,
  getFinalFeedback,
} from "../gemini/geminiService";
import Webcam from "react-webcam";
import {
  Mic,
  StopCircle,
  RefreshCw,
  Send,
  Loader,
  BarChart,
  CheckCircle,
  XCircle,
  VideoOff,
} from "lucide-react";
import WebcamToggle from "./WebcamToggle";

const SkillAssessmentPage = () => {
  const { skill } = useParams();
  const location = useLocation();
  const { skillId } = location.state || {};
  const navigate = useNavigate();

  // Component State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [ratings, setRatings] = useState({});
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(true);
  const [finalFeedback, setFinalFeedback] = useState("");
  const [totalScore, setTotalScore] = useState(0);

  // Recording & UI State
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWebcamOn, setIsWebcamOn] = useState(true);
  const [timeLeft, setTimeLeft] = useState(120);

  // Refs
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef(""); // Ref to store the committed part of the transcript

  // --- OPTIMIZED SPEECH RECOGNITION ---
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in your browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true; // Key for real-time feedback
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          // Once a part is final, append it to our ref
          finalTranscriptRef.current += event.results[i][0].transcript + " ";
        } else {
          // Otherwise, it's an interim result
          interimTranscript += event.results[i][0].transcript;
        }
      }
      // Update the display with the final parts plus the current interim part
      setTranscript(finalTranscriptRef.current + interimTranscript);
    };

    // When recording stops, reset the final transcript ref
    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
  }, []);

  // Fetch Questions
  useEffect(() => {
    setLoading(true);
    getQuestions(skill).then((q) => {
      if (q.length > 0 && q[0].startsWith("Error")) {
        alert(q[0]); // Show API key or other errors to the user
      }
      setQuestions(q);
      setLoading(false);
    });
  }, [skill]);

  // Timer Logic
  useEffect(() => {
    if (loading || showSummary || isSubmitting) return;

    if (timeLeft <= 0) {
      handleNextQuestion();
      return;
    }

    const timerId = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  }, [timeLeft, loading, showSummary, isSubmitting]);

  // Reset for new question
  useEffect(() => {
    setTimeLeft(120);
    setTranscript("");
    finalTranscriptRef.current = ""; // Reset ref for the new question
  }, [currentIndex]);

  // --- Control Functions ---
  const startListening = () => {
    if (recognitionRef.current && !isRecording) {
      finalTranscriptRef.current = transcript; // Save any typed text before starting
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isRecording) {
      setIsRecording(false);
      recognitionRef.current.stop();
    }
  };

  const resetTranscript = () => {
    finalTranscriptRef.current = "";
    setTranscript("");
  };

  const handleNextQuestion = useCallback(async () => {
    setIsSubmitting(true);
    stopListening(); // Ensure recording is stopped

    const answer = transcript.trim() || "No answer provided.";

    try {
      const ratingResult = await getRating(questions[currentIndex], answer);
      setRatings((prev) => ({ ...prev, [currentIndex]: ratingResult }));
      setAnswers((prev) => ({ ...prev, [currentIndex]: answer }));

      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        const finalRatings = { ...ratings, [currentIndex]: ratingResult };
        const calculatedScore = Object.values(finalRatings).reduce(
          (sum, r) => sum + (r.rating || 0),
          0
        );
        setTotalScore(calculatedScore);

        const feedback = await getFinalFeedback(skill, {
          totalScore: calculatedScore,
          maxScore: questions.length * 10,
        });
        setFinalFeedback(feedback);

        // A user must get a rating of 4 or higher on EACH answer to pass.
        const hasPassed = Object.values(finalRatings).every(
          (r) => r.rating >= 4
        );

        if (hasPassed) {
          await updateSkillVerification();
        }
        setShowSummary(true);
      }
    } catch (error) {
      console.error("Error processing answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [currentIndex, questions, transcript, ratings]);

  const updateSkillVerification = async () => {
    const accessToken = localStorage.getItem("access");
    if (!accessToken || !skillId) {
      console.error("Access token or Skill ID not found");
      return;
    }
    try {
      await fetch(`/api/skills/${skillId}/verify/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log("Skill verification status updated successfully!");
    } catch (error) {
      console.error("Error verifying skill:", error);
    }
  };

  // --- Render Helper Functions ---
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const RatingBar = ({ rating }) => {
    const percentage = (rating / 10) * 100;
    let colorClass = "bg-red-500";
    if (rating > 4) colorClass = "bg-yellow-500";
    if (rating > 7) colorClass = "bg-green-500";

    return (
      <div className="w-full bg-gray-600 rounded-full h-2.5">
        <div
          className={`${colorClass} h-2.5 rounded-full`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  // --- Main Render Logic ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#111214] text-white">
        <Loader className="w-16 h-16 animate-spin text-purple-400" />
        <p className="mt-4 text-lg">
          Preparing your assessment for <strong>{skill}</strong>...
        </p>
      </div>
    );
  }

  if (showSummary) {
    const isPassed = Object.values(ratings).every((r) => r.rating >= 4);
    return (
      <div className="bg-[#111214] min-h-screen p-4 sm:p-8 text-white">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-10">
            <h1 className="text-4xl font-bold">Assessment Complete!</h1>
            <p className="text-gray-400 mt-2">
              Here is a summary of your performance in {skill}.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div
              className={`flex flex-col items-center justify-center p-6 rounded-lg shadow-lg ${
                isPassed ? "bg-green-500/10" : "bg-red-500/10"
              }`}
            >
              <h2 className="text-2xl font-semibold">
                {isPassed ? "Skill Verified" : "Verification Failed"}
              </h2>
              {isPassed ? (
                <CheckCircle className="w-16 h-16 text-green-500 my-4" />
              ) : (
                <XCircle className="w-16 h-16 text-red-500 my-4" />
              )}
              <p className="text-5xl font-bold">
                {totalScore}
                <span className="text-2xl text-gray-400">/50</span>
              </p>
              <p className="mt-2 text-gray-300">
                You needed a score of 4+ on every question.
              </p>
            </div>

            <div className="bg-[#1c1c22] p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <BarChart className="mr-2" /> Final Review
              </h2>
              <p className="text-gray-300 leading-relaxed">{finalFeedback}</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-6 text-center">
            Detailed Breakdown
          </h2>
          <div className="space-y-6">
            {questions.map((q, index) => (
              <div
                key={index}
                className="bg-[#1c1c22] p-6 rounded-lg shadow-lg transition-all hover:shadow-purple-500/20"
              >
                <p className="font-semibold text-lg text-gray-200 mb-3">
                  Q{index + 1}: {q}
                </p>
                <p className="text-gray-400 italic mb-4">
                  Your Answer: "{answers[index]}"
                </p>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`font-bold text-xl ${
                      ratings[index]?.rating >= 4
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {ratings[index]?.rating || "N/A"}/10
                  </span>
                </div>
                <RatingBar rating={ratings[index]?.rating || 0} />
                {ratings[index]?.suggestion && (
                  <p className="mt-4 text-yellow-300/80 bg-yellow-500/10 p-3 rounded-md">
                    <strong>Suggestion:</strong> {ratings[index].suggestion}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => navigate(-1)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105"
            >
              Back to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#111214] text-white p-4">
      <div className="w-full max-w-3xl bg-[#1c1c22] rounded-2xl shadow-2xl p-8 transition-all">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Skill Assessment: {skill}
            </h1>
            <p className="text-gray-400">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>
          <div className="text-4xl font-mono bg-gray-900/50 px-4 py-2 rounded-lg text-purple-300">
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-6">
          <div
            className="bg-purple-600 h-2.5 rounded-full"
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
          ></div>
        </div>

        {/* Question */}
        <p className="text-xl text-center text-gray-200 mb-6 min-h-[6rem] flex items-center justify-center">
          {questions[currentIndex]}
        </p>

        {/* Webcam and Answer Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="relative aspect-video bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden">
            {isWebcamOn ? (
              <Webcam audio={false} className="w-full h-full object-cover" />
            ) : (
              <div className="text-gray-500 flex flex-col items-center">
                <VideoOff size={48} />
                <span className="mt-2">Webcam is off</span>
              </div>
            )}
            <div className="absolute top-3 right-3">
              <WebcamToggle
                isOn={isWebcamOn}
                onToggle={() => setIsWebcamOn(!isWebcamOn)}
              />
            </div>
          </div>
          <textarea
            className="w-full h-full bg-gray-900/50 p-4 rounded-lg text-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Start recording to speak..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)} // Allow manual edits
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          {!isRecording ? (
            <button
              onClick={startListening}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mic /> Start Recording
            </button>
          ) : (
            <button
              onClick={stopListening}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-lg transition-transform transform hover:scale-105"
            >
              <StopCircle /> Stop Recording
            </button>
          )}
          <button
            onClick={resetTranscript}
            disabled={isSubmitting || isRecording}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50"
          >
            <RefreshCw size={18} /> Reset
          </button>
        </div>

        <div className="mt-6 border-t border-gray-700 pt-6 flex justify-end">
          <button
            onClick={handleNextQuestion}
            disabled={isSubmitting || isRecording}
            className="flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader className="animate-spin" /> : <Send />}
            Submit & Next Question
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillAssessmentPage;
