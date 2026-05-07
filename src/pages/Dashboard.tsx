import { motion } from "framer-motion";
import { BrainIcon, CalendarIcon, DashboardIcon, TrendingDownIcon, TrendingUpIcon } from "../components/Icons";

type Subject = {
  id: number;
  course: string;
  grade: number;
  attendance: number;
};

export default function Dashboard({ subjects }: any) {
  const highest =
    subjects.length > 0
      ? subjects.reduce((max: any, s: any) => (s.grade > max.grade ? s : max))
      : null;

  const weakest =
    subjects.length > 0
      ? subjects.reduce((min: any, s: any) => (s.grade < min.grade ? s : min))
      : null;

  const avgAttendance =
    subjects.length > 0
      ? Math.round(
          subjects.reduce((sum: number, s: any) => sum + s.attendance, 0) /
            subjects.length
        )
      : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-transparent text-white p-6"
    >
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-3 text-3xl font-bold mb-6"
      >
        <DashboardIcon className="text-cyan-300" />
        Overview Dashboard
      </motion.h1>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-3 gap-4"
      >
        <motion.div
          variants={cardVariants}
          whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          className="glass-card p-5 rounded-xl cursor-pointer"
        >
          <div className="flex items-center gap-2 text-gray-400">
            <TrendingUpIcon className="text-emerald-300" />
            Highest Subject
          </div>
          <p className="text-xl font-bold mt-4">{highest ? highest.course : "-"}</p>
          <p className="text-green-400">{highest ? highest.grade + "%" : ""}</p>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          className="glass-card p-5 rounded-xl cursor-pointer"
        >
          <div className="flex items-center gap-2 text-gray-400">
            <TrendingDownIcon className="text-rose-300" />
            Weakest Subject
          </div>
          <p className="text-xl font-bold mt-4">{weakest ? weakest.course : "-"}</p>
          <p className="text-red-400">{weakest ? weakest.grade + "%" : ""}</p>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          className="glass-card p-5 rounded-xl cursor-pointer"
        >
          <div className="flex items-center gap-2 text-gray-400">
            <CalendarIcon className="text-cyan-300" />
            Attendance
          </div>
          <p className="text-2xl font-bold mt-4">{avgAttendance}%</p>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="glass-card mt-6 p-5 rounded-xl"
      >
        <div className="flex items-center gap-2 font-semibold mb-3 text-gray-100">
          <BrainIcon className="text-cyan-300" />
          AI Insight
        </div>

        {weakest && weakest.grade < 75 ? (
          <p>Focus more on {weakest.course}. Improve consistency.</p>
        ) : (
          <p>Great performance! Keep it up.</p>
        )}
      </motion.div>
    </motion.div>
  );
}
