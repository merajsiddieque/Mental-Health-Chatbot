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

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatList, setChatList] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [user, setUser] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(userIcon);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

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
      setChatList(
        chats.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
      );
    });
    return unsubscribe;
  }, [userEmail]);

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
    if (!userEmail) return; // guest mode (no persistence)

    try {
      await addDoc(collection(db, "Chats", userEmail, "chatList"), {
        chatId: newChatId,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("Error creating new chat:", e);
    }
  };

  // Send message
  const handleSend = async () => {
    if (!input.trim() || !currentChatId) return;
    const userMessage = input.trim();
    setInput("");

    // local append
    setMessages((prev) => [
      ...prev,
      { id: uuidv4(), sender: "user", message: userMessage },
    ]);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      const botReply =
        data.reply || "I'm here to listen — could you tell me more?";

      setMessages((prev) => [
        ...prev,
        { id: uuidv4(), sender: "bot", message: botReply },
      ]);

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
          message: userMessage,
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
    }
  };

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close sidebar on ESC (mobile)
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setSidebarOpen(false);
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

  return (
    <div className="flex h-screen bg-[#f8f8ff] text-gray-800 overflow-hidden">
      {/* Sidebar (drawer on mobile) */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-[#e9e6fc] flex flex-col justify-between p-5 shadow-md transition-transform duration-300 z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
        aria-hidden={!sidebarOpen && window.innerWidth < 768}
      >
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white text-lg">
              🤖
            </div>
            <h1 className="text-3xl font-bold text-indigo-700 tracking-tight">
              Chatbot
            </h1>
          </div>

          {/* New Chat */}
          <button
            onClick={() => {
              handleNewChat();
              setSidebarOpen(false); // close drawer after action on mobile
            }}
            className="w-full bg-indigo-500 text-white py-3 rounded-xl font-semibold hover:bg-indigo-600 transition mb-5 shadow-sm"
          >
            + New Chat
          </button>

          {/* Chat List */}
          {userEmail ? (
            <div className="space-y-2 overflow-y-auto max-h-[60vh] pr-1">
              {chatList.length === 0 ? (
                <p className="text-sm text-gray-500 text-center">
                  No chats yet
                </p>
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
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center mt-5">
              Sign in to save your chats securely 💬
            </p>
          )}
        </div>

        {/* User Section */}
        <div className="relative mt-6 border-t border-indigo-100 pt-4">
          <div
            className="flex items-center gap-3 p-2 cursor-pointer hover:bg-indigo-100 rounded-xl transition"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <img
              src={profilePhoto}
              alt="User"
              className="w-12 h-12 rounded-full object-cover border border-gray-300 shadow-sm"
            />
            <div className="flex flex-col overflow-hidden">
              <p className="font-semibold text-gray-800 truncate max-w-[10rem]">
                {user ? user.email : "Guest User"}
              </p>
              <p className="text-sm text-gray-500">
                {user ? "Signed In" : "Guest"}
              </p>
            </div>
          </div>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute bottom-16 left-0 bg-white shadow-lg rounded-xl w-56 py-2 z-50 border border-gray-200">
              {user ? (
                <>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setSidebarOpen(false);
                      navigate("/profile");
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                  >
                    👤Profile
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setSidebarOpen(false);
                      navigate("/help");
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                  >
                    💬Help
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setSidebarOpen(false);
                      navigate("/sign-chat");
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                  >
                    ♿️Accessibility
                  </button>

                  

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setSidebarOpen(false);
                      navigate("/reset-password");
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                  >
                    🔑Reset Password
                  </button>

                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      const confirmDelete = window.confirm(
                        "⚠️ This will permanently delete your account and all your chats. Continue?"
                      );
                      if (!confirmDelete) return;

                      try {
                        const currentUser = auth.currentUser;
                        if (!currentUser)
                          return alert("You are not logged in.");

                        const safeEmail = currentUser.email.replace(/\//g, "_");

                        // 1) Delete Profile doc
                        const profileRef = doc(db, "Profile", safeEmail);
                        await deleteDoc(profileRef).catch(() => {});

                        // 2) Delete all chats + messages
                        const userChatsRef = collection(
                          db,
                          "Chats",
                          safeEmail,
                          "chatList"
                        );
                        const chatListSnap = await getDocs(userChatsRef);

                        for (const chatDoc of chatListSnap.docs) {
                          const chatId = chatDoc.id;
                          const messagesRef = collection(
                            db,
                            "Chats",
                            safeEmail,
                            "chatList",
                            chatId,
                            "messages"
                          );
                          const messagesSnap = await getDocs(messagesRef);

                          for (const msg of messagesSnap.docs) {
                            await deleteDoc(msg.ref);
                          }

                          await deleteDoc(chatDoc.ref);
                        }

                        // 3) Delete parent doc under Chats
                        const userChatsParentRef = doc(db, "Chats", safeEmail);
                        await deleteDoc(userChatsParentRef).catch(() => {});

                        // 4) Delete auth user
                        await currentUser.delete();

                        alert("✅ Account and all data deleted successfully.");
                        setSidebarOpen(false);
                        navigate("/auth");
                      } catch (error) {
                        console.error("❌ Error deleting account:", error);
                        if (error.code === "auth/requires-recent-login") {
                          alert(
                            "⚠️ Please log in again before deleting your account."
                          );
                        } else {
                          alert(
                            "❌ Failed to delete account. Please try again later."
                          );
                        }
                      }
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-red-50 text-red-500"
                  >
                    🗑️Delete Account
                  </button>

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-indigo-600 font-semibold"
                  >
                    🚪Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setSidebarOpen(false);
                      navigate("/auth");
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-indigo-600 font-semibold"
                  >
                    🔑Sign In
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setSidebarOpen(false);
                      navigate("/auth");
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-indigo-600 font-semibold"
                  >
                    ✍️Sign Up
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setSidebarOpen(false);
                      navigate("/sign-chat");
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                  >
                    ♿️Accessibility
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#f8f8ff]/90 backdrop-blur-sm md:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main / Chat Section */}
      <section className="flex flex-col flex-1 min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between p-4 bg-[#f8f8ff] shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-indigo-100 text-indigo-600"
            aria-label="Open menu"
          >
            ☰
          </button>
          <h2 className="text-lg font-semibold text-indigo-700">Chatbot</h2>
          <div className="w-9 h-9" />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
          {currentChatId ? (
            messages.length > 0 ? (
              messages.map((msg) =>
                msg.sender === "user" ? (
                  <div key={msg.id} className="flex justify-end w-full mb-3">
                    <div className="bg-indigo-500 text-white px-4 py-2 rounded-2xl max-w-md shadow-md text-sm break-words">
                      {msg.message}
                    </div>
                  </div>
                ) : (
                  <div key={msg.id} className="flex justify-start w-full mb-3">
                    <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl max-w-md shadow-sm text-sm break-words flex items-start gap-2">
                      <span className="text-xl">🤖</span>
                      <span>{msg.message}</span>
                    </div>
                  </div>
                )
              )
            ) : (
              <p className="text-gray-500 mt-10">Start chatting...</p>
            )
          ) : (
            <p className="text-gray-400 mt-20">
              Click <span className="font-semibold">“New Chat”</span> to begin
            </p>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {/* Input */}
<div className="p-4 border-t bg-[#f8f8ff] flex items-center">
  <input
    type="text"
    className="flex-1 bg-white rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    placeholder={
      currentChatId
        ? "Type your message..."
        : "Click 'New Chat' to start a conversation"
    }
    value={input}
    onChange={(e) => setInput(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && handleSend()}
    disabled={!currentChatId}
  />

  {/* 🚀 Send Button */}
  <button
    onClick={() => {
      handleSend();
    }}
    disabled={!currentChatId}
    className={`ml-3 rounded-full p-3 transition ${
      currentChatId
        ? "bg-indigo-500 hover:bg-indigo-600 text-white"
        : "bg-gray-300 cursor-not-allowed text-gray-600"
    }`}
    aria-label="Send message"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  </button>
</div>

      </section>
    </div>
  );
}
