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
  MessageSquare,
  Clock,
  BookOpen,
  Activity
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Cell
} from "recharts";

type Subject = any; 

export default function Dashboard({ subjects = [], studyLogs = [], assessments = [], user }: { subjects: Subject[], studyLogs: any[], assessments: any[], user: any }) {
  
  // Helper to convert grades/targets to numbers for chart
  const getNumericGrade = (val: any) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    const str = String(val).toUpperCase();
    if (str.includes('A')) return 95;
    if (str.includes('B')) return 85;
    if (str.includes('C')) return 75;
    if (str.includes('D')) return 65;
    if (str.includes('F')) return 50;
    const num = parseInt(str.replace(/[^0-9]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  const highest =
    subjects.length > 0
      ? subjects.reduce((max, s) => (getNumericGrade(s.grade) > getNumericGrade(max.grade) ? s : max))
      : null;

  const weakest =
    subjects.length > 0
      ? subjects.reduce((min, s) => (getNumericGrade(s.grade || s.target_grade) < getNumericGrade(min.grade || min.target_grade) ? s : min))
      : null;

  const avgGrade = 
    subjects.length > 0
      ? Math.round(
          subjects.reduce((sum, s) => sum + getNumericGrade(s.grade || s.target_grade), 0) / subjects.length
        )
      : 0;

  const totalStudyHours = studyLogs.reduce((sum, log) => sum + (log.hours_studied || 0), 0);
  const displayHours = Math.floor(totalStudyHours);
  const displayMins = Math.round((totalStudyHours - displayHours) * 60);

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
      className="max-w-7xl mx-auto space-y-8 pb-10"
    >
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-tx-main">Academic Overview</h1>
          <p className="text-tx-dim mt-1">Hello, {user?.user_metadata?.full_name || "Student"}. Here's your progress.</p>
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
          title="Study Time" 
          value={displayHours > 0 ? `${displayHours}h ${displayMins}m` : `${displayMins}m`} 
          subtitle="Total this semester"
          icon={Clock}
          color="accent"
          trend="Increasing"
        />
        <StatCard 
          title="Best Subject" 
          value={highest?.grade ? `${highest.grade}%` : "-"} 
          subtitle={highest?.course_name || "N/A"}
          icon={TrendingUp}
          color="emerald-400"
        />
        <StatCard 
          title="Needs Focus" 
          value={weakest?.grade ? `${weakest.grade}%` : "-"} 
          subtitle={weakest?.course_name || "N/A"}
          icon={TrendingDown}
          color="rose-400"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-6 min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold">Performance Analytics</h3>
              <p className="text-sm text-tx-dim">Grade distribution across subjects</p>
            </div>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('switchPage', { detail: 'grades' }))}
              className="text-brand-primary text-sm font-semibold flex items-center gap-1 hover:underline"
            >
              Manage Grades <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 w-full min-h-[300px]">
            {subjects.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjects.map(s => {
                  const data = {
                    ...s,
                    displayGrade: getNumericGrade(s.grade || s.target_grade)
                  };
                  console.log("Chart Data Point:", data);
                  return data;
                })}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="course_name" 
                    stroke="#ffffff40" 
                    fontSize={10} 
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
                    cursor={{ fill: '#ffffff05' }}
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-card)', 
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      color: 'var(--text-primary)'
                    }}
                    itemStyle={{ color: '#6366f1' }}
                  />
                  <Bar 
                    dataKey="displayGrade" 
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                  >
                    {subjects.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#a855f7'} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
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
                  <p className="text-xs font-bold text-brand-primary uppercase tracking-wider">Academic Insight</p>
                  <p className="text-sm leading-relaxed">
                    {weakest && getNumericGrade(weakest.grade || weakest.target_grade) < 75 
                      ? `Your performance in ${weakest.course_name} is below target. Consider increasing study time for this subject by 30%.` 
                      : `You're performing exceptionally well in ${highest?.course_name}. Keep maintaining this momentum!`}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                  <p className="text-xs font-bold text-accent uppercase tracking-wider">Productivity Tip</p>
                  <p className="text-sm leading-relaxed text-gray-300">
                    {studyLogs.length > 0 
                      ? `You've logged ${studyLogs.length} sessions recently. Try the Pomodoro technique to maintain focus.`
                      : "Start logging your study sessions to track your focus and productivity levels."}
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
            Consult Advisor
          </button>
        </motion.div>
      </div>

      {/* Recent Activity & Assessments */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Study Logs */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-accent/20 p-2 rounded-lg">
              <Activity className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-lg font-bold">Recent Study Logs</h3>
          </div>

          <div className="space-y-4">
            {studyLogs.slice(0, 5).map((log, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition border border-transparent hover:border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold">
                    {log.date ? new Date(log.date).getDate() : "-"}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{log.topic || "Study Session"}</p>
                    <p className="text-xs text-gray-500">{new Date(log.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-accent">{log.hours_studied}h</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-tighter">Focused</p>
                </div>
              </div>
            ))}
            {studyLogs.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No study sessions logged yet.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Upcoming Assessments */}
        <motion.div variants={itemVariants} className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-400/20 p-2 rounded-lg">
              <Target className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold">Upcoming Assessments</h3>
          </div>

          <div className="space-y-4">
            {(assessments || []).filter(a => new Date(a.date) >= new Date()).slice(0, 5).map((assessment, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition border border-transparent hover:border-white/5">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-10 rounded-full ${assessment.type === 'Exam' ? 'bg-rose-400' : 'bg-brand-primary'}`} />
                  <div>
                    <p className="text-sm font-bold">{assessment.title}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                      {subjects.find(s => s.id === assessment.course_id)?.course_name || 'Course'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{new Date(assessment.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                  <p className={`text-[10px] font-bold uppercase ${new Date(assessment.date).getTime() - new Date().getTime() < 86400000 * 2 ? 'text-rose-400' : 'text-gray-500'}`}>
                    {Math.ceil((new Date(assessment.date).getTime() - new Date().getTime()) / (86400000))} Days Left
                  </p>
                </div>
              </div>
            ))}
            {(assessments || []).filter(a => new Date(a.date) >= new Date()).length === 0 && (
              <div className="text-center py-10 text-gray-500">
                <Award className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No upcoming assessments. Good job!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="glass-card p-8 flex flex-col items-center justify-center text-center space-y-4 bg-gradient-to-br from-brand-primary/10 to-accent/10 mt-8">
        <div className="w-16 h-16 rounded-full bg-brand-primary/20 flex items-center justify-center">
          <Target className="w-8 h-8 text-brand-primary" />
        </div>
        <h3 className="text-xl font-bold">Ready to Study?</h3>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Keep your momentum going! Log your daily progress to stay on track for your target grades.
        </p>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('switchPage', { detail: 'grades' }))}
          className="px-8 py-3 bg-white text-[#0f1115] font-bold rounded-xl hover:bg-gray-200 transition active:scale-[0.95]"
        >
          Open Grades Manager
        </button>
      </motion.div>
    </motion.div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color, trend }: any) {
  // Safe color mapping for Tailwind
  const colorClasses: any = {
    'brand-primary': 'bg-brand-primary/10 text-brand-primary',
    'accent': 'bg-accent/10 text-accent',
    'emerald-400': 'bg-emerald-400/10 text-emerald-400',
    'rose-400': 'bg-rose-400/10 text-rose-400'
  };

  const bgClass = colorClasses[color] || 'bg-white/10 text-white';

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="glass-card p-5 space-y-3 relative overflow-hidden group"
    >
      <div className="flex items-center justify-between">
        <div className={`p-2.5 rounded-xl ${bgClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${trend.includes('+') || trend === 'Increasing' ? 'bg-green-500/10 text-green-400' : 'bg-white/10 text-gray-400'}`}>
            {trend}
          </span>
        )}
      </div>
      
      <div>
        <p className="text-xs font-medium text-tx-muted uppercase tracking-wider">{title}</p>
        <h4 className="text-2xl font-bold mt-1 tracking-tight">{value}</h4>
        <p className="text-xs text-tx-dim mt-1 truncate">{subtitle}</p>
      </div>
    </motion.div>
  );
}