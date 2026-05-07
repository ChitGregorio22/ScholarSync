import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BrainIcon, CalendarIcon, ChatIcon, DashboardIcon, GradesIcon, ProfileIcon } from "../components/Icons";

type Subject = {
  id: number;
  subject: string;
  grade: number;
  attendance: number;
};

type Task = {
  id: number;
  subject: string;
  hours: number;
};

export default function Grades({ subjects, setSubjects, onOpenChat, onLogout }: any) {
  const [tasks, setTasks] = useState<Task[]>([]);

  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [attendance, setAttendance] = useState("");

  const [taskSubject, setTaskSubject] = useState("");
  const [taskHours, setTaskHours] = useState("");

  // ✅ NEW: Student Identity
  const [studentName, setStudentName] = useState("");
  const [studentProgram, setStudentProgram] = useState("");

  // LOAD DATA
  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");

    if (savedTasks) setTasks(JSON.parse(savedTasks));
  }, []);

  // SAVE DATA
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // SAVE STUDENT INFO
  useEffect(() => {
    localStorage.setItem("studentName", studentName);
  }, [studentName]);

  useEffect(() => {
    localStorage.setItem("studentProgram", studentProgram);
  }, [studentProgram]);

  // ADD SUBJECT
  const addSubject = () => {
    if (!subject || !grade || !attendance) return;

    const newSubject: Subject = {
      id: Date.now(),
      subject,
      grade: Number(grade),
      attendance: Number(attendance),
    };

    setSubjects([newSubject, ...subjects]);
    setSubject("");
    setGrade("");
    setAttendance("");
  };

  // DELETE SUBJECT
  const deleteSubject = (id: number) => {
    setSubjects(subjects.filter((s) => s.id !== id));
  };

  // ADD STUDY TASK
  const addTask = () => {
    if (!taskSubject || !taskHours) return;

    const newTask: Task = {
      id: Date.now(),
      subject: taskSubject,
      hours: Number(taskHours),
    };

    setTasks([newTask, ...tasks]);
    setTaskSubject("");
    setTaskHours("");
  };

  // CALCULATIONS
  const average =
    subjects.length > 0
      ? Math.round(subjects.reduce((sum, s) => sum + s.grade, 0) / subjects.length)
      : 0;

  const weak =
    subjects.length > 0
      ? subjects.reduce((min, s) => (s.grade < min.grade ? s : min))
      : null;

  const avgAttendance =
    subjects.length > 0
      ? Math.round(subjects.reduce((sum, s) => sum + s.attendance, 0) / subjects.length)
      : 0;

  // AI RECOMMENDATION
  const getRecommendation = () => {
    if (subjects.length === 0) return "Add subjects to get advice.";

    if (weak && weak.grade < 75) {
      return `Focus on ${weak.subject}. Study 1–2 hours daily.`;
    }

    if (avgAttendance < 80) {
      return "Improve your attendance to boost performance.";
    }

    return "Great job! Keep maintaining your performance.";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-transparent text-white p-6"
    >
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <motion.div
          variants={cardVariants}
          className="glass-card p-6 rounded-[2rem] border-white/10"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-3xl font-bold">
                <DashboardIcon className="text-cyan-300" />
                Study Dashboard
              </div>
              <p className="mt-2 text-slate-400">Manage your performance, subjects, and AI recommendations.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() =>
                  onOpenChat({
                    subjects,
                    studentName,
                    studentProgram,
                  })
                }
                className="glow-button inline-flex items-center gap-2 rounded-3xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                <ChatIcon className="text-slate-950" />
                AI Chat
              </button>

              <button
                onClick={onLogout}
                className="glow-button rounded-3xl bg-rose-500 px-5 py-3 text-sm font-semibold transition hover:bg-rose-400"
              >
                Logout
              </button>
            </div>
          </div>
        </motion.div>

        {/* STUDENT INFO */}
        <motion.div
          variants={cardVariants}
          className="glass-card p-6 rounded-[2rem] border-white/10 mb-6"
        >
          <div className="inline-flex items-center gap-2 font-semibold mb-4 text-lg">
            <ProfileIcon className="text-cyan-300" />
            Student Profile
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Student Name"
              className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-3xl text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
            />

            <input
              value={studentProgram}
              onChange={(e) => setStudentProgram(e.target.value)}
              placeholder="Course / Program (e.g. BSCS)"
              className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-3xl text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <p className="text-slate-400 mt-4 text-sm">
            Logged in as: <span className="text-white">{studentName || "Unknown"}</span> • {studentProgram || "No program set"}
          </p>
        </motion.div>

        {/* ADD SUBJECT */}
        <motion.div
          variants={cardVariants}
          className="glass-card p-6 rounded-[2rem] border-white/10 mb-6"
        >
          <h2 className="mb-4 font-semibold">Add Subject</h2>

          <div className="grid md:grid-cols-3 gap-4">
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject Name"
              className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-3xl text-white outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
            />

            <input
              type="number"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="Grade"
              className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-3xl text-white outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
            />

            <input
              type="number"
              value={attendance}
              onChange={(e) => setAttendance(e.target.value)}
              placeholder="Attendance"
              className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-3xl text-white outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <button
            onClick={addSubject}
            className="mt-4 glow-button rounded-3xl bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            Add Subject
          </button>
        </motion.div>

        {/* STATS */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-4 mb-6"
        >
          <motion.div
            variants={cardVariants}
            className="glass-card p-6 rounded-3xl border-white/10"
          >
            <p className="text-sm text-slate-400">Average Grade</p>
            <p className="text-3xl font-bold mt-3">{average}%</p>
          </motion.div>
          <motion.div
            variants={cardVariants}
            className="glass-card p-6 rounded-3xl border-white/10"
          >
            <p className="text-sm text-slate-400">Weakest Subject</p>
            <p className="text-2xl font-semibold mt-3">{weak ? weak.course : "-"}</p>
          </motion.div>
          <motion.div
            variants={cardVariants}
            className="glass-card p-6 rounded-3xl border-white/10"
          >
            <p className="text-sm text-slate-400">Attendance</p>
            <p className="text-3xl font-bold mt-3">{avgAttendance}%</p>
          </motion.div>
        </motion.div>

        {/* AI */}
        <motion.div
          variants={cardVariants}
          className="glass-card p-6 rounded-[2rem] border-white/10 mb-6"
        >
          <div className="inline-flex items-center gap-2 font-semibold mb-3 text-lg">
            <BrainIcon className="text-cyan-300" />
            AI Recommendation
          </div>
          <p className="text-slate-300">{getRecommendation()}</p>
        </motion.div>

        {/* TASKS */}
        <motion.div
          variants={cardVariants}
          className="glass-card p-6 rounded-[2rem] border-white/10 mb-6"
        >
          <div className="inline-flex items-center gap-2 mb-4 font-semibold text-lg">
            <CalendarIcon className="text-cyan-300" />
            Study Planner
          </div>

          <div className="grid lg:grid-cols-[1fr_100px_140px] gap-4">
            <input
              value={taskSubject}
              onChange={(e) => setTaskSubject(e.target.value)}
              placeholder="Subject"
              className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-3xl text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
            />
            <input
              value={taskHours}
              onChange={(e) => setTaskHours(e.target.value)}
              placeholder="Hours"
              type="number"
              className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-3xl text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
            />
            <button
              onClick={addTask}
              className="glow-button rounded-3xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Add
            </button>
          </div>
        </motion.div>

        {/* SUBJECT LIST */}
        <motion.div
          variants={cardVariants}
          className="glass-card p-6 rounded-[2rem] border-white/10"
        >
          <div className="inline-flex items-center gap-2 mb-6 font-semibold text-lg">
            <GradesIcon className="text-cyan-300" />
            Subjects
          </div>
          <div className="space-y-4">
            {subjects.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between bg-white/5 p-4 rounded-3xl border border-white/10"
              >
                <div>
                  <p className="font-semibold">{s.subject}</p>
                  <p className="text-sm text-slate-400">Grade: {s.grade}% • Attendance: {s.attendance}%</p>
                </div>
                <button
                  onClick={() => deleteSubject(s.id)}
                  className="text-rose-400 transition hover:text-rose-300"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}