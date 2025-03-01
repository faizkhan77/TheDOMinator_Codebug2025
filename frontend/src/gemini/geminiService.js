import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const listModels = async () => {
  try {
    const response = await genAI.listModels();
    console.log("Available models:", response.models);
  } catch (error) {
    console.error("Error listing models:", error);
  }
};

export const getQuestions = async (skill) => {
  try {
    // listModels();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Ask 15 theoretical technical questions related to ${skill}, without any introduction or explanation.
Only provide the questions in the format:
1. Question...
2. Question...
3. Question...
...
15. Question...`;

    const result = await model.generateContent(prompt);
    const responseText =
      result.response.candidates[0]?.content?.parts[0]?.text || "";

    return responseText
      .split("\n")
      .map((q) => q.trim())
      .filter((q) => q)
      .slice(0, 15);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return ["Error fetching questions. Please try again later."];
  }
};

export const getRating = async (question, answer) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Rate the following answer on a scale of 1-10 and provide improvement suggestions and ensure to avoid code snippets.
    Question: ${question}
    Answer: ${answer}
    Format: "Rating: [number]/10 | Suggestion: [text]"`;

    const result = await model.generateContent(prompt);
    const responseText =
      result.response.candidates[0]?.content?.parts[0]?.text || "";

    const ratingMatch = responseText.match(/Rating:\s*(\d+)\/10/i);
    const suggestionMatch = responseText.match(/Suggestion:\s*(.*)/i);

    const rating = ratingMatch ? parseInt(ratingMatch[1]) : "N/A";
    const suggestion = suggestionMatch
      ? suggestionMatch[1]
      : "No suggestion provided.";

    // Determine if the answer is correct or wrong
    const status = rating !== "N/A" && rating >= 4 ? "Correct" : "Wrong";

    return { rating, suggestion, status };
  } catch (error) {
    console.error("Error fetching rating:", error);
    return {
      rating: "N/A",
      suggestion: "Could not process rating.",
      status: "Unknown",
    };
  }
};

export const getFinalFeedback = async (skill, ratings) => {
  try {
    const validRatings = Object.values(ratings)
      .map((r) => parseInt(r.rating))
      .filter((r) => !isNaN(r));
    const totalScore = validRatings.reduce((sum, r) => sum + r, 0);
    const maxScore = validRatings.length * 10;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Provide a concise performance review for a person who completed a ${skill} assessment. 
    Their total score is ${totalScore} out of ${maxScore}. 
    The review should highlight their strengths based on their performance and suggest areas for improvement if needed. 
    Keep the review to 2-3 sentences, and avoid mentioning any uncompleted tasks or irrelevant points.`;

    const result = await model.generateContent(prompt);
    return (
      result.response.candidates[0]?.content?.parts[0]?.text.trim() ||
      "Error fetching feedback."
    );
  } catch (error) {
    console.error("Error fetching final feedback:", error);
    return "Error fetching final feedback.";
  }
};
