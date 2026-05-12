import { useState } from "react";
import { signIn, signUp } from "../lib/supabase-simple";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { 
  GraduationCap, 
  Rocket, 
  CheckCircle2, 
  ArrowRight, 
  Mail, 
  Lock, 
  User, 
  LayoutDashboard, 
  MessageSquare, 
  TrendingUp, 
  Calendar,
  Zap,
  Shield,
  BarChart3
} from "lucide-react";

/**
 * HomePage Component
 * 
 * Features a premium landing page design with integrated authentication flow.
 * Uses Framer Motion for animations and Lucide React for iconography.
 * 
 * @param {Object} props
 * @param {Function} props.onLoginSuccess - Callback when user successfully authenticates
 */
export default function HomePage({ onLoginSuccess }: { onLoginSuccess: (user: any) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"hero" | "features" | "how-it-works">("hero");

  const handleSubmit = async () => {
    setError(null);

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!isLogin && !fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const data = await Promise.race([
          signIn(email, password),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), 28000))
        ]) as any;
        onLoginSuccess(data.user);
      } else {
        const data = await Promise.race([
          signUp(email, password, fullName),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), 28000))
        ]) as any;
        onLoginSuccess(data.user);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark text-white font-sans selection:bg-brand-primary/30 flex flex-col relative overflow-hidden">
      
      {/* Background Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-brand-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      {/* TOP NAV */}
      <nav className="relative z-50 flex justify-between items-center px-6 md:px-12 py-6">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-2 group cursor-default"
        >
          <div className="bg-brand-primary p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            Scholar<span className="text-brand-primary">Sync</span>
          </h1>
        </motion.div>

        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400"
        >
          <button 
            onClick={() => setView("hero")} 
            className={`transition-colors ${view === "hero" ? "text-white" : "hover:text-white"}`}
          >
            Home
          </button>
          <button 
            onClick={() => setView("features")} 
            className={`transition-colors ${view === "features" ? "text-white" : "hover:text-white"}`}
          >
            Features
          </button>
          <button 
            onClick={() => setView("how-it-works")} 
            className={`transition-colors ${view === "how-it-works" ? "text-white" : "hover:text-white"}`}
          >
            How it works
          </button>
          <button 
            onClick={() => {
              setView("hero");
              setIsLogin(!isLogin);
            }}
            className="text-white bg-white/5 hover:bg-white/10 px-5 py-2 rounded-full border border-white/10 transition-all active:scale-95"
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </motion.div>
      </nav>

      {/* HERO SECTION */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {view === "hero" && (
            <motion.div 
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full grid lg:grid-cols-2 gap-16 items-center"
            >
          
          {/* LEFT SIDE: Copy */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold uppercase tracking-wider mb-4">
                <Rocket className="w-3 h-3" />
                Next-Gen Academic Assistant
              </span>
              <h2 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight">
                Unlock Your <br />
                <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                  Full Potential
                </span>
              </h2>
              <p className="text-lg text-gray-400 mt-6 max-w-lg leading-relaxed">
                Empower your educational journey with real-time grade analytics, smart scheduling, and AI-driven personalized advice.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
              {[
                { icon: MessageSquare, text: "AI Study Advisor" },
                { icon: Calendar, text: "Smart Planner" },
                { icon: TrendingUp, text: "Grade Analytics" },
                { icon: LayoutDashboard, text: "Central Dashboard" }
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <div className="p-2 rounded-lg bg-white/5 group-hover:bg-brand-primary/20 transition-colors">
                    <feature.icon className="w-5 h-5 text-brand-primary" />
                  </div>
                  <span className="text-sm font-medium text-gray-300">{feature.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT SIDE: Auth Card */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative"
          >
            {/* Card Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            
            <div className="relative glass-card p-8 md:p-10 shadow-2xl">
              <div className="mb-8">
                <h3 className="text-2xl font-bold">
                  {isLogin ? "Welcome Back" : "Join the Future"}
                </h3>
                <p className="text-gray-400 text-sm mt-2">
                  {isLogin 
                    ? "Enter your credentials to access your dashboard" 
                    : "Create an account to start your AI-powered journey"}
                </p>
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-sm flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 rotate-180" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                {!isLogin && (
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-brand-primary transition-colors" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:border-brand-primary transition-all placeholder:text-gray-600"
                    />
                  </div>
                )}

                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-brand-primary transition-colors" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:border-brand-primary transition-all placeholder:text-gray-600 disabled:opacity-50"
                  />
                </div>

                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-brand-primary transition-colors" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-black/40 border border-white/10 focus:outline-none focus:border-brand-primary transition-all placeholder:text-gray-600 disabled:opacity-50"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full relative group mt-4"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
                  <div className="relative w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        {isLogin ? "Sign In" : "Get Started"}
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </div>
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {isLogin 
                    ? "Don't have an account? Register now" 
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </div>
          </motion.div>
            </motion.div>
          )}

          {view === "features" && (
            <motion.div 
              key="features"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full py-10"
            >
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-6xl font-bold mb-6">Powerful <span className="text-brand-primary">Features</span></h2>
                <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                  Everything you need to manage your academic life, boosted by advanced Artificial Intelligence.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    icon: MessageSquare,
                    title: "AI Academic Advisor",
                    desc: "24/7 personalized coaching based on your actual performance data and goals."
                  },
                  {
                    icon: TrendingUp,
                    title: "Predictive Analytics",
                    desc: "See where your grades are heading before the semester ends with smart forecasting."
                  },
                  {
                    icon: Calendar,
                    title: "Dynamic Study Planner",
                    desc: "Automatically adjusts your study sessions based on upcoming deadlines and exam weights."
                  },
                  {
                    icon: Zap,
                    title: "Rapid Input",
                    desc: "Quickly log study hours and grades with our optimized, high-speed interface."
                  },
                  {
                    icon: Shield,
                    title: "Secure & Private",
                    desc: "Your academic data is encrypted and only accessible by you. Your privacy is our priority."
                  },
                  {
                    icon: BarChart3,
                    title: "Stunning Dashboard",
                    desc: "Visualize your entire academic career in one high-definition, interactive command center."
                  }
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card p-8 group hover:border-brand-primary/50 transition-all hover:-translate-y-2 duration-300"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <feature.icon className="w-8 h-8 text-brand-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed text-sm">
                      {feature.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {view === "how-it-works" && (
            <motion.div 
              key="how-it-works"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-4xl py-10"
            >
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-6xl font-bold mb-6">Simple <span className="text-brand-secondary">Steps</span></h2>
                <p className="text-gray-400 text-lg">Get started with ScholarSync in less than 2 minutes.</p>
              </div>

              <div className="space-y-12 relative">
                {/* Vertical Line */}
                <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-brand-primary to-brand-secondary opacity-20 hidden md:block" />

                {[
                  {
                    step: "01",
                    title: "Create Your Profile",
                    desc: "Sign up and set up your academic profile, including your institution and major.",
                    color: "brand-primary"
                  },
                  {
                    step: "02",
                    title: "Import Your Courses",
                    desc: "Add your current subjects, credits, and target grades for the semester.",
                    color: "brand-secondary"
                  },
                  {
                    step: "03",
                    title: "Track Your Progress",
                    desc: "Log your assessment scores and study hours throughout the week.",
                    color: "accent"
                  },
                  {
                    step: "04",
                    title: "Get AI Advice",
                    desc: "Our AI analyzes your data to give you personalized tips to reach your goals.",
                    color: "brand-primary"
                  }
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="flex gap-8 items-start relative z-10"
                  >
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xl text-brand-primary">
                      {step.step}
                    </div>
                    <div className="glass-card p-8 flex-1">
                      <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                      <p className="text-gray-400">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 px-6 py-8 border-t border-white/5 text-center">
        <p className="text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} ScholarSync. Built for academic excellence.
        </p>
      </footer>
    </div>
  );
}