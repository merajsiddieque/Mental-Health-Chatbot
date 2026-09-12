import React from "react";
import ReactDOM from "react-dom/client";
import './index.css'
import App from "./App";
import { BrowserRouter } from "react-router-dom";

// Initialize theme: Default to Light Mode unless mindmate_dark_mode is explicitly set to "true"
if (localStorage.getItem("mindmate_dark_mode") === "true") {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
