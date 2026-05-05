type Subject = {
    id: number;
    course: string;
    grade: number;
    attendance: number;
  };
  
  export default function Dashboard({ subjects }: any) {
  
    const highest =
      subjects.length > 0
        ? subjects.reduce((max: any, s: any) =>
            s.grade > max.grade ? s : max
          )
        : null;
  
    const weakest =
      subjects.length > 0
        ? subjects.reduce((min: any, s: any) =>
            s.grade < min.grade ? s : min
          )
        : null;
  
    const avgAttendance =
      subjects.length > 0
        ? Math.round(
            subjects.reduce((sum: number, s: any) => sum + s.attendance, 0) /
              subjects.length
          )
        : 0;
  
    return (
      <div className="min-h-screen bg-[#0f1115] text-white p-6">
  
        <h1 className="text-3xl font-bold mb-6">📊 Overview Dashboard</h1>
  
        <div className="grid md:grid-cols-3 gap-4">
  
          <div className="bg-[#1a1d23] p-5 rounded-xl">
            <h2 className="text-gray-400">🔥 Highest Subject</h2>
            <p className="text-xl font-bold">
              {highest ? highest.course : "-"}
            </p>
            <p className="text-green-400">
              {highest ? highest.grade + "%" : ""}
            </p>
          </div>
  
          <div className="bg-[#1a1d23] p-5 rounded-xl">
            <h2 className="text-gray-400">⚠ Weakest Subject</h2>
            <p className="text-xl font-bold">
              {weakest ? weakest.course : "-"}
            </p>
            <p className="text-red-400">
              {weakest ? weakest.grade + "%" : ""}
            </p>
          </div>
  
          <div className="bg-[#1a1d23] p-5 rounded-xl">
            <h2 className="text-gray-400">👥 Attendance</h2>
            <p className="text-2xl font-bold">{avgAttendance}%</p>
          </div>
  
        </div>
  
        {/* AI INSIGHT */}
        <div className="mt-6 bg-[#1a1d23] p-5 rounded-xl">
          <h2 className="font-semibold mb-2">🧠 AI Insight</h2>
  
          {weakest && weakest.grade < 75 ? (
            <p>Focus more on {weakest.course}. Improve consistency.</p>
          ) : (
            <p>Great performance! Keep it up 🚀</p>
          )}
        </div>
  
      </div>
    );
  }