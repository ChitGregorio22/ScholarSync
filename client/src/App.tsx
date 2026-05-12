import { useState, useEffect } from "react";
import { LanguageProvider } from "./lib/LanguageContext";

import HomePage from "./pages/HomePage";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Grades from "./pages/Grades";
import Profile from "./pages/Profile";
import Chatbot from "./pages/Chatbot";
import ChatHistory from "./pages/ChatHistory";
import Settings from "./pages/Settings";
import { supabase, getSession, signOut, getCourses, getStudyLogs, getAssessments } from "./lib/supabase-simple";

export default function App() {
  const [page, setPage] = useState("home");
  const [subjects, setSubjects] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [studyLogs, setStudyLogs] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state and load data
  useEffect(() => {
    const initAuth = async () => {
      // Global safety timeout: definitely stop loading after 5 seconds
      const globalTimeout = setTimeout(() => {
        console.warn("Global init timeout reached");
        setLoading(false);
      }, 5000);

      console.log("Checking server connection...");
      try {
        const healthRes = await Promise.race([
          fetch('http://localhost:5000/api/health'),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Health check timeout")), 2000))
        ]) as any;
        const healthData = await healthRes.json();
        console.log("Server health:", healthData.status);
      } catch (e) {
        console.warn("Could not reach local server quickly. Continuing...");
      }

      try {
        console.log("Auth session check...");
        const session = await getSession();
        
        console.log("Session:", session ? "Found" : "Not found");
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setPage("dashboard");
          const [courses, allLogs] = await Promise.all([
            getCourses(),
            getStudyLogs()
          ]);
          setSubjects(courses);
          setStudyLogs(allLogs);
          
          // Fetch assessments for all courses
          if (courses.length > 0) {
            const allAssessments = await Promise.all(
              courses.map((c: any) => getAssessments(c.id))
            );
            setAssessments(allAssessments.flat());
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        clearTimeout(globalTimeout);
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: any, session: any) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const [courses, allLogs] = await Promise.all([
            getCourses(),
            getStudyLogs()
          ]);
          setSubjects(courses);
          setStudyLogs(allLogs);

          if (courses.length > 0) {
            const allAssessments = await Promise.all(
              courses.map((c: any) => getAssessments(c.id))
            );
            setAssessments(allAssessments.flat());
          }
        } else {
          setSubjects([]);
          setStudyLogs([]);
          setAssessments([]);
          setPage("home");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Handle login success
  const handleLoginSuccess = async (userData: any) => {
    console.log("Login success handler called with user:", userData.email);
    setUser(userData);
    try {
      console.log("Fetching data for new user...");
      const [courses, allLogs] = await Promise.all([
        getCourses(),
        getStudyLogs()
      ]);
      setSubjects(courses);
      setStudyLogs(allLogs);

      if (courses.length > 0) {
        const allAssessments = await Promise.all(
          courses.map((c: any) => getAssessments(c.id))
        );
        setAssessments(allAssessments.flat());
      }
    } catch (e) {
      console.error("Error fetching data after login:", e);
    }
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

  // Refresh all data
  const refreshData = async () => {
    if (user) {
      const [courses, allLogs] = await Promise.all([
        getCourses(),
        getStudyLogs()
      ]);
      setSubjects(courses);
      setStudyLogs(allLogs);

      if (courses.length > 0) {
        const allAssessments = await Promise.all(
          courses.map((c: any) => getAssessments(c.id))
        );
        setAssessments(allAssessments.flat());
      }
    }
  };

  // Listen for custom page switch events
  useEffect(() => {
    const handleSwitchPage = (e: any) => {
      setPage(e.detail);
    };
    window.addEventListener('switchPage', handleSwitchPage as EventListener);
    return () => window.removeEventListener('switchPage', handleSwitchPage as EventListener);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1115] text-white flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Initializing ScholarSync...</p>
          <button 
            onClick={() => setLoading(false)}
            className="mt-8 text-xs text-gray-600 hover:text-gray-400 transition-colors underline"
          >
            Skip loading (Debug mode)
          </button>
        </div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <div className="flex h-screen bg-bg-dark text-tx-main overflow-hidden transition-colors duration-300">

      {/* SIDEBAR (hidden on home) */}
      {page !== "home" && <Sidebar setPage={setPage} currentPage={page} onLogout={handleLogout} />}

      {/* MAIN CONTENT - Scrollable area */}
      <main className="flex-1 overflow-y-auto p-4 custom-scrollbar">

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
            studyLogs={studyLogs}
            assessments={assessments}
            user={user}
          />
        )}

        {/* GRADES */}
        {page === "grades" && (
          <Grades
            onSubjectsChange={refreshData}
          />
        )}

        {/* PROFILE */}
        {page === "profile" && (
          <Profile />
        )}

        {/* SETTINGS */}
        {page === "settings" && (
          <Settings />
        )}

        {/* CHAT */}
        {page === "chat" && (
          <Chatbot />
        )}

        {/* CHAT HISTORY */}
        {page === "history" && (
          <ChatHistory />
        )}

      </main>
    </div>
    </LanguageProvider>
  );
}