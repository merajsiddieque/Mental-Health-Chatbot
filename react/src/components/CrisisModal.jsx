import React from "react";
import { X, Phone, ShieldAlert, HeartHandshake, ExternalLink } from "lucide-react";

export default function CrisisModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const helplines = [
    {
      name: "Tele-MANAS (Govt of India)",
      desc: "24/7 Free Comprehensive Mental Health Tele-Care Service",
      contact: "14416 / 1800-891-4416",
      action: "tel:14416",
      badge: "India Toll-Free",
    },
    {
      name: "KIRAN Helpline",
      desc: "Mental health helpline by Ministry of Social Justice & Empowerment",
      contact: "1800-599-0019",
      action: "tel:18005990019",
      badge: "24/7 Available",
    },
    {
      name: "Vandrevala Foundation",
      desc: "Free 24/7 professional mental health counseling & crisis intervention",
      contact: "+91 9999 666 555",
      action: "tel:+919999666555",
      badge: "Confidential",
    },
    {
      name: "AASRA",
      desc: "Crisis intervention and suicide prevention helpline",
      contact: "+91 98204 66726",
      action: "tel:+919820466726",
      badge: "Crisis Support",
    },
    {
      name: "988 Suicide & Crisis Lifeline (US/Global)",
      desc: "Free, confidential support for people in suicidal crisis or emotional distress",
      contact: "Call or text 988",
      action: "tel:988",
      badge: "US & Canada",
    },
    {
      name: "Crisis Text Line",
      desc: "Text HOME to 741741 to connect with a volunteer crisis counselor 24/7",
      contact: "Text HOME to 741741",
      action: "sms:741741",
      badge: "Text Support",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 border border-rose-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">
              Crisis Support & Helplines
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice banner */}
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 rounded-2xl mb-4 shrink-0">
          <p className="text-xs text-rose-900 dark:text-rose-200 font-medium leading-relaxed">
            If you are in immediate danger of hurting yourself or others, please call your local emergency services (e.g. 112 / 911) or contact one of these free, confidential helplines immediately. You are never alone.
          </p>
        </div>

        {/* Helplines list */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {helplines.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700/60 hover:border-rose-200 dark:hover:border-rose-900/60 transition"
            >
              <div className="overflow-hidden pr-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-xs text-gray-900 dark:text-gray-100">
                    {item.name}
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300 font-medium">
                    {item.badge}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  {item.desc}
                </p>
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-1">
                  {item.contact}
                </p>
              </div>

              <a
                href={item.action}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
              >
                <Phone className="w-3.5 h-3.5" /> Call
              </a>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center shrink-0">
          <span className="text-[11px] text-gray-400">
            Available 24/7 • Free & Confidential
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
