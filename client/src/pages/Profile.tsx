import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Save, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  GraduationCap,
  School,
  IdCard,
  Briefcase
} from "lucide-react";
import { getProfile, updateProfile } from "../lib/supabase-simple";

type AttendanceDay = {
  date: string; // YYYY-MM-DD
  status: "present" | "absent";
};

/**
 * Consolidated Profile Page
 * 
 * Manages student personal information (Supabase) and attendance tracking.
 */
export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile states (Supabase)
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [institution, setInstitution] = useState("");
  const [major, setMajor] = useState("");

  // Attendance states (LocalStorage)
  const [attendance, setAttendance] = useState<AttendanceDay[]>([]);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load Supabase Profile
      const profileData = await getProfile();
      if (profileData) {
        setFullName(profileData.full_name || "");
        setStudentId(profileData.student_id || "");
        setInstitution(profileData.institution || "");
        setMajor(profileData.major || "");
      }

      // Load Local Attendance
      const savedAttendance = localStorage.getItem("attendance");
      if (savedAttendance) setAttendance(JSON.parse(savedAttendance));
      
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName,
        student_id: studentId,
        institution,
        major
      });
      // Success feedback
    } catch (error: any) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: number) => {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const existing = attendance.find((a) => a.date === date);

    let newAttendance: AttendanceDay[];
    if (existing) {
      newAttendance = attendance.map((a) =>
        a.date === date
          ? { ...a, status: a.status === "present" ? "absent" : "present" }
          : a
      );
    } else {
      newAttendance = [...attendance, { date, status: "present" }];
    }
    
    setAttendance(newAttendance);
    localStorage.setItem("attendance", JSON.stringify(newAttendance));
  };

  const getStatus = (day: number) => {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return attendance.find((a) => a.date === date)?.status;
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-2rem)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8 pb-12"
    >
      <header>
        <div className="flex items-center gap-2 mb-2">
          <User className="w-5 h-5 text-brand-primary" />
          <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">Student Portal</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white">Student Profile</h1>
        <p className="text-gray-400 mt-2">Personalize your academic identity and track daily attendance.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: PERSONAL INFO */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-bg-card border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
              <GraduationCap className="w-48 h-48" />
            </div>

            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="bg-brand-primary/10 p-4 rounded-2xl">
                  <User className="w-8 h-8 text-brand-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Personal Information</h3>
                  <p className="text-gray-500 text-sm">Update your public student details</p>
                </div>
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="bg-brand-primary hover:bg-brand-primary/90 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-brand-primary/20"
              >
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-500 ml-1">
                  <User className="w-3.5 h-3.5" />
                  <label className="text-[10px] font-bold uppercase tracking-widest">Full Name</label>
                </div>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Smith"
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all text-white placeholder:text-gray-700"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-500 ml-1">
                  <IdCard className="w-3.5 h-3.5" />
                  <label className="text-[10px] font-bold uppercase tracking-widest">Student ID</label>
                </div>
                <input
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. 2024-5582"
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all text-white placeholder:text-gray-700"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-500 ml-1">
                  <School className="w-3.5 h-3.5" />
                  <label className="text-[10px] font-bold uppercase tracking-widest">Institution</label>
                </div>
                <input
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. Harvard University"
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all text-white placeholder:text-gray-700"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-500 ml-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  <label className="text-[10px] font-bold uppercase tracking-widest">Major / Field of Study</label>
                </div>
                <input
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all text-white placeholder:text-gray-700"
                />
              </div>
            </div>
          </div>

          {/* ATTENDANCE CALENDAR */}
          <div className="bg-bg-card border border-white/5 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="bg-accent/10 p-4 rounded-2xl">
                  <CalendarIcon className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Attendance Calendar</h3>
                  <p className="text-gray-500 text-sm">{new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(today)}</p>
                </div>
              </div>
              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  Present
                </div>
                <div className="flex items-center gap-2 text-red-400">
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                  Absent
                </div>
              </div>
            </div>

            <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-11 gap-3">
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const status = getStatus(day);
                return (
                  <motion.button
                    key={day}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleDay(day)}
                    className={`
                      aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all border
                      ${
                        status === "present"
                          ? "bg-green-500/20 border-green-500/30 text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.1)]"
                          : status === "absent"
                          ? "bg-red-500/20 border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(248,113,113,0.1)]"
                          : "bg-white/5 border-white/10 text-gray-500 hover:border-white/20 hover:bg-white/10"
                      }
                    `}
                  >
                    {day}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INSIGHTS & ACTIONS */}
        <div className="space-y-6">
          <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-brand-primary" />
              <h4 className="font-bold text-white">Profile Insights</h4>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Your profile information helps the <span className="text-brand-primary font-bold">ScholarSync AI</span> customize study advice based on your curriculum and institution standards.
            </p>
            <div className="space-y-3">
              <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Profile Completion</span>
                  <span className="text-xs font-bold text-brand-primary">
                    {Math.round(([fullName, studentId, institution, major].filter(Boolean).length / 4) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-brand-primary h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.round(([fullName, studentId, institution, major].filter(Boolean).length / 4) * 100)}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
            <h4 className="font-bold text-white mb-4">Account Stats</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/40 p-4 rounded-2xl border border-white/5 flex flex-col items-center">
                <span className="text-xl font-bold text-green-400">{attendance.filter(a => a.status === 'present').length}</span>
                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Days Present</span>
              </div>
              <div className="bg-black/40 p-4 rounded-2xl border border-white/5 flex flex-col items-center">
                <span className="text-xl font-bold text-red-400">{attendance.filter(a => a.status === 'absent').length}</span>
                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Days Absent</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}