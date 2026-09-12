import React, { useState } from "react";
import { X, Eye, Hand, Volume2, Sparkles, Coffee, CheckCircle2, RotateCcw } from "lucide-react";

export default function GroundingModal({ isOpen, onClose }) {
  const steps = [
    {
      count: 5,
      title: "5 things you can SEE",
      desc: "Look around you. Notice five distinct objects, colors, or textures.",
      icon: Eye,
      color: "text-blue-500 bg-blue-50 dark:bg-blue-950/40",
    },
    {
      count: 4,
      title: "4 things you can TOUCH",
      desc: "Feel the texture of your clothes, the desk, the floor under your feet, or your phone.",
      icon: Hand,
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      count: 3,
      title: "3 things you can HEAR",
      desc: "Listen closely. Can you hear clock ticking, distant traffic, or your own breath?",
      icon: Volume2,
      color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40",
    },
    {
      count: 2,
      title: "2 things you can SMELL",
      desc: "Breathe in gently. Notice any scent in the room, soap, coffee, or fresh air.",
      icon: Sparkles,
      color: "text-purple-500 bg-purple-50 dark:bg-purple-950/40",
    },
    {
      count: 1,
      title: "1 thing you can TASTE",
      desc: "Take a sip of water, notice the lingering taste in your mouth, or savor a mint.",
      icon: Coffee,
      color: "text-rose-500 bg-rose-50 dark:bg-rose-950/40",
    },
  ];

  const [completed, setCompleted] = useState({});

  if (!isOpen) return null;

  const toggleStep = (idx) => {
    setCompleted((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const completedCount = Object.values(completed).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 border border-emerald-100 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <span className="text-xl">🍃</span>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">
              5-4-3-2-1 Grounding Method
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Anchor your thoughts into the present moment by engaging all 5 senses.
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mb-5 overflow-hidden">
          <div
            className="bg-emerald-500 h-2 transition-all duration-300 rounded-full"
            style={{ width: `${(completedCount / 5) * 100}%` }}
          />
        </div>

        {/* Steps List */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isDone = !!completed[idx];
            return (
              <div
                key={idx}
                onClick={() => toggleStep(idx)}
                className={`flex items-start gap-3.5 p-3.5 rounded-2xl border transition cursor-pointer select-none ${
                  isDone
                    ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
                    : "bg-white dark:bg-gray-800/60 border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${step.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4
                    className={`font-semibold text-sm ${
                      isDone
                        ? "line-through text-gray-400 dark:text-gray-500"
                        : "text-gray-800 dark:text-gray-100"
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                <div className="shrink-0 mt-0.5">
                  <CheckCircle2
                    className={`w-5 h-5 transition ${
                      isDone
                        ? "text-emerald-500 fill-emerald-100 dark:fill-emerald-950"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setCompleted({})}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset all
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-semibold shadow-sm transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
