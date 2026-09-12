import React, { useState, useEffect } from "react";
import { X, BookOpen, Plus, Trash2, Calendar } from "lucide-react";

export default function JournalModal({ isOpen, onClose }) {
  const [entries, setEntries] = useState([]);
  const [currentText, setCurrentText] = useState("");
  const [currentTitle, setCurrentTitle] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    try {
      const saved = JSON.parse(localStorage.getItem("mindmate_journal_entries") || "[]");
      setEntries(saved);
    } catch {
      setEntries([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!currentText.trim()) return;
    const newEntry = {
      id: Date.now(),
      title: currentTitle.trim() || "Reflection",
      content: currentText.trim(),
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    const updated = [newEntry, ...entries];
    setEntries(updated);
    localStorage.setItem("mindmate_journal_entries", JSON.stringify(updated));
    setCurrentTitle("");
    setCurrentText("");
  };

  const handleDelete = (id) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    localStorage.setItem("mindmate_journal_entries", JSON.stringify(updated));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 border border-blue-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 shrink-0">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">
              Private Wellness Journal
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 shrink-0">
          🔒 Stored locally in your browser. Express your thoughts freely without judgement.
        </p>

        {/* Input */}
        <div className="space-y-2 mb-4 shrink-0">
          <input
            type="text"
            placeholder="Title (e.g. Grateful for today, Clearing my mind)..."
            value={currentTitle}
            onChange={(e) => setCurrentTitle(e.target.value)}
            className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            rows={4}
            placeholder="Write whatever is on your heart and mind..."
            value={currentText}
            onChange={(e) => setCurrentText(e.target.value)}
            className="w-full text-xs p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
          />
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={!currentText.trim()}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                currentText.trim()
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Plus className="w-3.5 h-3.5" /> Save Reflection
            </button>
          </div>
        </div>

        {/* Saved entries */}
        <div className="flex-1 overflow-y-auto pr-1 border-t border-gray-100 dark:border-gray-800 pt-3">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Past Reflections ({entries.length})
          </h4>
          {entries.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">
              Your journal is empty. Take a moment to write down what you feel today.
            </p>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <h5 className="font-semibold text-xs text-gray-800 dark:text-gray-200">
                      {entry.title}
                    </h5>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400">{entry.date}</span>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {entry.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
