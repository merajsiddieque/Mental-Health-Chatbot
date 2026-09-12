import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision";
import { Camera, CheckCircle2, RefreshCw, Hand, Sparkles } from "lucide-react";

export default function SignInput({ onReply }) {
  const webcamRef = useRef(null);
  const recognizerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [lastGesture, setLastGesture] = useState(null);
  const [cameraActive, setCameraActive] = useState(true);

  // cooldown to stop repeated triggers
  const cooldownRef = useRef(false);

  const gestureToIntent = {
    Palm: "Hello! I’m here to communicate through sign language. 👋",
    Fist: "I’m feeling tense or stressed right now. ✊",
    Thumb_Up: "Yes, I agree or I’m feeling okay. 👍",
    Thumb_Down: "No, I don’t agree or I feel sad. 👎",
    Victory: "I’m feeling peaceful or I’ve achieved something. ✌️",
    Pointing_Up: "I have a question or I want to say something. ☝️",
    ILoveYou: "I appreciate your help and care. 🤟",
    Open_Pinch: "Something small is bothering me. 🤏",
    Closed_Pinch: "I want to share something important. 🤏",
    None: "No gesture detected.",
  };

  useEffect(() => {
    async function loadModel() {
      try {
        const vision = await FilesetResolver.forVisionTasks("/mediapipe");
        const recognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: { modelAssetPath: "/mediapipe/gesture_recognizer.task" },
          runningMode: "VIDEO",
          numHands: 2,
        });

        recognizerRef.current = recognizer;
        setLoading(false);
      } catch (err) {
        console.error("❌ Failed to load model:", err);
        setLoading(false);
      }
    }
    loadModel();
  }, []);

  useEffect(() => {
    let rafId;

    const detect = () => {
      const video = webcamRef.current?.video;

      if (!recognizerRef.current || !video || video.readyState < 2) {
        rafId = requestAnimationFrame(detect);
        return;
      }

      const now = performance.now();
      const result = recognizerRef.current.recognizeForVideo(video, now);
      const gestures = result?.gestures || [];

      if (gestures.length > 0) {
        const topGesture = gestures[0][0].categoryName;

        if (!cooldownRef.current && topGesture !== lastGesture && topGesture !== "None") {
          cooldownRef.current = true;
          setLastGesture(topGesture);

          const interpreted =
            gestureToIntent[topGesture] ||
            `User performed gesture: ${topGesture}`;

          // Non-blocking backend call
          const apiUrl =
            import.meta.env.VITE_API_URL ||
            (import.meta.env.DEV ? "http://localhost:5000" : "");

          fetch(`${apiUrl}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: interpreted }),
          })
            .then((res) => res.json())
            .then((data) => {
              const reply = data.reply || "I received your sign language gesture and I'm listening.";
              onReply?.({ gesture: topGesture, reply });
            })
            .catch((err) => console.error("❌ API error:", err))
            .finally(() => {
              setTimeout(() => {
                cooldownRef.current = false;
              }, 1400); // 1.4s cooldown
            });
        }
      }

      rafId = requestAnimationFrame(detect);
    };

    rafId = requestAnimationFrame(detect);
    return () => cancelAnimationFrame(rafId);
  }, [lastGesture, onReply]);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Webcam Frame */}
      <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-lg border-2 border-indigo-100 dark:border-indigo-900/60 bg-gray-900">
        <Webcam
          ref={webcamRef}
          mirrored
          audio={false}
          videoConstraints={{ facingMode: "user" }}
          className="w-full h-full object-cover"
        />

        {/* Top Status Overlay Badge */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 text-white text-[11px] font-semibold border border-white/10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{loading ? "Initializing Vision Engine..." : "Webcam Active"}</span>
        </div>

        {/* Live Detected Gesture Floating Card */}
        {lastGesture && (
          <div className="absolute bottom-3 inset-x-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-indigo-200 dark:border-indigo-800 text-center animate-fadeIn">
            <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
              Interpreted Gesture
            </span>
            <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">
              {gestureToIntent[lastGesture] || lastGesture}
            </p>
          </div>
        )}
      </div>

      {/* Under Camera Hint */}
      <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center mt-3 flex items-center justify-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        Hold your hand clearly in front of the camera to express a gesture.
      </p>
    </div>
  );
}
