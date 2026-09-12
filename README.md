# 🤟 AI Sign Language Chatbot

A full‑stack AI chatbot that supports **real‑time sign‑language communication** and **text chat**, built using **React, Tailwind CSS, Mediapipe, Firebase, Express, and OpenAI**.

Provides emotional support, natural conversation, and gesture‑based interactions.

---

## 🔗 Project Info
- **GitHub:** https://github.com/merajsiddieque/Chatbot
- **Author:** Meraj Siddique
- **LinkedIn:** https://www.linkedin.com/in/merajsiddieque

---

## 🚀 Features

### ✋ Real‑Time Sign Language Detection
- Powered by **Mediapipe GestureRecognizer** + webcam.
- Converts gestures → interpreted text → AI reply.

### 💬 AI Chat (OpenAI)
- Handles gesture inputs + normal text.
- Generates empathetic responses.

### 🔐 Firebase Authentication
- Signup (Email + Password)
- Email verification (mandatory)
- Login / Logout
- Password reset
- Delete account
- Profile storage in Firestore

### 🔥 Firestore Database
Stores:
- name
- email
- base64 profile image
- entire chat history:
```
Chats/
 └── userEmail/
      └── chatList/
           └── messages/
```

---

## ✋ Gesture → Intent Mapping
```js
const gestureToIntent = {
  Palm: "Hello! I’m here to communicate through sign language. (👋)",
  Fist: "I’m feeling tense or stressed right now. (✊)",
  Thumb_Up: "Yes, I agree or I’m feeling okay. (👍)",
  Thumb_Down: "No, I don’t agree or I feel sad. (👎)",
  Victory: "I’m feeling peaceful or I’ve achieved something. (✌️)",
  Pointing_Up: "I have a question or I want to say something. (☝️)",
  ILoveYou: "I appreciate your help and care. (🤟)",
  Open_Pinch: "Something small is bothering me. (🤏)",
  Closed_Pinch: "I want to share something important. (🤏)",
  None: "No gesture detected. (⚪)",
};
```

**Flow:** Gesture → Intent → Backend → OpenAI → AI Reply

---

## 📁 Project Structure
```
Chatbot/
│
├── react/
│   └── src/
│       ├── components/
│       │   ├── Chatbot.jsx
│       │   ├── ChatbotReply.jsx
│       │   └── UserReply.jsx
│       │
│       ├── SignLanguage/
│       │   ├── SignInput.jsx
│       │   └── ChatbotSignMode.jsx
│       │
│       ├── pages/
│       │   ├── Auth.jsx
│       │   ├── Reset-Password.jsx
│       │   └── Profile.jsx
│       │
│       ├── firebase.js
│       ├── App.jsx
│       └── index.js
│
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── README.md
```

---

## 🔐 Firebase Authentication Logic
### Email verification check
```js
if (!auth.currentUser.emailVerified) {
  alert("Please verify your email before logging in.");
  return;
}
```

### Profile Storage Example
```
Profile/
 └── userEmail/
      ├── name: "User Name"
      ├── email: "user@gmail.com"
      └── image: "<base64_string>"
```

### Firebase Config (react/src/firebase.js)
```js
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_SENDER",
  appId: "YOUR_APP_ID",
};
```

---

## 🔌 Backend (Express + OpenAI)
```js
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: message }],
  });

  res.json({ reply: completion.choices[0].message.content });
});
```

---

## 🧰 Installation
### 1️⃣ Clone
```
git clone https://github.com/merajsiddieque/Chatbot
cd Chatbot
```

### 2️⃣ Frontend
```
cd react
npm install
npm start
```

### 3️⃣ Backend
```
cd backend
npm install
node server.js
```

### Environment Variables (`backend/.env`)
```
OPENAI_API_KEY=your_openai_key
PORT=5000
```

---

## 🎯 Future Enhancements
- More gesture support
- Gesture → sentence detection
- Voice + sign + text modes
- Deploy frontend (Vercel) + backend (Render)
- Google Sign‑In
- Dark mode

---

## 👨‍💻 Author
**Meraj Alam**
- GitHub: https://github.com/merajsiddieque
- LinkedIn: https://www.linkedin.com/in/merajsiddieque
