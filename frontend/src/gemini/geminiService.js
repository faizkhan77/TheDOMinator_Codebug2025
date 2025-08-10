// src/gemini/geminiService.js

import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure your API key is being loaded from your .env file
const API_KEY = import.meta.env.VITE_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// The corrected, valid model name
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

export const getQuestions = async (skill) => {
  try {
    const prompt = `Ask 5 distinct, theoretical technical interview questions for a ${skill} role.
    Do not provide any introduction, explanation, or numbering.
    Each question must be on a new line.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // The response is a single string with newlines, so we split it.
    return responseText.split("\n").filter((q) => q.trim().length > 0);
  } catch (error) {
    console.error("Error fetching questions:", error);
    // This will now show the user-facing error message on the screen
    return [
      "Error fetching questions. Please check the console and your API key.",
    ];
  }
};

export const getRating = async (question, answer) => {
  try {
    const prompt = `Please act as a technical interviewer. Evaluate the user's answer to the following question.
    Provide a numerical rating from 1 to 10 and a concise suggestion for improvement.
    Your response MUST be in this exact format: "Rating: [number]/10 | Suggestion: [text]". Do not add any other text.

    Question: "${question}"
    Answer: "${answer}"`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const ratingMatch = responseText.match(/Rating:\s*(\d+)\/10/i);
    const suggestionMatch = responseText.match(/Suggestion:\s*(.*)/i);

    const rating = ratingMatch ? parseInt(ratingMatch[1], 10) : 0;
    const suggestion = suggestionMatch
      ? suggestionMatch[1].trim()
      : "No suggestion was provided.";

    return { rating, suggestion };
  } catch (error) {
    console.error("Error fetching rating:", error);
    return {
      rating: 0,
      suggestion: "Could not process the rating due to an error.",
    };
  }
};

export const getFinalFeedback = async (skill, scores) => {
  try {
    const prompt = `Provide a concise, encouraging performance review for a candidate who completed a ${skill} assessment.
    Their final score was ${scores.totalScore} out of a maximum of ${scores.maxScore}.
    Highlight their strengths based on their score and suggest general areas for improvement if the score is low.
    Keep the review to 2-3 sentences.`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Error fetching final feedback:", error);
    return "Could not generate final feedback due to an error.";
  }
};
