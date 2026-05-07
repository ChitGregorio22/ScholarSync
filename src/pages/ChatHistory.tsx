import { ChatIcon } from "../components/Icons";

export default function ChatHistory() {
    const data = JSON.parse(localStorage.getItem("chatHistory") || "[]");
  
    return (
      <div className="min-h-screen bg-transparent text-white p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="glass-card p-6 rounded-[2rem] border-white/10">
            <h1 className="inline-flex items-center gap-3 text-2xl font-bold mb-2">
              <ChatIcon className="text-cyan-300" />
              Chat History
            </h1>
            <p className="text-slate-400">Review your past AI conversations in a clean, elegant panel.</p>
          </div>

          <div className="space-y-4">
            {data.length === 0 && (
              <div className="glass-card p-6 rounded-[2rem] border-white/10">
                <p className="text-slate-400">No history yet</p>
              </div>
            )}
  
            {data.map((c: any, i: number) => (
              <div key={i} className="glass-card p-5 rounded-3xl border border-white/10 bg-white/5">
                <p className="text-slate-200 font-semibold mb-2">Q: {c.q}</p>
                <p className="text-cyan-200">A: {c.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }