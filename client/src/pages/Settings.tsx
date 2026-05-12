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
  Info,
  X,
  FileText,
  LifeBuoy
} from "lucide-react";
import { useState, useEffect } from "react";

/**
 * Settings Page
 * 
 * A premium settings interface for user preferences and application configuration.
 */
export default function Settings() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [language, setLanguage] = useState("EN");
  const [showHelp, setShowHelp] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'info' | 'success' } | null>(null);

  // Initialize theme from document class
  useEffect(() => {
    const isLight = document.documentElement.classList.contains('light');
    const isHC = document.documentElement.classList.contains('high-contrast');
    setTheme(isLight ? 'light' : 'dark');
    setIsHighContrast(isHC);
  }, []);

  // Auto-hide status message
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    setStatusMessage({ text: `${newTheme === 'light' ? 'Light' : 'Dark'} Mode activated`, type: 'success' });
  };

  const toggleAccessibility = () => {
    const next = !isHighContrast;
    setIsHighContrast(next);
    if (next) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    setStatusMessage({ text: `High Contrast ${next ? 'Enabled' : 'Disabled'}`, type: 'success' });
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
    } else if (label === "Accessibility") {
      toggleAccessibility();
    } else if (label === "Help Center") {
      setShowHelp(true);
    } else if (label === "Notification Settings") {
      setStatusMessage({ text: "Notifications initialized", type: 'success' });
    } else if (label === "Privacy & Security") {
      setStatusMessage({ text: "Security vault active", type: 'success' });
    } else {
      setStatusMessage({ text: `${label} updated`, type: 'info' });
    }
  };

  const sections = [
    {
      title: "Account Preferences",
      icon: User,
      items: [
        { label: "Notification Settings", icon: Bell, description: "Manage how you receive alerts" },
        { label: "Privacy & Security", icon: Shield, description: "Your data is protected by Supabase" },
        { label: "Appearance", icon: theme === 'dark' ? Moon : Sun, description: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode` },
      ]
    },
    {
      title: "App Settings",
      icon: SettingsIcon,
      items: [
        { label: "Language", icon: Globe, description: "System display language", value: language },
        { label: "Device Sync", icon: Smartphone, description: "Manage connected devices" },
        { label: "Accessibility", icon: Eye, description: "High contrast & visibility aids", value: isHighContrast ? "ON" : "OFF" },
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
            className={`fixed top-8 left-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
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

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHelp(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card w-full max-w-lg p-8 relative z-10 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-primary/20 p-2 rounded-lg">
                    <LifeBuoy className="w-6 h-6 text-brand-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Help Center</h2>
                </div>
                <button onClick={() => setShowHelp(false)} className="p-2 hover:bg-white/10 rounded-full transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-bg-hover border border-border-subtle hover:border-brand-primary/30 transition-all group cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-brand-primary" />
                    <h4 className="font-bold">Getting Started Guide</h4>
                  </div>
                  <p className="text-sm text-gray-400">Learn the basics of tracking your academic progress with ScholarSync.</p>
                </div>
                
                <div className="p-4 rounded-2xl bg-bg-hover border border-border-subtle hover:border-brand-primary/30 transition-all group cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <SettingsIcon className="w-5 h-5 text-brand-primary" />
                    <h4 className="font-bold">Account Recovery</h4>
                  </div>
                  <p className="text-sm text-gray-400">Issues with logging in? Reset your password or manage sessions.</p>
                </div>

                <div className="p-4 rounded-2xl bg-brand-primary/10 border border-brand-primary/20">
                  <h4 className="font-bold mb-2">Need direct support?</h4>
                  <p className="text-sm text-gray-400 mb-4">Our team is available for technical assistance 24/7.</p>
                  <button className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-brand-primary/20">
                    Contact Support
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-brand-primary/10 p-2 rounded-lg text-brand-primary">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">Configuration</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-tx-dim mt-2">Manage your account settings and application preferences.</p>
      </header>

      <div className="space-y-6">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <section.icon className="w-4 h-4 text-tx-muted" />
              <h3 className="text-sm font-bold text-tx-muted uppercase tracking-wider">{section.title}</h3>
            </div>

            <div className="bg-bg-card border border-border-subtle rounded-2xl overflow-hidden divide-y divide-border-subtle shadow-xl">
              {section.items.map((item, i) => (
                <button 
                  key={i}
                  onClick={() => handleAction(item.label)}
                  className="w-full flex items-center justify-between p-5 hover:bg-bg-hover transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-bg-hover p-2.5 rounded-xl group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold">{item.label}</p>
                      <p className="text-sm text-tx-dim">{item.description}</p>
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
