import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision";

export default function SignInput({ onReply }) {
  const webcamRef = useRef(null);
  const recognizerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [lastGesture, setLastGesture] = useState(null);

  // cooldown to stop repeated triggers
  const cooldownRef = useRef(false);

  const gestureToIntent = {
    Palm: "Hello! I’m here to communicate through sign language.",
    Fist: "I’m feeling tense or stressed right now.",
    Thumb_Up: "Yes, I agree or I’m feeling okay.",
    Thumb_Down: "No, I don’t agree or I feel sad.",
    Victory: "I’m feeling peaceful or I’ve achieved something.",
    Pointing_Up: "I have a question or I want to say something.",
    ILoveYou: "I appreciate your help and care.",
    Open_Pinch: "Something small is bothering me.",
    Closed_Pinch: "I want to share something important.",
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

        if (!cooldownRef.current && topGesture !== lastGesture) {
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
              const reply = data.reply || "🤖 No reply";
              onReply?.({ gesture: topGesture, reply });
            })
            .catch((err) => console.error("❌ API error:", err))
            .finally(() => {
              setTimeout(() => {
                cooldownRef.current = false;
              }, 1200); // 1.2s
            });
        }
      }

      rafId = requestAnimationFrame(detect);
    };

    rafId = requestAnimationFrame(detect);
    return () => cancelAnimationFrame(rafId);
  }, [lastGesture, onReply]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-full max-w-md border rounded-lg overflow-hidden shadow">
        <Webcam
          ref={webcamRef}
          mirrored
          audio={false}
          videoConstraints={{ facingMode: "user" }}
          className="w-full h-64 object-cover"
        />
      </div>

      <div className="text-center mt-2">
        {loading ? (
          <p className="text-gray-500">Loading MediaPipe...</p>
        ) : lastGesture ? (
          <p className="text-green-600 font-semibold">
            ✋ {gestureToIntent[lastGesture] || lastGesture}
          </p>
        ) : (
          <p className="text-gray-500">Show a gesture to start</p>
        )}
      </div>
    </div>
  );
}
