import React, { useState } from "react";
import { X, BookOpen, Sun, Moon, Wind, Heart, Sparkles } from "lucide-react";

export default function ResourcesModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("anxiety");

  if (!isOpen) return null;

  const content = {
    anxiety: [
      {
        title: "TIPP Skill for Rapid De-escalation",
        text: "Temperature (splash cold water on your face), Intense exercise (jumping jacks for 1 min), Paced breathing (inhale 4s, exhale 6s), Paired muscle relaxation.",
      },
      {
        title: "The Worry Time Technique",
        text: "Designate 15 minutes a day as your official 'Worry Time'. If a worry comes outside this window, write it down and postpone thinking about it until your scheduled worry session.",
      },
      {
        title: "Challenge Catastrophic Thinking",
        text: "Ask yourself: 1) What is the absolute worst that could happen? 2) What is the most likely outcome? 3) How have I survived similar moments in the past?",
      },
    ],
    sleep: [
      {
        title: "The 10-3-2-1-0 Rule for Deep Rest",
        text: "10 hours before bed: No caffeine. 3 hours before bed: No food or alcohol. 2 hours before bed: No work. 1 hour before bed: No screens. 0: The number of times you hit snooze in the morning.",
      },
      {
        title: "Cognitive Shuffle",
        text: "Pick a random soothing word (e.g., BEDTIME). Think of 3 words starting with B (Boat, Bear, Breeze), then E, and so on. This disengages analytic brain loops and induces sleep.",
      },
    ],
    affirmations: [
      {
        title: "Daily Mantras for Difficult Days",
        text: "• 'I am doing the best I can with the tools I have today.'\n• 'This feeling is a visitor, not a resident. It will pass.'\n• 'My productivity does not define my worth.'\n• 'It is brave to pause and take care of myself.'",
      },
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 border border-indigo-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">
              Mental Wellness Resources
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab buttons */}
        <div className="flex items-center gap-2 mb-4 shrink-0">
          <button
            onClick={() => setActiveTab("anxiety")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              activeTab === "anxiety"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Anxiety & Stress
          </button>
          <button
            onClick={() => setActiveTab("sleep")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              activeTab === "sleep"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Sleep & Rest
          </button>
          <button
            onClick={() => setActiveTab("affirmations")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              activeTab === "affirmations"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Affirmations
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {content[activeTab].map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60"
            >
              <h4 className="font-semibold text-xs text-gray-900 dark:text-gray-100 mb-1.5">
                {item.title}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
