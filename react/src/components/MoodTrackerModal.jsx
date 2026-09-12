import React, { useState, useEffect } from "react";
import { X, Smile, Calendar, Trash2 } from "lucide-react";

const MOODS = [
  { label: "Great", emoji: "😄", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  { label: "Good", emoji: "😊", color: "bg-teal-50 text-teal-600 border-teal-200" },
  { label: "Okay", emoji: "😐", color: "bg-amber-50 text-amber-600 border-amber-200" },
  { label: "Sad", emoji: "😢", color: "bg-blue-50 text-blue-600 border-blue-200" },
  { label: "Anxious", emoji: "😰", color: "bg-purple-50 text-purple-600 border-purple-200" },
  { label: "Overwhelmed", emoji: "😫", color: "bg-rose-50 text-rose-600 border-rose-200" },
];

export default function MoodTrackerModal({ isOpen, onClose }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    try {
      const saved = JSON.parse(localStorage.getItem("mindmate_mood_history") || "[]");
      setHistory(saved);
    } catch {
      setHistory([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!selectedMood) return;
    const entry = {
      id: Date.now(),
      mood: selectedMood.label,
      emoji: selectedMood.emoji,
      note: note.trim(),
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    const updated = [entry, ...history.slice(0, 19)];
    setHistory(updated);
    localStorage.setItem("mindmate_mood_history", JSON.stringify(updated));
    setSelectedMood(null);
    setNote("");
  };

  const handleDelete = (id) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem("mindmate_mood_history", JSON.stringify(updated));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 border border-amber-100 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Smile className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">
              Daily Mood Tracker
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          How are you feeling right now? Logging builds self-awareness.
        </p>

        {/* Mood selection grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {MOODS.map((m) => (
            <button
              key={m.label}
              onClick={() => setSelectedMood(m)}
              className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                selectedMood?.label === m.label
                  ? "border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 ring-2 ring-indigo-500 shadow-sm"
                  : "border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60"
              }`}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                {m.label}
              </span>
            </button>
          ))}
        </div>

        {/* Note input */}
        <input
          type="text"
          placeholder="Add a quick note (e.g. good walk, work stress)..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
        />

        <button
          onClick={handleSave}
          disabled={!selectedMood}
          className={`w-full py-2.5 rounded-xl font-medium text-xs transition shadow-sm ${
            selectedMood
              ? "bg-indigo-600 hover:bg-indigo-700 text-white"
              : "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
          }`}
        >
          Save Entry
        </button>

        {/* History */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5" /> Recent Logs
          </div>
          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {history.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-2">
                No logs yet. Select a mood to record your first entry!
              </p>
            ) : (
              history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-xs group"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-lg">{h.emoji}</span>
                    <div className="overflow-hidden">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {h.mood}
                      </span>
                      {h.note && (
                        <p className="text-gray-500 truncate max-w-[12rem]">
                          {h.note}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-gray-400">{h.date}</span>
                    <button
                      onClick={() => handleDelete(h.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
