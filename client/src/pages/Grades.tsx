import { useState, useEffect } from "react";
import { 
  getCourses, 
  createCourse, 
  deleteCourse, 
  getStudyLogs, 
  createStudyLog,
  deleteStudyLog,
  getProfile,
  updateProfile,
  type Course,
  type StudyLog
} from "../lib/supabase-simple";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  User, 
  BookOpen, 
  Clock, 
  Save, 
  Calendar,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  BarChart3,
  FileText
} from "lucide-react";

interface GradesProps {
  onSubjectsChange: () => void;
  onLogout: () => void;
}

/**
 * Grades Component
 * 
 * Comprehensive academic management page including profile, course CRUD, 
 * and study log tracking. Features a premium design with animated interactions.
 */
export default function Grades({ onSubjectsChange, onLogout }: GradesProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [studyLogs, setStudyLogs] = useState<StudyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"courses" | "logs">("courses");

  // Form states
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [credits, setCredits] = useState("");
  const [targetGrade, setTargetGrade] = useState("");

  const [studyCourseId, setStudyCourseId] = useState("");
  const [studyHours, setStudyHours] = useState("");
  const [studyDate, setStudyDate] = useState(new Date().toISOString().split('T')[0]);
  const [studyNotes, setStudyNotes] = useState("");

  // Profile states
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [institution, setInstitution] = useState("");
  const [major, setMajor] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesData, logsData, profileData] = await Promise.all([
        getCourses(),
        getStudyLogs(),
        getProfile().catch(() => null)
      ]);
      
      setCourses(coursesData);
      setStudyLogs(logsData);
      
      if (profileData) {
        setFullName(profileData.full_name || "");
        setStudentId(profileData.student_id || "");
        setInstitution(profileData.institution || "");
        setMajor(profileData.major || "");
      }
    } catch (error) {
      console.error("Error loading data:", error);
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
      // Success visual feedback could go here
    } catch (error: any) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const addCourse = async () => {
    if (!courseName.trim()) return;
    setSaving(true);
    try {
      await createCourse({
        course_name: courseName,
        course_code: courseCode || undefined,
        credits: credits ? parseInt(credits) : undefined,
        target_grade: targetGrade || undefined
      });
      setCourseName("");
      setCourseCode("");
      setCredits("");
      setTargetGrade("");
      await loadData();
      onSubjectsChange();
    } catch (error: any) {
      console.error("Error adding course:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    try {
      await deleteCourse(id);
      await loadData();
      onSubjectsChange();
    } catch (error: any) {
      console.error("Error deleting course:", error);
    }
  };

  const addStudyLog = async () => {
    console.log("Attempting to add study log:", { studyCourseId, studyHours, studyDate });
    if (!studyCourseId || !studyHours) {
      console.warn("Missing required fields for study log");
      return;
    }
    setSaving(true);
    try {
      const result = await createStudyLog({
        course_id: studyCourseId,
        hours_studied: parseFloat(studyHours),
        date: studyDate,
        notes: studyNotes || undefined
      });
      console.log("Study log added successfully:", result);
      setStudyHours("");
      setStudyNotes("");
      await loadData();
    } catch (error: any) {
      console.error("Error adding study log:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStudyLog = async (id: string) => {
    try {
      await deleteStudyLog(id);
      await loadData();
    } catch (error: any) {
      console.error("Error deleting study log:", error);
    }
  };

  const totalStudyHours = studyLogs.reduce((sum, log) => sum + log.hours_studied, 0);

  if (loading) {
    return (
      <div className="h-[calc(100vh-2rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
          <p className="text-gray-400 font-medium animate-pulse">Syncing your data...</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto space-y-8 pb-12"
    >
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="w-5 h-5 text-brand-primary" />
            <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">Academic Management</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Grades & Records</h1>
          <p className="text-gray-400 mt-2">Manage your academic profile and track study progress.</p>
        </div>

        <div className="flex bg-bg-card p-1.5 rounded-2xl border border-white/5 shadow-inner">
          {[
            { id: "courses", label: "Courses", icon: BookOpen },
            { id: "logs", label: "Study Logs", icon: Clock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all duration-300 text-sm font-semibold ${
                activeTab === tab.id 
                  ? "bg-brand-primary text-white shadow-lg" 
                  : "text-gray-500 hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <AnimatePresence mode="wait">

        {activeTab === "courses" && (
          <motion.div 
            key="courses"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            {/* Add Course Form */}
            <div className="glass-card p-6 border-dashed border-white/10">
              <div className="flex items-center gap-2 mb-6">
                <Plus className="w-5 h-5 text-brand-primary" />
                <h3 className="text-lg font-bold">Add New Course</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="Course Name"
                  className="bg-black/40 border border-white/10 p-3 rounded-xl focus:outline-none focus:border-brand-primary transition-all text-sm"
                />
                <input
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="Code (e.g. CS101)"
                  className="bg-black/40 border border-white/10 p-3 rounded-xl focus:outline-none focus:border-brand-primary transition-all text-sm"
                />
                <input
                  type="number"
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                  placeholder="Credits"
                  className="bg-black/40 border border-white/10 p-3 rounded-xl focus:outline-none focus:border-brand-primary transition-all text-sm"
                />
                <input
                  value={targetGrade}
                  onChange={(e) => setTargetGrade(e.target.value)}
                  placeholder="Target Grade"
                  className="bg-black/40 border border-white/10 p-3 rounded-xl focus:outline-none focus:border-brand-primary transition-all text-sm"
                />
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={addCourse}
                  disabled={saving || !courseName}
                  className="bg-white text-black px-8 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition active:scale-95 disabled:opacity-50"
                >
                  Create Course
                </button>
              </div>
            </div>

            {/* Courses List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {courses.map((course) => (
                  <motion.div
                    key={course.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="glass-card p-6 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-brand-primary/10 p-2.5 rounded-xl group-hover:scale-110 transition-transform">
                          <BookOpen className="w-5 h-5 text-brand-primary" />
                        </div>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h4 className="text-lg font-bold leading-tight mb-1">{course.course_name}</h4>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                        {course.course_code || "No Code"} • {course.credits || 0} Credits
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Target</span>
                        <span className="text-lg font-extrabold text-brand-primary">{course.target_grade || "N/A"}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Status</span>
                        <span className="text-xs font-bold flex items-center gap-1 text-green-400">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {courses.length === 0 && (
                <div className="lg:col-span-3 py-20 flex flex-col items-center text-gray-500 gap-4">
                  <div className="bg-white/5 p-6 rounded-full">
                    <FileText className="w-12 h-12 opacity-20" />
                  </div>
                  <p className="font-medium">You haven't added any courses yet.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "logs" && (
          <motion.div 
            key="logs"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid lg:grid-cols-3 gap-8"
          >
            {/* Log Study Session Form */}
            <div className="glass-card p-8 h-fit space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-accent" />
                <h3 className="text-xl font-bold">Log Activity</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Select Course</label>
                  <select
                    value={studyCourseId}
                    onChange={(e) => setStudyCourseId(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 p-3.5 rounded-xl focus:outline-none focus:border-accent transition-all text-sm appearance-none"
                  >
                    <option value="">Choose a subject...</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.course_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Date</label>
                    <input
                      type="date"
                      value={studyDate}
                      onChange={(e) => setStudyDate(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 p-3.5 rounded-xl focus:outline-none focus:border-accent transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Duration (Hrs)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={studyHours}
                      onChange={(e) => setStudyHours(e.target.value)}
                      placeholder="2.5"
                      className="w-full bg-black/40 border border-white/10 p-3.5 rounded-xl focus:outline-none focus:border-accent transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Notes (Optional)</label>
                  <textarea
                    value={studyNotes}
                    onChange={(e) => setStudyNotes(e.target.value)}
                    placeholder="What topics did you cover?"
                    rows={3}
                    className="w-full bg-black/40 border border-white/10 p-3.5 rounded-xl focus:outline-none focus:border-accent transition-all text-sm resize-none"
                  />
                </div>

                <button
                  onClick={addStudyLog}
                  disabled={saving || !studyCourseId || !studyHours}
                  className="w-full bg-accent hover:bg-accent/90 text-black font-bold py-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  Log Study Session
                </button>
              </div>
            </div>

            {/* Study Logs History */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between mb-2 px-2">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold">{totalStudyHours.toFixed(1)}h</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Hours</span>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold">{studyLogs.length}</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sessions</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-accent">
                  <BarChart3 className="w-4 h-4" />
                  Last 30 Days
                </div>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {studyLogs.length === 0 ? (
                  <div className="py-20 glass-card border-dashed flex flex-col items-center justify-center text-gray-500 gap-4">
                    <Clock className="w-10 h-10 opacity-10" />
                    <p>No study logs found for this period.</p>
                  </div>
                ) : (
                  studyLogs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card p-5 flex items-center justify-between group hover:border-accent/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-accent/10 p-3 rounded-xl">
                          <Calendar className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <h5 className="font-bold">
                            {courses.find(c => c.id === log.course_id)?.course_name || 'Unknown Course'}
                          </h5>
                          <div className="flex items-center gap-3 text-xs text-gray-500 font-medium mt-1">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {log.hours_studied}h</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(log.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {log.notes && (
                          <div className="hidden md:block max-w-[200px] truncate text-xs italic text-gray-500">
                            "{log.notes}"
                          </div>
                        )}
                        <button
                          onClick={() => handleDeleteStudyLog(log.id)}
                          className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}