import { useEffect, useState } from "react";

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

  // TOGGLE ATTENDANCE DAY
  const toggleDay = (day: number) => {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    const existing = attendance.find((a) => a.date === date);

    if (existing) {
      setAttendance(
        attendance.map((a) =>
          a.date === date
            ? {
                ...a,
                status: a.status === "present" ? "absent" : "present",
              }
            : a
        )
      );
    } else {
      setAttendance([
        ...attendance,
        { date, status: "present" },
      ]);
    }
  };

  const getStatus = (day: number) => {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    return attendance.find((a) => a.date === date)?.status;
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-white p-6">
      <div className="max-w-5xl mx-auto">

        {/* PROFILE HEADER */}
        <div className="bg-[#1a1d23] p-6 rounded-2xl mb-6">
          <h1 className="text-2xl font-bold mb-4">👤 Student Profile</h1>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Student Name"
              className="bg-black p-3 rounded"
            />

            <input
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="Course"
              className="bg-black p-3 rounded"
            />
          </div>

          <p className="text-gray-400 mt-3">
            {studentName || "No name"} • {course || "No course"}
          </p>
        </div>

        {/* ATTENDANCE CALENDAR */}
        <div className="bg-[#1a1d23] p-6 rounded-2xl">
          <h2 className="text-xl font-semibold mb-4">
            📅 Attendance Calendar
          </h2>

          <p className="text-gray-400 mb-4 text-sm">
            Click a day to mark Present (green) or Absent (red)
          </p>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const status = getStatus(day);

              return (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`
                    p-3 rounded-lg text-sm font-semibold transition
                    ${
                      status === "present"
                        ? "bg-green-600"
                        : status === "absent"
                        ? "bg-red-600"
                        : "bg-black"
                    }
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* LEGEND */}
          <div className="flex gap-4 mt-6 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded"></div>
              Present
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded"></div>
              Absent
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-black border border-gray-500 rounded"></div>
              No Data
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}