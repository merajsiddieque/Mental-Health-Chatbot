import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory, fallback to current working directory
dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Helper to get Google Gemini API key
const getGoogleApiKey = () => {
  const rawKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";
  const key = rawKey.trim().replace(/^["']|["']$/g, "").trim();
  if (!key || key === "your_google_api_key_here") {
    return null;
  }
  return key;
};

// System prompt for empathetic mental health responses
const SYSTEM_INSTRUCTION = `You are a kind, empathetic mental health support chatbot.
Your tone is empathetic, calm, and supportive.
Respond in short, simple sentences (1–3 lines max).
Use kind and understanding words.
If the user sounds sad or anxious, comfort them gently.
Avoid robotic or formal tone.`;

const googleApiKey = getGoogleApiKey();
if (googleApiKey) {
  console.log("✅ Google Gemini AI initialized using environment variable");
} else {
  console.warn("⚠️ GOOGLE_API_KEY / GEMINI_API_KEY not found in environment or .env file!");
  console.warn("   Add GOOGLE_API_KEY to your .env file or Render Dashboard -> Environment Variables.");
}

// ✅ Health Check
app.get("/api", (req, res) => {
  const key = getGoogleApiKey();
  res.json({
    status: "online",
    message: "🧠 Mental Health Chatbot API is running successfully!",
    googleApiKeyConfigured: Boolean(key),
    model: "gemini-3.5-flash-lite",
  });
});

// Helper to generate response with model fallback and fast timeouts
async function generateGeminiReply(genAI, message) {
  // Ordered by speed: ultra-low latency Flash-Lite models first (~1s response time)
  const models = [
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-3.6-flash",
    "gemini-flash-latest",
  ];
  let lastError = null;

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.7,
        },
      });

      // 6-second timeout per model to give headroom for cloud network latency
      const generatePromise = model.generateContent(message);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out (exceeded 6s)")), 6000)
      );

      const result = await Promise.race([generatePromise, timeoutPromise]);
      const text = result?.response?.text();
      if (text) {
        return text.trim();
      }
    } catch (err) {
      lastError = err;
      console.warn(`⚠️ Model ${modelName} failed (${err.message}), trying next...`);
    }
  }

  throw lastError || new Error("Failed to generate response from Google AI");
}

// ✅ Chat Endpoint
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const apiKey = getGoogleApiKey();
    if (!apiKey) {
      return res.status(500).json({
        error: "GOOGLE_API_KEY is not configured.",
        details: "Please set GOOGLE_API_KEY in your .env file or Render Dashboard environment variables.",
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const reply = await generateGeminiReply(genAI, message);

    res.json({
      reply: reply || "I'm here for you. Can you tell me more about what’s going on?",
    });
  } catch (error) {
    console.error("❌ Chat API Error:", error.message);

    const apiKey = getGoogleApiKey();
    if (!apiKey) {
      return res.status(500).json({
        error: "GOOGLE_API_KEY is not configured.",
        details: "Please set GOOGLE_API_KEY in your .env file or Render Dashboard environment variables.",
      });
    }

    // Graceful empathetic fallbacks so chat never breaks during momentary rate limits or timeouts
    const empatheticFallbacks = [
      "I hear you, and what you're going through sounds really painful. Take a gentle, deep breath—I am right here with you.",
      "I'm listening closely to you. Please know that your feelings are completely valid and you don't have to face this alone. Would you like to share a bit more?",
      "I'm so sorry you have to experience this heartache. Breakups and goodbyes are so difficult. Be gentle with yourself today.",
      "Take your time. I am right by your side, and whatever you are feeling is okay. I'm here whenever you want to talk.",
    ];
    const reply = empatheticFallbacks[Math.floor(Math.random() * empatheticFallbacks.length)];
    return res.json({ reply });
  }
});

// ✅ Serve React frontend (for Render)
app.use(express.static(path.join(__dirname, "../react/dist")));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../react/dist/index.html"));
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
  console.log(`🔑 Google Gemini API key: ${getGoogleApiKey() ? "CONFIGURED" : "MISSING (Set GOOGLE_API_KEY in Render environment variables)"}`);
});
