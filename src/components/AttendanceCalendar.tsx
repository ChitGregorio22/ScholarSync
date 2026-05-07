import { CalendarIcon } from "./Icons";

type AttendanceDay = {
    date: string; // "2026-04-01"
    present: boolean;
  };
  
  export default function AttendanceCalendar({
    data,
  }: {
    data: AttendanceDay[];
  }) {
    const days = data.length ? data : generateMockCalendar();
  
    return (
      <div className="bg-[#1a1d23] p-5 rounded-xl">
        <div className="inline-flex items-center gap-2 text-lg font-bold mb-4">
          <CalendarIcon className="text-cyan-300" />
          Attendance Calendar
        </div>
  
        <div className="grid grid-cols-7 gap-2">
          {days.map((d, i) => (
            <div
              key={i}
              className={`h-10 w-10 flex items-center justify-center rounded-lg text-xs font-bold
                ${d.present ? "bg-emerald-500" : "bg-red-500"}
              `}
              title={d.date}
            >
              {new Date(d.date).getDate()}
            </div>
          ))}
        </div>
  
        <div className="flex gap-4 mt-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
            Present
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-3 w-3 rounded-full bg-rose-500"></span>
            Absent
          </div>
        </div>
      </div>
    );
  }
  
  // fallback demo calendar
  function generateMockCalendar(): AttendanceDay[] {
    const today = new Date();
    const arr: AttendanceDay[] = [];
  
    for (let i = 1; i <= 30; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), i);
  
      arr.push({
        date: d.toISOString().split("T")[0],
        present: Math.random() > 0.3,
      });
    }
  
    return arr;
  }