import React, { useState, useEffect } from "react";
import { X, Play, Pause, RotateCcw, Heart } from "lucide-react";

export default function BreathingModal({ isOpen, onClose }) {
  const [phase, setPhase] = useState("Inhale"); // Inhale, Hold, Exhale, Rest
  const [count, setCount] = useState(4);
  const [isActive, setIsActive] = useState(true);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (!isOpen || !isActive) return;

    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev > 1) return prev - 1;

        // Transition phase
        if (phase === "Inhale") {
          setPhase("Hold");
          return 4;
        } else if (phase === "Hold") {
          setPhase("Exhale");
          return 4;
        } else if (phase === "Exhale") {
          setPhase("Rest");
          return 4;
        } else {
          setPhase("Inhale");
          setCycles((c) => c + 1);
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isActive, phase]);

  if (!isOpen) return null;

  const phaseInstruction = {
    Inhale: "Breathe in deeply through your nose...",
    Hold: "Gently hold your breath...",
    Exhale: "Slowly exhale out through your mouth...",
    Rest: "Pause and relax before next breath...",
  };

  const circleScale =
    phase === "Inhale"
      ? "scale-125 transition-all duration-[4000ms] ease-in-out"
      : phase === "Hold"
      ? "scale-125"
      : phase === "Exhale"
      ? "scale-75 transition-all duration-[4000ms] ease-in-out"
      : "scale-75";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 border border-indigo-100 dark:border-gray-800 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-indigo-200/40 dark:bg-indigo-900/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-purple-200/40 dark:bg-purple-900/30 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Heart className="w-5 h-5 fill-indigo-500 text-indigo-500" />
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">
              Box Breathing
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Calm your nervous system with 4-4-4-4 rhythm.
        </p>

        {/* Interactive Breathing Visualizer */}
        <div className="relative flex items-center justify-center my-6 h-56">
          {/* Outer ripples */}
          <div className="absolute w-44 h-44 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 animate-ping opacity-25 pointer-events-none" />
          <div
            className={`w-40 h-40 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex flex-col items-center justify-center text-white shadow-xl shadow-indigo-500/25 ${circleScale}`}
          >
            <span className="text-3xl font-extrabold tracking-tight">
              {count}
            </span>
            <span className="text-xs font-semibold tracking-wider uppercase opacity-90 mt-1">
              {phase}
            </span>
          </div>
        </div>

        {/* Phase instruction */}
        <p className="text-base font-medium text-gray-700 dark:text-gray-200 h-8 flex items-center justify-center">
          {phaseInstruction[phase]}
        </p>

        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          Cycles completed: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{cycles}</span>
        </p>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setIsActive((v) => !v)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium text-sm shadow-md shadow-indigo-500/20 transition"
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4" /> Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Resume
              </>
            )}
          </button>
          <button
            onClick={() => {
              setPhase("Inhale");
              setCount(4);
              setCycles(0);
              setIsActive(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full font-medium text-sm transition"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}
