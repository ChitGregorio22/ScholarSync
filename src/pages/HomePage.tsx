import { useState } from "react";

export default function HomePage({ onLogin, onRegister }: any) {
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    if (!email.includes("@")) {
      alert("Please enter a valid email.");
      return;
    }

    if (isLogin) {
      onLogin({ email, password });
    } else {
      onRegister({ email, password });
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0d10] text-white flex flex-col">

      {/* TOP NAV */}
      <div className="flex justify-between items-center px-8 py-5 border-b border-gray-800">
        <h1 className="text-xl font-bold tracking-wide">
          🎓 Student AI System
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => setIsLogin(true)}
            className={`px-4 py-2 rounded-lg transition ${
              isLogin ? "bg-white text-black" : "bg-gray-800"
            }`}
          >
            Login
          </button>

          <button
            onClick={() => setIsLogin(false)}
            className={`px-4 py-2 rounded-lg transition ${
              !isLogin ? "bg-white text-black" : "bg-gray-800"
            }`}
          >
            Register
          </button>
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-5xl grid md:grid-cols-2 gap-10 items-center">

          {/* LEFT SIDE */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Smarter Learning <br />
              for Students 🚀
            </h2>

            <p className="text-gray-400 mt-4">
              Track grades, attendance, tasks, and get AI study advice in real time.
            </p>

            <div className="mt-6 space-y-2 text-sm text-gray-500">
              <p>✔ AI Study Advisor</p>
              <p>✔ Attendance Tracking (Calendar View)</p>
              <p>✔ Grade Analytics Dashboard</p>
              <p>✔ Smart Study Planner</p>
            </div>
          </div>

          {/* RIGHT SIDE - AUTH CARD */}
          <div className="bg-[#141820] p-8 rounded-2xl shadow-2xl border border-gray-800">

            <h3 className="text-2xl font-semibold mb-6">
              {isLogin ? "Login to your account" : "Create new account"}
            </h3>

            <div className="space-y-4">

              <input
                type="email"
                placeholder="Email (must include @)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-lg bg-black border border-gray-700 focus:outline-none focus:border-white"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-lg bg-black border border-gray-700 focus:outline-none focus:border-white"
              />

              <button
                onClick={handleSubmit}
                className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:opacity-90 transition"
              >
                {isLogin ? "Login" : "Register"}
              </button>

            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              {isLogin
                ? "Welcome back student 👋"
                : "Start your learning journey today"}
            </p>

          </div>

        </div>
      </div>

      {/* FOOTER */}
      <div className="text-center text-gray-600 text-xs py-4 border-t border-gray-800">
        © 2026 Student AI System
      </div>

    </div>
  );
}