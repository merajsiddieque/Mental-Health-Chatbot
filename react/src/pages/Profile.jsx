import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  User,
  Mail,
  Camera,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Calendar,
  Sparkles,
  LogOut,
} from "lucide-react";

export default function Profile() {
  const user = auth.currentUser;
  const [userName, setUserName] = useState("");
  const [photo, setPhoto] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const email = user?.email;

  // Fetch Profile Data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!email) {
        setLoading(false);
        return;
      }
      try {
        const safeEmail = email.replace(/\//g, "_");
        const docRef = doc(db, "Profile", safeEmail);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserName(data.userName || user?.displayName || "");
          setPhoto(data.photo || "");
        } else {
          setUserName(user?.displayName || "");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [email, user]);

  // Image Upload (Base64 < 1MB)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert("⚠️ File too large. Please choose an image under 1 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      const base64SizeMB = (base64String.length * 3) / 4 / 1024 / 1024;
      if (base64SizeMB > 1) {
        alert("⚠️ Encoded image exceeds 1 MB. Please choose a smaller photo.");
        return;
      }
      setPhoto(base64String);
    };
    reader.readAsDataURL(file);
  };

  // Save Profile
  const handleSaveProfile = async () => {
    if (!email) return;
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const safeEmail = email.replace(/\//g, "_");
      const docRef = doc(db, "Profile", safeEmail);
      const existingDoc = await getDoc(docRef);
      const existingData = existingDoc.exists() ? existingDoc.data() : {};

      const finalPhoto = photo || existingData.photo || "";

      const updatedData = {
        userName: userName.trim() || existingData.userName || "User",
        photo: finalPhoto,
        emailid: email,
        updatedAt: new Date(),
      };

      await setDoc(docRef, updatedData, { merge: true });
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3500);
    } catch (err) {
      console.error("Error saving profile:", err);
      setError("Failed to save profile: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#f8f8fc] dark:bg-[#0f1017] flex items-center justify-center text-sm font-medium text-gray-500">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#f8f8fc] dark:bg-[#0f1017] flex items-center justify-center p-4 transition-colors duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#151722] rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
        {/* Top Header */}
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

        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          Account Settings
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          Manage your personal profile and care preferences.
        </p>

        {/* Status Messages */}
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

        {/* Profile Avatar Card */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            <img
              src={
                photo ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
              }
              alt="Profile avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100 dark:border-indigo-900/60 shadow-md"
            />
            <label
              htmlFor="photoUpload"
              className="absolute bottom-0 right-0 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full cursor-pointer shadow-md transition active:scale-95"
              title="Upload new avatar"
            >
              <Camera className="w-3.5 h-3.5" />
            </label>
            <input
              id="photoUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
          <span className="text-[11px] text-gray-400 dark:text-gray-500 mt-2">
            Click camera icon to change photo (Max 1 MB)
          </span>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Display Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={email || "Guest User (Not logged in)"}
                disabled
                className="w-full text-xs pl-10 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Account Security Badge */}
          <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="font-semibold">Confidential Cloud Encryption</span>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
              Protected
            </span>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={saving || !user}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white rounded-2xl text-xs font-semibold shadow-md shadow-indigo-500/20 transition active:scale-[0.98] disabled:opacity-60"
          >
            {saving ? "Saving Changes..." : "Save Profile"}
          </button>
        </div>

        {/* Footer actions */}
        {user ? (
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
            <button
              onClick={() => navigate("/reset-password")}
              className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              Change Password
            </button>
            <button
              onClick={async () => {
                await auth.signOut();
                navigate("/auth");
              }}
              className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium hover:underline"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        ) : (
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
            <button
              onClick={() => navigate("/auth")}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Sign in to enable profile synchronization
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
