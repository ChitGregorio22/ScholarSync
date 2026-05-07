import { useState } from "react";
import { LogoIcon } from "../components/Icons";

export default function Login({ onLogin }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // EMAIL VALIDATION FUNCTION
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email (example: name@gmail.com)");
      return;
    }

    setError("");
    onLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      
      <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md">

        <div className="flex items-center justify-center gap-3 text-center mb-2 text-3xl font-bold">
          <LogoIcon className="text-indigo-500" />
          AI Study Advisor
        </div>

        <p className="text-center text-gray-500 mb-6">
          Login to continue
        </p>

        {/* EMAIL */}
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          placeholder="Email"
        />

        {/* PASSWORD */}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
          placeholder="Password"
        />

        {/* ERROR MESSAGE */}
        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">
            {error}
          </p>
        )}

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition"
        >
          Login
        </button>

      </div>
    </div>
  );
}