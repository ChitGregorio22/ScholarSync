import { useState } from "react";
import { motion } from "framer-motion";
import { CheckIcon, LogoIcon } from "../components/Icons";

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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex justify-between items-center px-8 py-5 border-b border-gray-800 rounded-b-[2rem]"
      >
        <motion.h1
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center gap-3 text-xl font-bold tracking-wide"
        >
          <LogoIcon className="text-cyan-300" />
          Student AI System
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsLogin(true)}
            className={`glow-button px-4 py-2 rounded-3xl transition ${
              isLogin ? "bg-white text-black" : "bg-gray-800"
            }`}
          >
            Login
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsLogin(false)}
            className={`glow-button px-4 py-2 rounded-3xl transition ${
              !isLogin ? "bg-white text-black" : "bg-gray-800"
            }`}
          >
            Register
          </motion.button>
        </motion.div>
      </motion.div>

      {/* HERO SECTION */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-5xl grid md:grid-cols-2 gap-10 items-center">

          {/* LEFT SIDE */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold leading-tight gradient-text"
            >
              Smarter Learning <br />
              for Students
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-gray-400 mt-4"
            >
              Track grades, attendance, tasks, and get AI study advice in real time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-6 space-y-3 text-sm text-gray-500"
            >
              {[
                "AI Study Advisor",
                "Attendance Tracking (Calendar View)",
                "Grade Analytics Dashboard",
                "Smart Study Planner",
              ].map((feature, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckIcon className="text-cyan-400" />
                  {feature}
                </motion.p>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT SIDE - AUTH CARD */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="glass-card p-8 rounded-[3rem] border border-white/10"
          >

            <motion.h3
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-semibold mb-6"
            >
              {isLogin ? "Login to your account" : "Create new account"}
            </motion.h3>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4"
            >

              <motion.input
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                whileFocus={{ scale: 1.01 }}
                type="email"
                placeholder="Email (must include @)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-3xl bg-white/5 border border-white/10 text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition"
              />

              <motion.input
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
                whileFocus={{ scale: 1.01 }}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-3xl bg-white/5 border border-white/10 text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition"
              />

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                className="glow-button w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold py-3 rounded-3xl hover:opacity-90 transition shadow-lg shadow-cyan-500/20"
              >
                {isLogin ? "Login" : "Register"}
              </motion.button>

            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-xs text-gray-500 mt-4 text-center"
            >
              {isLogin
                ? "Welcome back, ready to continue your learning?"
                : "Start your learning journey today"}
            </motion.p>

          </motion.div>

        </div>
      </div>

      {/* FOOTER */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="text-center text-gray-600 text-xs py-4 border-t border-gray-800"
      >
        © 2026 Student AI System
      </motion.div>

    </div>
  );
}