import { useState, useEffect } from "react";

import HomePage from "./pages/HomePage";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Grades from "./pages/Grades";
import Profile from "./pages/Profile";
import Chatbot from "./pages/Chatbot";
import ChatHistory from "./pages/ChatHistory";

export default function App() {
  const [page, setPage] = useState("home");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  // load subjects
  useEffect(() => {
    const saved = localStorage.getItem("subjects");
    if (saved) setSubjects(JSON.parse(saved));
  }, []);

  // save subjects
  useEffect(() => {
    localStorage.setItem("subjects", JSON.stringify(subjects));
  }, [subjects]);

  // load chat history
  useEffect(() => {
    const savedChat = localStorage.getItem("chatHistory");
    if (savedChat) setChatHistory(JSON.parse(savedChat));
  }, []);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  }, [chatHistory]);

  // 🔥 LOGIN / REGISTER HANDLERS
  const handleLogin = (data: any) => {
    setUser(data);
    localStorage.setItem("user", JSON.stringify(data));
    setPage("dashboard");
  };

  const handleRegister = (data: any) => {
    setUser(data);
    localStorage.setItem("user", JSON.stringify(data));
    setPage("dashboard");
  };

  // optional: restore user session
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setPage("dashboard");
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0f1115] text-white">

      {/* SIDEBAR (hidden on home) */}
      {page !== "home" && <Sidebar setPage={setPage} />}

      {/* MAIN CONTENT */}
      <div className="flex-1 p-4">

        {/* HOME PAGE */}
        {page === "home" && (
          <HomePage
            onLogin={handleLogin}
            onRegister={handleRegister}
          />
        )}

        {/* DASHBOARD */}
        {page === "dashboard" && (
          <Dashboard
            subjects={subjects}
            setSubjects={setSubjects}
            user={user}
          />
        )}

        {/* GRADES */}
        {page === "grades" && (
          <Grades
            subjects={subjects}
            setSubjects={setSubjects}
          />
        )}

        {/* PROFILE */}
        {page === "profile" && (
          <Profile user={user} />
        )}

        {/* CHAT */}
        {page === "chat" && (
          <Chatbot
            subjects={subjects}
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
          />
        )}

        {/* CHAT HISTORY */}
        {page === "history" && (
          <ChatHistory chatHistory={chatHistory} />
        )}

      </div>
    </div>
  );
}