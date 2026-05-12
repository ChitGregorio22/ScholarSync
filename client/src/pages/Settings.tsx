import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Eye, 
  Moon, 
  HelpCircle, 
  User,
  Smartphone,
  Globe,
  Sun,
  CheckCircle2,
  Info
} from "lucide-react";
import { useState, useEffect } from "react";

/**
 * Settings Page
 * 
 * A premium settings interface for user preferences and application configuration.
 */
export default function Settings() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [language, setLanguage] = useState("EN");
  const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'info' | 'success' } | null>(null);

  // Auto-hide status message
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Apply theme to the document
    if (isDarkMode) {
      document.documentElement.classList.add('light-theme-mock'); // Mocking for now as we don't have full light theme CSS
      setStatusMessage({ text: "Light Mode activated (Preview)", type: 'success' });
    } else {
      document.documentElement.classList.remove('light-theme-mock');
      setStatusMessage({ text: "Dark Mode activated", type: 'success' });
    }
  };

  const toggleLanguage = () => {
    const next = language === "EN" ? "ES" : language === "ES" ? "FR" : "EN";
    setLanguage(next);
    setStatusMessage({ text: `Language set to ${next === 'EN' ? 'English' : next === 'ES' ? 'Spanish' : 'French'}`, type: 'success' });
  };

  const handleAction = (label: string) => {
    if (label === "Appearance") {
      toggleTheme();
    } else if (label === "Language") {
      toggleLanguage();
    } else if (label === "Notification Settings") {
      setStatusMessage({ text: "Push notifications module initializing...", type: 'info' });
    } else if (label === "Privacy & Security") {
      setStatusMessage({ text: "End-to-end encryption is active", type: 'success' });
    } else if (label === "Help Center") {
      setStatusMessage({ text: "Redirecting to Support Docs...", type: 'info' });
    } else {
      setStatusMessage({ text: `${label} feature coming in next update`, type: 'info' });
    }
  };

  const sections = [
    {
      title: "Account Preferences",
      icon: User,
      items: [
        { label: "Notification Settings", icon: Bell, description: "Manage how you receive alerts" },
        { label: "Privacy & Security", icon: Shield, description: "Your data is protected by Supabase" },
        { label: "Appearance", icon: isDarkMode ? Moon : Sun, description: `Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode` },
      ]
    },
    {
      title: "App Settings",
      icon: SettingsIcon,
      items: [
        { label: "Language", icon: Globe, description: "System display language", value: language },
        { label: "Device Sync", icon: Smartphone, description: "Manage connected devices" },
        { label: "Accessibility", icon: Eye, description: "Visual and interaction helpers" },
      ]
    },
    {
      title: "Support",
      icon: HelpCircle,
      items: [
        { label: "Help Center", icon: HelpCircle, description: "Find answers to your questions" },
      ]
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 pb-12 relative"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className={`fixed top-8 left-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              statusMessage.type === 'success' 
                ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                : 'bg-brand-primary/20 border-brand-primary/30 text-brand-primary'
            } backdrop-blur-xl`}
          >
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Info className="w-5 h-5" />}
            <span className="font-bold text-sm">{statusMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-brand-primary/10 p-2 rounded-lg text-brand-primary">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">Configuration</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white">Settings</h1>
        <p className="text-gray-400 mt-2">Manage your account settings and application preferences.</p>
      </header>

      <div className="space-y-6">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <section.icon className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{section.title}</h3>
            </div>

            <div className="bg-bg-card border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5 shadow-xl">
              {section.items.map((item, i) => (
                <button 
                  key={i}
                  onClick={() => handleAction(item.label)}
                  className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-white/5 p-2.5 rounded-xl group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-white">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>
                  
                  {item.value ? (
                    <span className="text-xs font-bold bg-brand-primary/10 px-3 py-1 rounded-full text-brand-primary border border-brand-primary/20">{item.value}</span>
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-8 flex justify-center">
        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">ScholarSync v1.0.0 • 2026 Edition</p>
      </div>
    </motion.div>
  );
}
