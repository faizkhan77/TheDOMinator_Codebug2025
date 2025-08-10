// src/components/WebcamToggle.jsx

import React from "react";
import { Video, VideoOff } from "lucide-react";

const WebcamToggle = ({ isOn, onToggle }) => {
  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm font-medium text-gray-300">Webcam</span>
      <button
        onClick={onToggle}
        className={`relative inline-flex items-center h-7 w-12 rounded-full transition-colors duration-300 focus:outline-none ${
          isOn ? "bg-green-500" : "bg-gray-600"
        }`}
      >
        <span
          className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-300 ${
            isOn ? "translate-x-6" : "translate-x-1"
          }`}
        />
        <div className="absolute inset-0 flex items-center justify-between px-1.5">
          <Video
            size={16}
            className={`text-green-900 transition-opacity ${
              isOn ? "opacity-100" : "opacity-0"
            }`}
          />
          <VideoOff
            size={16}
            className={`text-gray-900 transition-opacity ${
              !isOn ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
      </button>
    </div>
  );
};

export default WebcamToggle;
