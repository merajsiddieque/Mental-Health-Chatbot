import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  ArrowLeft,
  HelpCircle,
  Mail,
  Linkedin,
  Github,
  ChevronDown,
  ShieldCheck,
  Sparkles,
  Hand,
} from "lucide-react";

export default function Help() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: "How does MindMate protect my privacy?",
      a: "MindMate never sells your data. All chat interactions are processed securely and encrypted. Your journal notes and mood logs remain in your private browser storage.",
    },
    {
      q: "How does the Sign Language mode work?",
      a: "Using Google MediaPipe computer vision via your webcam, MindMate detects hand gestures (such as Palm, Fist, Thumbs Up/Down, I Love You) and interprets them into empathetic communication in real time.",
    },
    {
      q: "Can MindMate replace professional therapy?",
      a: "No. MindMate is an emotional support and wellness companion designed to offer grounding exercises and comfort. In a crisis or medical emergency, please use our Crisis Helplines or reach out to a certified professional.",
    },
    {
      q: "How do I switch between Light and Dark mode?",
      a: "Click the Sun/Moon icon in the top header on any page to switch seamlessly between serene Light mode and calming Dark mode.",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#f8f8fc] dark:bg-[#0f1017] flex items-center justify-center p-4 transition-colors duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-[#151722] rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 lg:p-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Chat
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Heart className="w-4 h-4 fill-white" />
            </div>
            <span className="font-bold text-sm text-gray-900 dark:text-white">
              MindMate
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Help & Frequently Asked Questions
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Guidance and resources for your wellness journey.
            </p>
          </div>
        </div>

        {/* FAQs accordion */}
        <div className="space-y-3 my-6">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden bg-gray-50/70 dark:bg-gray-800/40 transition"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left text-xs font-semibold text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ml-2 ${
                    openFaq === idx ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-gray-700/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Creator Info & Contact */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/40 mt-6">
          <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-1">
            Developed with Care by Meraj Alam Siddique
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
            MindMate was created to bridge accessibility and compassionate AI support for mental well-being.
          </p>

          <div className="flex flex-wrap gap-2.5">
            <a
              href="mailto:merajsiddieque@gmail.com"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-semibold shadow-xs hover:shadow-sm transition"
            >
              <Mail className="w-3.5 h-3.5" /> Email Developer
            </a>
            <a
              href="https://www.linkedin.com/in/merajsiddieque"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-semibold shadow-xs hover:shadow-sm transition"
            >
              <Linkedin className="w-3.5 h-3.5" /> LinkedIn
            </a>
            <a
              href="https://github.com/merajsiddieque"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-semibold shadow-xs hover:shadow-sm transition"
            >
              <Github className="w-3.5 h-3.5" /> GitHub
            </a>
          </div>
        </div>

        <button
          onClick={() => navigate("/")}
          className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl text-xs shadow-md shadow-indigo-500/20 transition active:scale-[0.98]"
        >
          Return to Safe Space
        </button>
      </div>
    </div>
  );
}
