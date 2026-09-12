import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SignInput from "./SignInput";
import {
  Heart,
  ArrowLeft,
  Moon,
  Sun,
  Hand,
  CheckCheck,
  Sparkles,
  Info,
} from "lucide-react";

export default function ChatbotSignMode() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: "bot",
      text: "👋 Hello! I am here and ready to communicate through sign language. Show a gesture to begin.",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("mindmate_dark_mode") === "true";
  });

  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  // Sync dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("mindmate_dark_mode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("mindmate_dark_mode", "false");
    }
  }, [darkMode]);

  const handleReply = ({ gesture, reply }) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), from: "user", text: `Gesture: ${gesture}`, time: timeStr },
      { id: Date.now() + 1, from: "bot", text: reply, time: timeStr },
    ]);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const gestureGuide = [
    { name: "Palm (👋)", meaning: "Greeting / Hello" },
    { name: "Fist (✊)", meaning: "Feeling tense or stressed" },
    { name: "Thumb Up (👍)", meaning: "Feeling okay / Agree" },
    { name: "Thumb Down (👎)", meaning: "Feeling sad / Disagree" },
    { name: "Victory (✌️)", meaning: "Peaceful / Overcame something" },
    { name: "Pointing Up (☝️)", meaning: "I have a question" },
    { name: "I Love You (🤟)", meaning: "Care & appreciation" },
    { name: "Pinch (🤏)", meaning: "Important thought / Concern" },
  ];

  return (
    <div className="h-screen w-full bg-[#f8f8fc] dark:bg-[#0f1017] flex flex-col transition-colors duration-200 overflow-hidden font-sans">
      {/* Top Bar */}
      <header className="h-16 px-6 border-b border-gray-100 dark:border-gray-800/80 bg-white/80 dark:bg-[#13141f]/80 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Chat
          </button>

          <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Hand className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-gray-900 dark:text-gray-100 leading-tight">
                Sign Language Mode
              </h2>
              <p className="text-[11px] text-purple-600 dark:text-purple-400">
                Real-Time Gesture AI
              </p>
            </div>
          </div>
        </div>

        {/* Dark/Light mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          {darkMode ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Dark Mode</span>
            </>
          )}
        </button>
      </header>

      {/* Main Workspace: 2-Column Desktop Grid */}
      <div className="flex-1 overflow-hidden p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto w-full">
        {/* Left Column: Camera + Gesture Cheat-sheet (7 cols) */}
        <div className="lg:col-span-7 flex flex-col overflow-y-auto space-y-4 pr-1">
          {/* Camera Card */}
          <div className="bg-white dark:bg-[#151722] rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Webcam Gesture Feed
              </span>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                MediaPipe Vision
              </span>
            </div>

            <SignInput onReply={handleReply} />
          </div>

          {/* Gesture Dictionary / Cheat Sheet */}
          <div className="bg-white dark:bg-[#151722] rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-indigo-600 dark:text-indigo-400">
              <Info className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Recognized Sign Gestures
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {gestureGuide.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 text-center"
                >
                  <p className="font-bold text-xs text-gray-800 dark:text-gray-200">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                    {item.meaning}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Conversation Log (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#151722] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Live Sign Conversation
            </h3>
            <span className="text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded-full font-semibold">
              Live Translation
            </span>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {messages.map((msg) =>
              msg.from === "user" ? (
                <div key={msg.id} className="flex justify-end animate-fadeIn">
                  <div className="flex flex-col items-end max-w-xs">
                    <div className="bg-[#635bff] text-white px-4 py-2.5 rounded-2xl rounded-tr-xs text-xs font-medium shadow-sm">
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 mr-1">
                      {msg.time}
                    </span>
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="flex items-start gap-2.5 animate-fadeIn">
                  <div className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 text-xs font-bold">
                    🤖
                  </div>
                  <div className="flex flex-col items-start max-w-sm">
                    <div className="bg-gray-50 dark:bg-gray-800/80 text-gray-800 dark:text-gray-100 px-4 py-3 rounded-2xl rounded-tl-xs text-xs leading-relaxed border border-gray-100 dark:border-gray-700/50 shadow-xs">
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 ml-1">
                      {msg.time}
                    </span>
                  </div>
                </div>
              )
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 text-center shrink-0">
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              Gestures are automatically detected and replied to by the AI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
