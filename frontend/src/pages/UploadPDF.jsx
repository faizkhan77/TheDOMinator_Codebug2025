// src/pages/UploadPDF.jsx

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FileText, UploadCloud, X, Loader2 } from "lucide-react";
import Sidebar from "../components/Sidebar"; // Import the Sidebar

const UploadPDF = () => {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State for sidebar

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const onDrop = useCallback((acceptedFiles) => {
    const pdfFiles = acceptedFiles.filter(
      (file) => file.type === "application/pdf"
    );
    setFiles((prevFiles) => [...prevFiles, ...pdfFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
  });

  const removeFile = (fileName) => {
    setFiles(files.filter((file) => file.name !== fileName));
  };

  const handleUpload = async () => {
    // ... (handleUpload logic remains the same)
    if (files.length === 0) {
      setError("Please select at least one PDF file to upload.");
      return;
    }
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const token = localStorage.getItem("access");

    try {
      const response = await axios.post("/api/pdf-chat/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const { session_id } = response.data;
      if (session_id) {
        navigate(`/pdf-chat/${session_id}`);
      } else {
        setError("Failed to start a chat session. Please try again.");
      }
    } catch (err) {
      console.error("Upload error:", err.response?.data || err.message);
      setError(
        err.response?.data?.error ||
          "An error occurred during upload. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white">
      <div className="hidden md:flex">
        <Sidebar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      </div>

      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "md:ml-[256px]" : "md:ml-[80px]"
        }`}
      >
        <div className="flex flex-col items-center justify-center p-4 min-h-screen">
          <div className="w-full max-w-3xl bg-[#141414] p-8 rounded-2xl shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white">
                AI Document Chat
              </h1>
              <p className="text-gray-400 mt-2">
                Upload your PDFs to start an intelligent conversation.
              </p>
            </div>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
                            ${
                              isDragActive
                                ? "border-purple-400 bg-gray-900/50"
                                : "border-gray-700 hover:border-purple-500 hover:bg-gray-900/30"
                            }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center text-gray-400">
                <UploadCloud className="w-16 h-16 mb-4" />
                <p className="text-lg text-gray-300">
                  Drag & drop PDF files here, or click to select
                </p>
              </div>
            </div>

            {files.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4 text-white">
                  Ready to Upload:
                </h2>
                <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {files.map((file) => (
                    <li
                      key={file.name}
                      className="bg-[#0a0a0a] p-3 rounded-lg flex items-center justify-between animate-in fade-in"
                    >
                      <div className="flex items-center gap-3 text-gray-300">
                        <FileText className="w-6 h-6 text-purple-400" />
                        <span className="truncate">{file.name}</span>
                      </div>
                      <button
                        onClick={() => removeFile(file.name)}
                        className="text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {error && <p className="text-red-500 text-center mt-4">{error}</p>}

            <div className="mt-8 text-center">
              <button
                onClick={handleUpload}
                disabled={files.length === 0 || isUploading}
                className="w-full max-w-xs bg-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 hover:bg-purple-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Processing...
                  </span>
                ) : (
                  "Start Chat Session"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPDF;
