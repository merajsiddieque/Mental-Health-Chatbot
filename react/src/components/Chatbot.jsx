import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import userIcon from "../assets/user-icon.jpg";
import { v4 as uuidv4 } from "uuid";
import { onAuthStateChanged, signOut } from "firebase/auth";
import List from "./List";

// Icons from lucide-react
import {
  Heart,
  Moon,
  Sun,
  BookOpen,
  Settings,
  Send,
  Paperclip,
  CheckCheck,
  Wind,
  Compass,
  Smile,
  Book,
  ShieldAlert,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Camera,
  Hand,
  User,
  LogOut,
  Key,
  Trash2,
  HelpCircle,
  Activity,
} from "lucide-react";

// Interactive Wellness Modals
import BreathingModal from "./BreathingModal";
import GroundingModal from "./GroundingModal";
import MoodTrackerModal from "./MoodTrackerModal";
import JournalModal from "./JournalModal";
import CrisisModal from "./CrisisModal";
import ResourcesModal from "./ResourcesModal";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatList, setChatList] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [user, setUser] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(userIcon);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Dark mode state - defaults to light mode unless explicitly enabled
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("mindmate_dark_mode") === "true";
  });

  // Active Modals
  const [modalType, setModalType] = useState(null); // 'breathing', 'grounding', 'mood', 'journal', 'crisis', 'resources'

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("mindmate_dark_mode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("mindmate_dark_mode", "false");
    }
  }, [darkMode]);

  // Track user + profile photo
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setProfilePhoto(userIcon);
        return;
      }

      const safeEmail = currentUser.email.replace(/\//g, "_");
      const profileRef = doc(db, "Profile", safeEmail);
      const unsubProfile = onSnapshot(profileRef, (snapshot) => {
        if (snapshot.exists() && snapshot.data().photo) {
          setProfilePhoto(snapshot.data().photo);
        } else {
          setProfilePhoto(userIcon);
        }
      });

      return () => unsubProfile();
    });

    return () => unsubscribe();
  }, []);

  const userEmail = user?.email || null;

  // Fetch chat list for signed-in users
  useEffect(() => {
    if (!userEmail) return;
    const chatRef = collection(db, "Chats", userEmail, "chatList");
    const unsubscribe = onSnapshot(chatRef, (snapshot) => {
      const chats = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      const sorted = chats.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      );
      setChatList(sorted);

      // Auto-select first chat if none selected
      if (!currentChatId && sorted.length > 0) {
        setCurrentChatId(sorted[0].chatId);
      }
    });
    return unsubscribe;
  }, [userEmail]);

  // Auto initialize a guest chat if no chat is active
  useEffect(() => {
    if (!currentChatId && !userEmail) {
      setCurrentChatId(uuidv4());
    }
  }, [currentChatId, userEmail]);

  // Fetch messages for current chat
  useEffect(() => {
    if (!userEmail || !currentChatId) return;
    const q = query(
      collection(db, "Chats", userEmail, "chatList", currentChatId, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(data);
    });
    return unsubscribe;
  }, [userEmail, currentChatId]);

  // New chat
  const handleNewChat = async () => {
    const newChatId = uuidv4();
    setCurrentChatId(newChatId);
    setMessages([]);
    setSidebarOpen(false);

    if (!userEmail) return; // guest mode (no persistence)

    try {
      await addDoc(collection(db, "Chats", userEmail, "chatList"), {
        chatId: newChatId,
        name: "New Conversation",
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("Error creating new chat:", e);
    }
  };

  // Helper to format timestamp
  const formatMsgTime = (timestamp) => {
    if (!timestamp) {
      return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    const date = timestamp.seconds
      ? new Date(timestamp.seconds * 1000)
      : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Send message
  const handleSend = async (customText = null) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || !currentChatId) return;
    if (!customText) setInput("");

    // Local user message append
    const userMsgObj = {
      id: uuidv4(),
      sender: "user",
      message: textToSend,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsgObj]);
    setIsTyping(true);

    try {
      const apiUrl =
        import.meta.env.VITE_API_URL ||
        (import.meta.env.DEV ? "http://localhost:5000" : "");

      const response = await fetch(`${apiUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.details ||
            errorData.error ||
            `Server responded with status ${response.status}`
        );
      }

      const data = await response.json();
      const botReply =
        data.reply || "I'm here to listen — could you tell me more?";

      const botMsgObj = {
        id: uuidv4(),
        sender: "bot",
        message: botReply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsgObj]);

      // Save to Firestore if logged in
      if (userEmail) {
        const messagesRef = collection(
          db,
          "Chats",
          userEmail,
          "chatList",
          currentChatId,
          "messages"
        );

        await addDoc(messagesRef, {
          sender: "user",
          message: textToSend,
          timestamp: serverTimestamp(),
        });
        await addDoc(messagesRef, {
          sender: "bot",
          message: botReply,
          timestamp: serverTimestamp(),
        });
      }
    } catch (e) {
      console.error("Error sending or saving message:", e);
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          sender: "bot",
          message:
            "I'm having trouble connecting right now. Please check your connection or try again in a moment.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Close menus on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
        setToolsOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setMenuOpen(false);
      setSidebarOpen(false);
    } catch (e) {
      console.error("Error logging out:", e);
    }
  };

  // Quick suggestion chips
  const suggestionChips = [
    "Talk about what's been happening",
    "Get coping strategies",
    "Just want to vent",
    "Help me calm down",
  ];

  // Mood buttons
  const moodPills = [
    { label: "Good", emoji: "😊", msg: "I'm feeling good today! 😊" },
    { label: "Okay", emoji: "😐", msg: "I'm feeling just okay today." },
    { label: "Sad", emoji: "😢", msg: "I'm feeling sad right now and could use some support. 😢" },
    { label: "Anxious", emoji: "😰", msg: "I'm feeling quite anxious and overwhelmed." },
    { label: "Overwhelmed", emoji: "😫", msg: "I'm feeling overwhelmed with everything right now." },
  ];

  return (
    <div className={`flex h-screen w-full bg-[#f8f8fc] dark:bg-[#0f1017] text-gray-800 dark:text-gray-100 overflow-hidden font-sans select-none transition-colors duration-200`}>
      {/* ========================================================================= */}
      {/* 1. LEFT SIDEBAR: Brand, New Chat, Recent Chats, Motivation, User Profile */}
      {/* ========================================================================= */}
      <aside
        className={`fixed xl:static top-0 left-0 h-full w-72 bg-[#f0effb] dark:bg-[#151722] flex flex-col justify-between p-5 border-r border-indigo-100/70 dark:border-gray-800 transition-transform duration-300 z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } xl:translate-x-0`}
      >
        <div className="flex flex-col h-[calc(100%-5rem)]">
          {/* Brand Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  MindMate
                </h1>
                <p className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 -mt-0.5">
                  Your Safe Space
                </p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="xl:hidden p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* + New Chat Button */}
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white py-3 px-4 rounded-2xl font-semibold text-sm shadow-md shadow-indigo-500/20 transition active:scale-[0.98] mb-6"
          >
            <span className="text-lg leading-none">+</span> New Chat
          </button>

          {/* Recent Chats Section */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between px-1 mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Recent Chats
              </span>
              {chatList.length > 0 && (
                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-semibold px-2 py-0.5 rounded-full">
                  {chatList.length}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {userEmail ? (
                chatList.length === 0 ? (
                  <div className="text-center py-8 px-2">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      No conversations yet.
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-1">
                      Start your journey by saying hi!
                    </p>
                  </div>
                ) : (
                  chatList.map((chat) => (
                    <List
                      key={chat.id}
                      chat={chat}
                      userEmail={userEmail}
                      isActive={chat.chatId === currentChatId}
                      onSelect={(chatId) => {
                        setCurrentChatId(chatId);
                        setSidebarOpen(false);
                      }}
                    />
                  ))
                )
              ) : (
                <div className="p-4 bg-white/70 dark:bg-gray-800/50 rounded-2xl border border-indigo-50 dark:border-gray-800 text-center">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Guest Mode
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 mb-3">
                    Sign in to save and sync your chat history across devices.
                  </p>
                  <button
                    onClick={() => navigate("/auth")}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                  >
                    Sign In / Register
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Motivational Graphic Card */}
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-100/80 to-purple-100/80 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200/50 dark:border-indigo-900/40 text-center relative overflow-hidden shrink-0">
            {/* Soft decorative trees SVG */}
            <div className="absolute inset-x-0 bottom-0 opacity-20 pointer-events-none flex justify-center items-end">
              <svg width="200" height="40" viewBox="0 0 200 40" fill="currentColor" className="text-indigo-800 dark:text-indigo-200">
                <polygon points="20,40 30,15 40,40" />
                <polygon points="35,40 45,10 55,40" />
                <polygon points="80,40 90,20 100,40" />
                <polygon points="120,40 130,5 140,40" />
                <polygon points="150,40 160,18 170,40" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-indigo-950 dark:text-indigo-200 leading-snug relative z-10">
              Small steps still lead to big changes 💜
            </p>
          </div>
        </div>

        {/* User Profile Card at Bottom */}
        <div className="relative pt-3 border-t border-indigo-100 dark:border-gray-800">
          <div
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/80 dark:hover:bg-gray-800/80 cursor-pointer transition border border-transparent hover:border-indigo-100 dark:hover:border-gray-700/60"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <img
                src={profilePhoto}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-indigo-200 dark:border-indigo-800 shadow-sm"
              />
              <div className="flex flex-col overflow-hidden leading-tight">
                <p className="text-xs font-bold text-gray-800 dark:text-gray-100 truncate max-w-[8.5rem]">
                  {user ? user.displayName || user.email.split("@")[0] : "Meraj Alam Siddique"}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Stay kind to yourself
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
          </div>

          {/* User Popover Menu */}
          {menuOpen && (
            <div className="absolute bottom-20 left-2 right-2 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl border border-gray-100 dark:border-gray-700 py-2 z-50 animate-fadeIn text-xs">
              {user ? (
                <>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/profile");
                    }}
                    className="flex items-center gap-2.5 w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                  >
                    <User className="w-4 h-4 text-indigo-500" /> My Profile
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/sign-chat");
                    }}
                    className="flex items-center gap-2.5 w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                  >
                    <Hand className="w-4 h-4 text-purple-500" /> Sign Language Mode 🤟
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/reset-password");
                    }}
                    className="flex items-center gap-2.5 w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                  >
                    <Key className="w-4 h-4 text-amber-500" /> Reset Password
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/help");
                    }}
                    className="flex items-center gap-2.5 w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                  >
                    <HelpCircle className="w-4 h-4 text-teal-500" /> Help & FAQs
                  </button>

                  <div className="my-1 border-t border-gray-100 dark:border-gray-700" />

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-indigo-600 dark:text-indigo-400 font-semibold"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/auth");
                    }}
                    className="flex items-center gap-2.5 w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-indigo-600 dark:text-indigo-400 font-semibold"
                  >
                    <User className="w-4 h-4" /> Sign In / Create Account
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/sign-chat");
                    }}
                    className="flex items-center gap-2.5 w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                  >
                    <Hand className="w-4 h-4 text-purple-500" /> Sign Language Mode 🤟
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Overlay for mobile left sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs xl:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ========================================================================= */}
      {/* 2. CENTER SECTION: Top Bar, Calm Banner, Mood Check-in, Chat Thread, Input */}
      {/* ========================================================================= */}
      <section className="flex-1 flex flex-col h-full min-w-0 bg-[#f8f8fc] dark:bg-[#0f1017]">
        {/* Top Navbar */}
        <header className="h-16 px-6 border-b border-gray-100 dark:border-gray-800/80 bg-white/70 dark:bg-[#13141f]/70 backdrop-blur-md flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="xl:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base shadow-sm">
                🤖
              </div>
              <div>
                <h2 className="font-bold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2 leading-tight">
                  MindMate
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </h2>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">
                  Always here for you
                </p>
              </div>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              title="Toggle Dark Mode"
            >
              {darkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span className="hidden sm:inline">Dark Mode</span>
                </>
              )}
            </button>

            {/* Resources Modal Button */}
            <button
              onClick={() => setModalType("resources")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              title="Self-Care Guides & Resources"
            >
              <BookOpen className="w-4 h-4 text-indigo-500" />
              <span className="hidden sm:inline">Resources</span>
            </button>

            {/* Sign Language Mode */}
            <button
              onClick={() => navigate("/sign-chat")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition"
              title="Switch to Real-time Sign Language Webcam Mode"
            >
              <Hand className="w-4 h-4" />
              <span className="hidden md:inline">Sign Chat</span>
            </button>

            {/* Profile / Settings Button */}
            <button
              onClick={() => navigate(user ? "/profile" : "/auth")}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              title="Profile & Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Mobile Tools Drawer Toggle */}
            <button
              onClick={() => setToolsOpen(true)}
              className="2xl:hidden p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-gray-800 text-indigo-600 dark:text-indigo-400"
              title="Open Wellness Tools"
            >
              <Activity className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Chat Scroll Container */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-5 flex flex-col space-y-4">
          {/* Calm Safe Space Banner */}
          <div className="w-full bg-gradient-to-r from-[#eef9f5] via-[#e8f6f0] to-[#edf7ff] dark:from-[#11231f] dark:via-[#132426] dark:to-[#16202f] border border-emerald-200/50 dark:border-emerald-900/30 rounded-3xl p-5 shadow-xs flex items-center justify-between relative overflow-hidden">
            <div>
              <h3 className="text-base font-extrabold text-teal-950 dark:text-emerald-300">
                Take a deep breath
              </h3>
              <p className="text-xs text-teal-800/80 dark:text-emerald-400/80 mt-0.5">
                You're in a safe space. It's okay to feel what you're feeling.
              </p>
            </div>

            {/* Calming Leaf / Botanical Vector */}
            <div className="shrink-0 text-emerald-500/60 dark:text-emerald-400/40 pr-2">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22C12 22 20 18 20 12C20 6 12 2 12 2C12 2 4 6 4 12C4 18 12 22 12 22Z" />
                <path d="M12 2V22" />
                <path d="M12 7L16 10" />
                <path d="M12 12L8 15" />
                <path d="M12 17L16 19" />
              </svg>
            </div>
          </div>

          {/* Mood Check-in Bar */}
          <div className="flex flex-wrap items-center gap-2 py-1">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mr-1">
              How are you feeling today?
            </span>
            {moodPills.map((m) => (
              <button
                key={m.label}
                onClick={() => handleSend(m.msg)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-gray-200/70 dark:border-gray-700/60 hover:border-indigo-300 dark:hover:border-indigo-700 rounded-full text-xs font-medium text-gray-700 dark:text-gray-200 shadow-xs transition active:scale-95"
              >
                <span>{m.emoji}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 flex flex-col space-y-4 pt-2">
            {/* Initial Welcome Bot message if thread is empty */}
            {messages.length === 0 && (
              <div className="flex items-start gap-3 w-full max-w-2xl animate-fadeIn">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0 font-bold text-sm shadow-xs border border-indigo-200 dark:border-indigo-800">
                  🤖
                </div>
                <div className="flex flex-col items-start max-w-xl">
                  <div className="bg-white dark:bg-gray-800/90 text-gray-800 dark:text-gray-100 px-5 py-4 rounded-3xl rounded-tl-sm shadow-xs border border-gray-100 dark:border-gray-700/50 text-sm leading-relaxed">
                    <p className="font-medium">Hi there! 👋</p>
                    <p className="mt-1">
                      I'm really glad you reached out today. How are you doing right now? I'm here to listen whenever you're ready.
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 ml-2">
                    {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>

                  {/* Starter Suggestion Chips */}
                  <div className="flex flex-wrap gap-2 mt-3 ml-1">
                    {suggestionChips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(chip)}
                        className="px-3.5 py-1.5 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-indigo-100 dark:border-gray-700 rounded-full text-xs font-medium text-indigo-700 dark:text-indigo-300 shadow-xs transition active:scale-95"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Rendered Messages */}
            {messages.map((msg) =>
              msg.sender === "user" ? (
                <div key={msg.id} className="flex justify-end w-full animate-fadeIn">
                  <div className="flex flex-col items-end max-w-md lg:max-w-lg">
                    <div className="bg-[#635bff] text-white px-5 py-3 rounded-3xl rounded-tr-sm shadow-sm text-sm break-words leading-relaxed">
                      {msg.message}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 mt-1 mr-2">
                      <span>{formatMsgTime(msg.timestamp)}</span>
                      <CheckCheck className="w-3.5 h-3.5 text-indigo-500" />
                    </div>
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="flex items-start gap-3 w-full max-w-2xl animate-fadeIn">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0 font-bold text-sm shadow-xs border border-indigo-200 dark:border-indigo-800">
                    🤖
                  </div>
                  <div className="flex flex-col items-start max-w-xl">
                    <div className="bg-white dark:bg-gray-800/90 text-gray-800 dark:text-gray-100 px-5 py-3.5 rounded-3xl rounded-tl-sm shadow-xs border border-gray-100 dark:border-gray-700/50 text-sm leading-relaxed break-words whitespace-pre-wrap">
                      {msg.message}
                    </div>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 ml-2">
                      {formatMsgTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              )
            )}

            {/* Typing Animation Indicator */}
            {isTyping && (
              <div className="flex items-start gap-3 w-full max-w-2xl animate-fadeIn">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0 font-bold text-sm shadow-xs">
                  🤖
                </div>
                <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-3xl rounded-tl-sm shadow-xs border border-gray-100 dark:border-gray-700/50 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-typing-1"></span>
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-typing-2"></span>
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-typing-3"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Bar Section */}
        <div className="p-4 lg:px-8 bg-transparent shrink-0">
          <div className="max-w-4xl mx-auto">
            {/* Pill Container */}
            <div className="bg-white dark:bg-gray-800/90 rounded-full border border-gray-200/80 dark:border-gray-700 shadow-md shadow-gray-200/30 dark:shadow-black/20 p-1.5 flex items-center gap-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition">
              {/* Left Action / Camera Sign Language */}
              <button
                onClick={() => navigate("/sign-chat")}
                className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition ml-1"
                title="Open Sign Language Webcam Mode"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              {/* Text Input */}
              <input
                type="text"
                className="flex-1 bg-transparent border-none outline-none px-2 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Type your message here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isTyping && handleSend()}
              />

              {/* Send Button */}
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className={`p-3 rounded-full transition shadow-md ${
                  input.trim() && !isTyping
                    ? "bg-[#635bff] hover:bg-indigo-700 text-white shadow-indigo-500/30 active:scale-95"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed shadow-none"
                }`}
                aria-label="Send message"
              >
                <Send className="w-4 h-4 fill-current rotate-45 -translate-x-0.5 translate-y-0.5" />
              </button>
            </div>

            {/* Privacy Disclaimer Footer */}
            <p className="text-[11px] text-center text-gray-400 dark:text-gray-500 mt-2 flex items-center justify-center gap-1.5">
              <span>🔒</span> Your conversations are private and secure. This is not a substitute for professional medical advice.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. RIGHT SIDEBAR: Affirmation, Quick Tools, Crisis Help, Daily Quote      */}
      {/* ========================================================================= */}
      <aside
        className={`fixed 2xl:static top-0 right-0 h-full w-80 bg-white/90 dark:bg-[#13141f] border-l border-gray-100 dark:border-gray-800/80 p-5 flex flex-col justify-between overflow-y-auto transition-transform duration-300 z-50 ${
          toolsOpen ? "translate-x-0" : "translate-x-full"
        } 2xl:translate-x-0`}
      >
        <div className="space-y-4">
          {/* Header on mobile */}
          <div className="2xl:hidden flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-sm text-gray-800 dark:text-gray-100">
              Wellness Tools
            </h3>
            <button
              onClick={() => setToolsOpen(false)}
              className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Card 1: Affirmation Card */}
          <div className="bg-[#f6f4ff] dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-3xl p-4 shadow-xs">
            <div className="flex items-center gap-2 mb-1.5 text-indigo-600 dark:text-indigo-400">
              <Heart className="w-4 h-4 fill-indigo-600 text-indigo-600" />
              <h4 className="font-bold text-xs">You matter</h4>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Your feelings are valid. Healing takes time, and that's okay.
            </p>
          </div>

          {/* Card 2: Quick Tools */}
          <div className="bg-white dark:bg-gray-850 rounded-3xl border border-gray-100 dark:border-gray-800 p-4 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-1">
              Quick Tools
            </h4>

            {/* Tool 1: Breathing Exercise */}
            <div
              onClick={() => setModalType("breathing")}
              className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-purple-50/70 dark:hover:bg-purple-950/30 cursor-pointer transition group border border-transparent hover:border-purple-100 dark:hover:border-purple-900/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Wind className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-semibold text-xs text-gray-900 dark:text-gray-100">
                    Breathing Exercise
                  </h5>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">
                    Calm your mind in 1 minute
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition" />
            </div>

            {/* Tool 2: Grounding Technique */}
            <div
              onClick={() => setModalType("grounding")}
              className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-emerald-50/70 dark:hover:bg-emerald-950/30 cursor-pointer transition group border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-semibold text-xs text-gray-900 dark:text-gray-100">
                    Grounding Technique
                  </h5>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">
                    5-4-3-2-1 method
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition" />
            </div>

            {/* Tool 3: Mood Tracker */}
            <div
              onClick={() => setModalType("mood")}
              className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-amber-50/70 dark:hover:bg-amber-950/30 cursor-pointer transition group border border-transparent hover:border-amber-100 dark:hover:border-amber-900/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Smile className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-semibold text-xs text-gray-900 dark:text-gray-100">
                    Mood Tracker
                  </h5>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">
                    Track how you feel
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition" />
            </div>

            {/* Tool 4: Journal */}
            <div
              onClick={() => setModalType("journal")}
              className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-blue-50/70 dark:hover:bg-blue-950/30 cursor-pointer transition group border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Book className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-semibold text-xs text-gray-900 dark:text-gray-100">
                    Journal
                  </h5>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">
                    Write your thoughts
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition" />
            </div>
          </div>

          {/* Card 3: Crisis Support Alert */}
          <div className="bg-[#fff1f2] dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/40 rounded-3xl p-4 shadow-xs">
            <div className="flex items-center gap-2 mb-1.5 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-4 h-4" />
              <h4 className="font-bold text-xs">Need immediate help?</h4>
            </div>
            <p className="text-[11px] text-rose-900/80 dark:text-rose-200/80 leading-relaxed mb-3">
              If you're in crisis, please reach out to a mental health professional or someone you trust.
            </p>
            <button
              onClick={() => setModalType("crisis")}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white dark:bg-rose-950/70 hover:bg-rose-50 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold shadow-2xs transition"
            >
              Find Support Resources <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Card 4: Daily Quote */}
          <div className="p-4 rounded-3xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-center flex items-center gap-3">
            <span className="text-xl shrink-0">🌱</span>
            <p className="text-xs italic text-gray-600 dark:text-gray-300 text-left leading-snug">
              "You are stronger than you think."
            </p>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile tools drawer */}
      {toolsOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs 2xl:hidden z-40"
          onClick={() => setToolsOpen(false)}
        />
      )}

      {/* ========================================================================= */}
      {/* 4. MODALS: Breathing, Grounding, Mood Tracker, Journal, Crisis, Resources */}
      {/* ========================================================================= */}
      <BreathingModal
        isOpen={modalType === "breathing"}
        onClose={() => setModalType(null)}
      />
      <GroundingModal
        isOpen={modalType === "grounding"}
        onClose={() => setModalType(null)}
      />
      <MoodTrackerModal
        isOpen={modalType === "mood"}
        onClose={() => setModalType(null)}
      />
      <JournalModal
        isOpen={modalType === "journal"}
        onClose={() => setModalType(null)}
      />
      <CrisisModal
        isOpen={modalType === "crisis"}
        onClose={() => setModalType(null)}
      />
      <ResourcesModal
        isOpen={modalType === "resources"}
        onClose={() => setModalType(null)}
      />
    </div>
  );
}
