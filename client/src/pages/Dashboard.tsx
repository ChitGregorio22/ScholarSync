import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BrainCircuit, 
  ArrowUpRight,
  Target,
  Award,
  Calendar,
  MessageSquare
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";

type Subject = any; // Will refine this later to match actual academic data structure

/**
 * Dashboard Component
 * 
 * Premium overview of student performance with analytics and AI insights.
 * Uses Recharts for data visualization and Framer Motion for entrance animations.
 * 
 * @param {Object} props
 * @param {Array<Subject>} props.subjects - List of student subjects/courses
 * @param {Object} props.user - Current user object
 */
export default function Dashboard({ subjects, user }: { subjects: Subject[], user: any }) {
  const highest =
    subjects.length > 0
      ? subjects.reduce((max, s) => ((s.grade || 0) > (max.grade || 0) ? s : max))
      : null;

  const weakest =
    subjects.length > 0
      ? subjects.reduce((min, s) => ((s.grade || 0) < (min.grade || 0) ? s : min))
      : null;

  const avgAttendance =
    subjects.length > 0
      ? Math.round(
          subjects.reduce((sum, s) => sum + (s.attendance || 0), 0) / subjects.length
        )
      : 0;

  const avgGrade = 
    subjects.length > 0
      ? Math.round(
          subjects.reduce((sum, s) => sum + (s.grade || 0), 0) / subjects.length
        )
      : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-8"
    >
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.user_metadata?.full_name || "Student"}!</h1>
          <p className="text-gray-400 mt-1">Here's your academic progress at a glance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-primary" />
            <span className="text-sm font-medium">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="GPA Equivalent" 
          value={`${avgGrade}%`} 
          subtitle="Overall Average"
          icon={Award}
          color="brand-primary"
          trend="+2.4%"
        />
        <StatCard 
          title="Attendance" 
          value={`${avgAttendance}%`} 
          subtitle="Class Participation"
          icon={Users}
          color="accent"
          trend="Stable"
        />
        <StatCard 
          title="Best Subject" 
          value={highest?.grade ? `${highest.grade}%` : "-"} 
          subtitle={highest?.course || "N/A"}
          icon={TrendingUp}
          color="green-400"
        />
        <StatCard 
          title="Needs Focus" 
          value={weakest?.grade ? `${weakest.grade}%` : "-"} 
          subtitle={weakest?.course || "N/A"}
          icon={TrendingDown}
          color="red-400"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-6 min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold">Performance Analytics</h3>
              <p className="text-sm text-gray-500">Grade distribution across subjects</p>
            </div>
            <button className="text-brand-primary text-sm font-semibold flex items-center gap-1 hover:underline">
              View full report <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 w-full min-h-[300px]">
            {subjects.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={subjects}>
                  <defs>
                    <linearGradient id="colorGrade" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="course" 
                    stroke="#ffffff40" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#ffffff40" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#161a22', 
                      border: '1px solid #ffffff10',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                    itemStyle={{ color: '#6366f1' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="grade" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorGrade)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-4">
                <Target className="w-12 h-12 opacity-20" />
                <p>Add some subjects to see your performance chart.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* AI Insight Sidebar */}
        <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-brand-primary/20 p-2 rounded-lg">
              <BrainCircuit className="w-5 h-5 text-brand-primary" />
            </div>
            <h3 className="text-lg font-bold">AI Recommendations</h3>
          </div>

          <div className="space-y-6 flex-1">
            {subjects.length === 0 ? (
              <p className="text-gray-500 text-sm leading-relaxed">
                Start adding your grades in the Grades Manager to receive personalized AI study advice.
              </p>
            ) : (
              <>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                  <p className="text-xs font-bold text-brand-primary uppercase tracking-wider">Analysis</p>
                  <p className="text-sm leading-relaxed">
                    {weakest && weakest.grade < 75 
                      ? `Your performance in ${weakest.course} is below target. Consider increasing study time for this subject by 30%.` 
                      : `You're performing exceptionally well in ${highest?.course}. Keep maintaining this momentum!`}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                  <p className="text-xs font-bold text-accent uppercase tracking-wider">Suggested Task</p>
                  <p className="text-sm leading-relaxed">
                    Review past assignments for {weakest?.course || "your weakest subject"} to identify recurring conceptual gaps.
                  </p>
                </div>
              </>
            )}
          </div>

          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('switchPage', { detail: 'chat' }))}
            className="w-full mt-6 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-3 rounded-xl transition active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Talk to AI Advisor
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color, trend }: any) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="glass-card p-5 space-y-3 relative overflow-hidden group"
    >
      <div className={`absolute -right-2 -top-2 w-16 h-16 bg-${color} opacity-[0.03] rounded-full group-hover:scale-150 transition-transform duration-500`} />
      
      <div className="flex items-center justify-between">
        <div className={`p-2.5 rounded-xl bg-${color}/10`}>
          <Icon className={`w-5 h-5 text-${color}`} />
        </div>
        {trend && (
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${trend.includes('+') ? 'bg-green-500/10 text-green-400' : 'bg-white/10 text-gray-400'}`}>
            {trend}
          </span>
        )}
      </div>
      
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        <h4 className="text-2xl font-bold mt-1">{value}</h4>
        <p className="text-xs text-gray-400 mt-1 truncate">{subtitle}</p>
      </div>
    </motion.div>
  );
}

