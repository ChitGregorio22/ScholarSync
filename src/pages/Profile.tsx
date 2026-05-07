import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarIcon, ProfileIcon } from "../components/Icons";

type AttendanceDay = {
  date: string; // YYYY-MM-DD
  status: "present" | "absent";
};

export default function Profile() {
  const [studentName, setStudentName] = useState("");
  const [course, setCourse] = useState("");

  const [attendance, setAttendance] = useState<AttendanceDay[]>([]);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // LOAD DATA
  useEffect(() => {
    const savedName = localStorage.getItem("studentName");
    const savedCourse = localStorage.getItem("studentCourse");
    const savedAttendance = localStorage.getItem("attendance");

    if (savedName) setStudentName(savedName);
    if (savedCourse) setCourse(savedCourse);
    if (savedAttendance) setAttendance(JSON.parse(savedAttendance));
  }, []);

  // SAVE DATA
  useEffect(() => {
    localStorage.setItem("studentName", studentName);
    localStorage.setItem("studentCourse", course);
    localStorage.setItem("attendance", JSON.stringify(attendance));
  }, [studentName, course, attendance]);

  // TOGGLE ATTENDANCE DAY (cycles: no data -> present -> absent -> no data)
  const toggleDay = (day: number) => {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    const existing = attendance.find((a) => a.date === date);

    if (!existing) {
      // No data -> Present
      setAttendance([...attendance, { date, status: "present" }]);
    } else if (existing.status === "present") {
      // Present -> Absent
      setAttendance(
        attendance.map((a) =>
          a.date === date ? { ...a, status: "absent" } : a
        )
      );
    } else {
      // Absent -> No data (remove from array)
      setAttendance(attendance.filter((a) => a.date !== date));
    }
  };

  const getStatus = (day: number) => {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    return attendance.find((a) => a.date === date)?.status;
  };

  // GET ATTENDANCE STATS
  const getAttendanceStats = () => {
    const present = attendance.filter((a) => a.status === "present").length;
    const absent = attendance.filter((a) => a.status === "absent").length;
    const total = present + absent;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, absent, total, percentage };
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
      <div className="max-w-5xl mx-auto space-y-6">

        {/* PROFILE HEADER */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="glass-card p-6 rounded-[2rem] border-white/10"
        >
          <h1 className="inline-flex items-center gap-3 text-2xl font-bold mb-4">
            <ProfileIcon className="text-cyan-300" />
            Student Profile
          </h1>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Student Name"
              className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-3xl text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
            />

            <input
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="Course"
              className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-3xl text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <p className="text-slate-400 mt-3">
            {studentName || "No name"} • {course || "No course"}
          </p>
        </motion.div>

        {/* ATTENDANCE CALENDAR */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="glass-card p-6 rounded-[2rem] border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="inline-flex items-center gap-3 text-xl font-semibold">
              <CalendarIcon className="text-cyan-300" />
              Attendance Calendar
            </h2>
            <p className="text-cyan-300 font-semibold">
              {new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>

          <p className="text-gray-400 mb-4 text-sm">
            Click a day to cycle: No Data → Present (green) → Absent (red) → No Data
          </p>

          {/* DAY HEADERS */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-slate-400 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const status = getStatus(day);

              return (
                <motion.button
                  key={day}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleDay(day)}
                  className={`
                    p-3 rounded-3xl text-sm font-semibold transition border border-white/10 shadow-sm shadow-slate-900/20 hover:shadow-md
                    ${
                      status === "present"
                        ? "bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/20"
                        : status === "absent"
                        ? "bg-gradient-to-br from-rose-400 to-rose-600 text-slate-950 shadow-lg shadow-rose-500/20"
                        : "bg-white/5 text-slate-200 hover:bg-white/10"
                    }
                  `}
                >
                  {day}
                </motion.button>
              );
            })}
          </div>

          {/* LEGEND & STATS */}
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap gap-4 p-4 rounded-3xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg shadow-lg shadow-emerald-500/20"></div>
                <span className="text-sm text-gray-300">Present</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gradient-to-br from-rose-400 to-rose-600 rounded-lg shadow-lg shadow-rose-500/20"></div>
                <span className="text-sm text-gray-300">Absent</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-white/10 border border-white/20 rounded-lg"></div>
                <span className="text-sm text-gray-400">No Data</span>
              </div>
            </div>

            {/* ATTENDANCE STATS */}
            <div className="grid grid-cols-4 gap-3">
              <motion.div className="p-4 rounded-3xl bg-white/5 border border-white/10 text-center">
                <p className="text-xs text-gray-400 mb-1">Present</p>
                <p className="text-lg font-bold text-emerald-400">{getAttendanceStats().present}</p>
              </motion.div>
              <motion.div className="p-4 rounded-3xl bg-white/5 border border-white/10 text-center">
                <p className="text-xs text-gray-400 mb-1">Absent</p>
                <p className="text-lg font-bold text-rose-400">{getAttendanceStats().absent}</p>
              </motion.div>
              <motion.div className="p-4 rounded-3xl bg-white/5 border border-white/10 text-center">
                <p className="text-xs text-gray-400 mb-1">Total</p>
                <p className="text-lg font-bold text-cyan-400">{getAttendanceStats().total}</p>
              </motion.div>
              <motion.div className="p-4 rounded-3xl bg-white/5 border border-white/10 text-center">
                <p className="text-xs text-gray-400 mb-1">Rate</p>
                <p className="text-lg font-bold text-blue-400">{getAttendanceStats().percentage}%</p>
              </motion.div>
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}