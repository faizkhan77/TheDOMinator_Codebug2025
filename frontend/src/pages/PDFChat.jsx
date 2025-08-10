// src/pages/PDFChat.jsx

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { SendHorizonal, Bot, User, FileText, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Sidebar from "../components/Sidebar";

const PDFChat = () => {
  const { sessionId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const [pdfFiles, setPdfFiles] = useState([]);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState(null);
  const [isLoadingPdfs, setIsLoadingPdfs] = useState(true);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Fetch the list of PDFs for this session
  useEffect(() => {
    const fetchPdfs = async () => {
      setIsLoadingPdfs(true);
      try {
        const token = localStorage.getItem("access");
        const response = await axios.get(`/api/pdf-chat/${sessionId}/files/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPdfFiles(response.data);
        if (response.data.length > 0) {
          setSelectedPdfUrl(response.data[0].url);
        }
      } catch (error) {
        console.error("Failed to fetch PDF files:", error);
      } finally {
        setIsLoadingPdfs(false);
      }
    };

    fetchPdfs();

    setMessages([
      {
        sender: "ai",
        text: `Hello! I'm ready to answer questions about your documents. What would you like to know?`,
      },
    ]);
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("access");
      const response = await axios.post(
        `/api/pdf-chat/${sessionId}/ask/`,
        {
          question: input,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const aiMessage = { sender: "ai", text: response.data.answer };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error asking question:", error);
      const errorMessage = {
        sender: "ai",
        text: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const TypingIndicator = () => (
    <div className="flex items-start gap-4 animate-in fade-in">
      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
        <Bot size={20} className="text-white" />
      </div>
      <div className="p-4 rounded-xl bg-[#1c1c22] rounded-bl-none flex items-center space-x-1.5">
        <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
        <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
        <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></span>
      </div>
    </div>
  );

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <div className="hidden md:flex">
        <Sidebar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      </div>

      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "md:ml-[256px]" : "md:ml-[80px]"
        }`}
      >
        {/* Main content container with flex layout */}
        <div className="flex w-full h-screen">
          {/* ===== CHAT INTERFACE (Left Side) ===== */}
          <div className="flex flex-col flex-1 bg-[#0a0a0a]">
            <header className="bg-[#141414]/80 backdrop-blur-sm border-b border-gray-700 p-4 text-center sticky top-0 z-10">
              <h1 className="text-xl font-bold text-white">Document Chat</h1>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-4 animate-in fade-in ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.sender === "ai" && (
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                        <Bot size={20} className="text-white" />
                      </div>
                    )}
                    <div
                      className={`p-4 rounded-xl max-w-lg text-white ${
                        msg.sender === "user"
                          ? "bg-indigo-600 rounded-br-none"
                          : "bg-[#1c1c22] rounded-bl-none"
                      }`}
                    >
                      <div className="prose prose-invert prose-p:my-0">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    </div>
                    {msg.sender === "user" && (
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <User size={20} className="text-white" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            </main>

            <footer className="p-4">
              <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question about your documents..."
                    disabled={isLoading}
                    className="w-full bg-[#0a0a0a] border border-gray-600 rounded-lg py-3 pl-4 pr-14 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                  >
                    <SendHorizonal size={20} className="text-white" />
                  </button>
                </div>
              </form>
            </footer>
          </div>

          {/* ===== PDF VIEWER (Right Side) - UPDATED FOR RESPONSIVENESS ===== */}
          <div
            className="
                        hidden md:flex flex-col 
                        md:w-1/3 lg:max-w-sm xl:max-w-md /* <-- Adjusted width */
                        border-l border-gray-700 bg-[#141414]
                    "
          >
            <div className="p-4 border-b border-gray-700">
              <h2 className="font-semibold text-white">Uploaded Documents</h2>
            </div>

            <div className="flex-shrink-0 p-2 space-y-2 overflow-y-auto border-b border-gray-700">
              {isLoadingPdfs ? (
                <div className="flex items-center justify-center p-4 text-gray-400">
                  <Loader2 className="animate-spin mr-2" /> Loading files...
                </div>
              ) : (
                pdfFiles.map((pdf) => (
                  <button
                    key={pdf.id}
                    onClick={() => setSelectedPdfUrl(pdf.url)}
                    className={`w-full text-left flex items-center gap-3 p-2 rounded-md transition-colors ${
                      selectedPdfUrl === pdf.url
                        ? "bg-purple-600/50 text-white"
                        : "text-gray-300 hover:bg-gray-700/50"
                    }`}
                  >
                    <FileText size={18} className="flex-shrink-0" />
                    <span className="truncate text-sm">{pdf.filename}</span>
                  </button>
                ))
              )}
            </div>

            <div className="flex-1 bg-gray-900">
              {selectedPdfUrl ? (
                <iframe
                  src={selectedPdfUrl}
                  className="w-full h-full border-none"
                  title="PDF Viewer"
                ></iframe>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>Select a document to view</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFChat;
