import React, { useState } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Heart, Mail, Lock, ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff, Sparkles } from "lucide-react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (isLogin) {
        // 🟢 Login Flow
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
          setError("Please verify your email before logging in. Check your inbox for the link.");
          await auth.signOut();
          setLoading(false);
          return;
        }

        navigate("/");
      } else {
        // 🟣 Signup Flow
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);

        setMessage(
          "Account created! We've sent a verification link to your email. Please verify your address before logging in."
        );
        await auth.signOut();
      }
    } catch (err) {
      setError(err.message.replace("Firebase:", "").trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8f8fc] dark:bg-[#0f1017] flex items-center justify-center p-4 transition-colors duration-200">
      <div className="w-full max-w-4xl bg-white dark:bg-[#151722] rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Form Section */}
        <div className="p-8 lg:p-10 flex flex-col justify-between">
          <div>
            {/* Brand */}
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <span className="font-extrabold text-lg text-gray-900 dark:text-white tracking-tight">
                MindMate
              </span>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {isLogin ? "Welcome back" : "Create your safe space"}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              {isLogin
                ? "Sign in to access your chat history and personalized care."
                : "Join MindMate for a supportive, confidential wellness companion."}
            </p>

            {/* Error / Success Banners */}
            {error && (
              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {message && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{message}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full text-xs pl-10 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => navigate("/reset-password")}
                      className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full text-xs pl-10 pr-10 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white rounded-2xl text-xs font-semibold shadow-md shadow-indigo-500/20 transition active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
              </button>
            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Chat
            </button>

            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setMessage("");
              }}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              {isLogin ? "Need an account? Sign Up" : "Already registered? Sign In"}
            </button>
          </div>
        </div>

        {/* Right Calming Illustration / Banner Section */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white relative overflow-hidden">
          {/* Subtle background circles */}
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-center gap-2 text-indigo-200 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-300" /> Empathetic AI Companion
          </div>

          <div className="relative z-10 space-y-4 my-auto">
            <h3 className="text-3xl font-extrabold leading-tight tracking-tight">
              “Healing takes time, and you don’t have to carry it alone.”
            </h3>
            <p className="text-xs text-indigo-100/90 leading-relaxed max-w-sm">
              MindMate is here to listen, offer coping techniques, and provide accessible communication through text and real-time sign language.
            </p>
          </div>

          <div className="relative z-10 text-[11px] text-indigo-200/80">
            🔒 Private, confidential, and safe.
          </div>
        </div>
      </div>
    </div>
  );
}
