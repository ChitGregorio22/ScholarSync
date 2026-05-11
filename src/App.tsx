import { useState, useEffect } from "react";

import HomePage from "./pages/HomePage";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Grades from "./pages/Grades";
import Profile from "./pages/Profile";
import Chatbot from "./pages/Chatbot";
import ChatHistory from "./pages/ChatHistory";
import { supabase, getSession, signOut, getCourses } from "./lib/supabase-simple";

export default function App() {
  const [page, setPage] = useState("home");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state and load data
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for existing session
        const session = await getSession();
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Load courses from Supabase
          const courses = await getCourses();
          setSubjects(courses);
          setPage("dashboard");
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const courses = await getCourses();
          setSubjects(courses);
        } else {
          setSubjects([]);
          setPage("home");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Handle login success
  const handleLoginSuccess = async (userData: any) => {
    setUser(userData);
    const courses = await getCourses();
    setSubjects(courses);
    setPage("dashboard");
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      setSubjects([]);
      setPage("home");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Refresh subjects data
  const refreshSubjects = async () => {
    if (user) {
      const courses = await getCourses();
      setSubjects(courses);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1115] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading ScholarSync...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0f1115] text-white">

      {/* SIDEBAR (hidden on home) */}
      {page !== "home" && <Sidebar setPage={setPage} />}

      {/* MAIN CONTENT */}
      <div className="flex-1 p-4">

        {/* HOME PAGE */}
        {page === "home" && (
          <HomePage
            onLoginSuccess={handleLoginSuccess}
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
            onSubjectsChange={refreshSubjects}
            onLogout={handleLogout}
          />
        )}

        {/* PROFILE */}
        {page === "profile" && (
          <Profile />
        )}

        {/* CHAT */}
        {page === "chat" && (
          <Chatbot />
        )}

        {/* CHAT HISTORY */}
        {page === "history" && (
          <ChatHistory />
        )}

      </div>
    </div>
  );
}