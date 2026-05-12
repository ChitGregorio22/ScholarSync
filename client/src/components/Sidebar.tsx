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
import { useLanguage } from "../lib/LanguageContext";

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
  const { t } = useLanguage();
  
  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: t('dashboard') },
    { id: "grades", icon: BookOpen, label: t('grades_manager') },
    { id: "chat", icon: MessageSquare, label: t('ai_advisor') },
    { id: "profile", icon: User, label: t('profile') },
  ];

  return (
    <aside className="w-72 h-screen bg-bg-card border-r border-border-subtle flex flex-col p-6 overflow-y-auto custom-scrollbar transition-colors">
      
      {/* Brand */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="bg-brand-primary p-2 rounded-xl">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-tx-main">
          Scholar<span className="text-brand-primary">Sync</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        <p className="text-[10px] font-bold text-tx-muted uppercase tracking-widest px-4 mb-4">{t('main_menu')}</p>
        
        {menuItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? "bg-brand-primary/10 text-brand-primary" 
                  : "text-tx-dim hover:text-tx-main hover:bg-bg-hover"
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
      <div className="pt-6 border-t border-border-subtle space-y-2">
        <button
          onClick={() => setPage("settings")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-tx-dim hover:text-tx-main hover:bg-bg-hover transition-all group"
        >
          <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
          <span className="font-medium text-sm">{t('settings')}</span>
        </button>
        
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-400/5 transition-all group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium text-sm">{t('logout')}</span>
        </button>
      </div>

    </aside>
  );
}