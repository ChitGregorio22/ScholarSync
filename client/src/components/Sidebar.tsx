import { 
  LayoutDashboard, 
  GraduationCap, 
  User, 
  MessageSquare, 
  LogOut,
  Settings,
  BookOpen
} from "lucide-react";
import { motion } from "framer-motion";

/**
 * Sidebar Component
 * 
 * Premium navigation sidebar with animated items and Lucide icons.
 * 
 * @param {Object} props
 * @param {Function} props.setPage - Navigation function to switch views
 * @param {string} props.currentPage - The current active page ID
 */
export default function Sidebar({ setPage, currentPage, onLogout }: { setPage: (page: string) => void, currentPage: string, onLogout?: () => void }) {
  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "grades", icon: BookOpen, label: "Grades Manager" },
    { id: "chat", icon: MessageSquare, label: "AI Advisor" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <aside className="w-72 min-h-screen bg-bg-card border-r border-white/5 flex flex-col p-6 sticky top-0">
      
      {/* Brand */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="bg-brand-primary p-2 rounded-xl">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white">
          Scholar<span className="text-brand-primary">Sync</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4 mb-4">Main Menu</p>
        
        {menuItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? "bg-brand-primary/10 text-brand-primary" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeNav"
                  className="absolute left-0 w-1 h-6 bg-brand-primary rounded-r-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="pt-6 border-t border-white/5 space-y-2">
        <button
          onClick={() => setPage("settings")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group"
        >
          <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
          <span className="font-medium text-sm">Settings</span>
        </button>
        
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-400/5 transition-all group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>

    </aside>
  );
}