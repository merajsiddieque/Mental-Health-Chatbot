import React, { useState, useEffect, useRef } from "react";
import { doc, updateDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { MessageSquare, MoreHorizontal, Edit3, Trash2 } from "lucide-react";

function List({ chat, isActive, onSelect, userEmail }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(chat.name || "Conversation");
  const menuRef = useRef();

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "Recent";
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) return "Today";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Rename chat
  const handleRename = async () => {
    if (!newName.trim()) return;
    try {
      const chatRef = doc(db, "Chats", userEmail, "chatList", chat.id);
      await updateDoc(chatRef, { name: newName });
      setIsRenaming(false);
      setMenuOpen(false);
    } catch (error) {
      console.error("Error renaming chat:", error);
    }
  };

  // Delete chat + messages
  const handleDelete = async () => {
    if (!window.confirm("🗑️ Are you sure you want to delete this conversation?")) return;
    try {
      const messagesRef = collection(db, "Chats", userEmail, "chatList", chat.chatId, "messages");
      const snapshot = await getDocs(messagesRef);
      await Promise.all(snapshot.docs.map((msg) => deleteDoc(msg.ref)));

      const chatRef = doc(db, "Chats", userEmail, "chatList", chat.id);
      await deleteDoc(chatRef);
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  return (
    <div
      className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-2xl cursor-pointer transition border ${
        isActive
          ? "bg-white dark:bg-gray-800 text-indigo-700 dark:text-indigo-400 font-semibold shadow-sm border-indigo-200 dark:border-indigo-800/80"
          : "hover:bg-white/80 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-200/60 dark:hover:border-gray-700/60"
      }`}
      onClick={() => !isRenaming && onSelect(chat.chatId)}
    >
      <div className="flex items-center gap-3 overflow-hidden flex-1">
        <MessageSquare
          className={`w-4 h-4 shrink-0 transition ${
            isActive
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-400"
          }`}
        />

        {isRenaming ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            className="flex-1 bg-transparent border-b border-indigo-400 outline-none text-xs py-0.5 font-normal text-gray-900 dark:text-gray-100"
            autoFocus
          />
        ) : (
          <div className="flex flex-col overflow-hidden leading-tight">
            <span className="text-xs truncate font-medium">
              {chat.name || "Conversation"}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
              {formatDate(chat.createdAt)}
            </span>
          </div>
        )}
      </div>

      {/* Menu icon */}
      <div className="relative shrink-0 ml-1" ref={menuRef}>
        <button
          className={`p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
            menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          aria-label="Chat options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-100 dark:border-gray-700 py-1.5 z-50 animate-fadeIn text-xs">
            <button
              className="flex items-center gap-2 w-full text-left px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              onClick={(e) => {
                e.stopPropagation();
                setIsRenaming(true);
                setMenuOpen(false);
              }}
            >
              <Edit3 className="w-3.5 h-3.5" /> Rename
            </button>
            <button
              className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
                setMenuOpen(false);
              }}
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default List;
