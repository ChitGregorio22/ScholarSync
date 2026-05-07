import { ChatIcon, DashboardIcon, GradesIcon, LogoIcon, ProfileIcon } from "./Icons";

export default function Sidebar({ setPage }: any) {
    return (
      <aside className="w-72 min-h-screen glass-card border-r border-white/10 p-6 text-white">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-3xl bg-slate-900/50 px-4 py-2 text-sm font-semibold tracking-wide text-cyan-100 shadow-sm shadow-cyan-500/10">
            <LogoIcon className="text-cyan-300" />
            STUDENT AI
          </div>
          <p className="mt-4 text-sm text-slate-300">A modern study companion with AI insights.</p>
        </div>

        <div className="space-y-3">
          <button onClick={() => setPage("dashboard")}
            className="w-full text-left p-4 rounded-3xl border border-white/10 bg-white/5 transition hover:bg-white/10">
            <span className="inline-flex items-center gap-3">
              <DashboardIcon className="text-cyan-200" />
              Dashboard
            </span>
          </button>

          <button onClick={() => setPage("grades")}
            className="w-full text-left p-4 rounded-3xl border border-white/10 bg-white/5 transition hover:bg-white/10">
            <span className="inline-flex items-center gap-3">
              <GradesIcon className="text-cyan-200" />
              Grades Manager
            </span>
          </button>

          <button onClick={() => setPage("profile")}
            className="w-full text-left p-4 rounded-3xl border border-white/10 bg-white/5 transition hover:bg-white/10">
            <span className="inline-flex items-center gap-3">
              <ProfileIcon className="text-cyan-200" />
              Profile
            </span>
          </button>

          <button onClick={() => setPage("chat")}
            className="w-full text-left p-4 rounded-3xl border border-white/10 bg-white/5 transition hover:bg-white/10">
            <span className="inline-flex items-center gap-3">
              <ChatIcon className="text-cyan-200" />
              AI Chat
            </span>
          </button>
        </div>
      </aside>
    );
  }