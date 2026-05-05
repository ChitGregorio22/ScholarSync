import { useState, useEffect } from "react";

type Subject = {
  id: number;
  course: string;
  grade: number;
  attendance: number;
};

type Task = {
  id: number;
  subject: string;
  hours: number;
};

export default function Dashboard({ onOpenChat, onLogout }: any) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [course, setCourse] = useState("");
  const [grade, setGrade] = useState("");
  const [attendance, setAttendance] = useState("");

  const [taskSubject, setTaskSubject] = useState("");
  const [taskHours, setTaskHours] = useState("");

  // ✅ NEW: Student Identity
  const [studentName, setStudentName] = useState("");
  const [studentProgram, setStudentProgram] = useState("");

  // LOAD DATA
  useEffect(() => {
    const savedSubjects = localStorage.getItem("subjects");
    const savedTasks = localStorage.getItem("tasks");

    const savedName = localStorage.getItem("studentName");
    const savedProgram = localStorage.getItem("studentProgram");

    if (savedSubjects) setSubjects(JSON.parse(savedSubjects));
    if (savedTasks) setTasks(JSON.parse(savedTasks));

    if (savedName) setStudentName(savedName);
    if (savedProgram) setStudentProgram(savedProgram);
  }, []);

  // SAVE DATA
  useEffect(() => {
    localStorage.setItem("subjects", JSON.stringify(subjects));
  }, [subjects]);

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
    if (!course || !grade || !attendance) return;

    const newSubject: Subject = {
      id: Date.now(),
      course,
      grade: Number(grade),
      attendance: Number(attendance),
    };

    setSubjects([newSubject, ...subjects]);
    setCourse("");
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
      return `Focus on ${weak.course}. Study 1–2 hours daily.`;
    }

    if (avgAttendance < 80) {
      return "Improve your attendance to boost performance.";
    }

    return "Great job! Keep maintaining your performance.";
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-white p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold">🎓 Dashboard</h1>

          <div className="flex gap-3">
            <button
              onClick={() =>
                onOpenChat({
                  subjects,
                  studentName,
                  studentProgram,
                })
              }
              className="bg-emerald-500 px-4 py-2 rounded-xl"
            >
              🤖 AI Chat
            </button>

            <button
              onClick={onLogout}
              className="bg-red-500 px-4 py-2 rounded-xl"
            >
              Logout
            </button>
          </div>
        </div>

        {/* ✅ STUDENT INFO (NEW BLOCK) */}
        <div className="bg-[#1a1d23] p-5 rounded-xl mb-6">
          <h2 className="font-semibold mb-3">👤 Student Profile</h2>

          <div className="grid md:grid-cols-2 gap-3">
            <input
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Student Name"
              className="bg-black p-3 rounded"
            />

            <input
              value={studentProgram}
              onChange={(e) => setStudentProgram(e.target.value)}
              placeholder="Course / Program (e.g. BSCS)"
              className="bg-black p-3 rounded"
            />
          </div>

          <p className="text-gray-400 mt-3 text-sm">
            Logged in as:{" "}
            <span className="text-white">
              {studentName || "Unknown"}
            </span>{" "}
            • {studentProgram || "No program set"}
          </p>
        </div>

        {/* ADD SUBJECT */}
        <div className="bg-[#1a1d23] p-5 rounded-xl mb-6">
          <h2 className="mb-3 font-semibold">Add Subject</h2>

          <div className="grid md:grid-cols-3 gap-3">
            <input
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="Course"
              className="bg-black p-3 rounded"
            />

            <input
              type="number"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="Grade"
              className="bg-black p-3 rounded"
            />

            <input
              type="number"
              value={attendance}
              onChange={(e) => setAttendance(e.target.value)}
              placeholder="Attendance"
              className="bg-black p-3 rounded"
            />
          </div>

          <button
            onClick={addSubject}
            className="mt-3 bg-white text-black px-4 py-2 rounded"
          >
            Add
          </button>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#1a1d23] p-4 rounded">
            Average: {average}%
          </div>
          <div className="bg-[#1a1d23] p-4 rounded">
            Weak: {weak ? weak.course : "-"}
          </div>
          <div className="bg-[#1a1d23] p-4 rounded">
            Attendance: {avgAttendance}%
          </div>
        </div>

        {/* AI */}
        <div className="bg-[#1a1d23] p-5 rounded mb-6">
          <h2 className="font-semibold mb-2">🧠 AI Recommendation</h2>
          <p className="text-gray-300">{getRecommendation()}</p>
        </div>

        {/* TASKS */}
        <div className="bg-[#1a1d23] p-5 rounded mb-6">
          <h2 className="mb-3 font-semibold">📅 Study Planner</h2>

          <div className="flex gap-3">
            <input
              value={taskSubject}
              onChange={(e) => setTaskSubject(e.target.value)}
              placeholder="Subject"
              className="bg-black p-2 rounded"
            />
            <input
              value={taskHours}
              onChange={(e) => setTaskHours(e.target.value)}
              placeholder="Hours"
              type="number"
              className="bg-black p-2 rounded"
            />
            <button
              onClick={addTask}
              className="bg-emerald-500 px-3 rounded"
            >
              Add
            </button>
          </div>
        </div>

        {/* SUBJECT LIST */}
        <div className="bg-[#1a1d23] p-5 rounded">
          <h2 className="mb-3 font-semibold">Subjects</h2>

          {subjects.map((s) => (
            <div
              key={s.id}
              className="flex justify-between bg-black p-3 rounded mb-2"
            >
              <div>
                {s.course} ({s.grade}%)
              </div>

              <button
                onClick={() => deleteSubject(s.id)}
                className="text-red-400"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}