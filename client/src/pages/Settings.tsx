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
  LifeBuoy,
  Type,
  Zap,
  Mail,
  MessageSquare,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  ChevronDown,
  Book,
  Send,
  Ticket,
  Trash2,
  Lock,
  Key,
  Save
} from "lucide-react";
import { useState, useEffect } from "react";
import { createTicket, clearChatHistory, updatePassword } from "../lib/supabase-simple";
import { useLanguage } from "../lib/LanguageContext";
import type { Language as LangType } from "../lib/translations";

/**
 * Settings Page
 * 
 * A premium settings interface for user preferences and application configuration.
 */
export default function Settings() {
  const { language, setLanguage, t } = useLanguage();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isDyslexicFont, setIsDyslexicFont] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [activeGuide, setActiveGuide] = useState<number | null>(null);
  const [ticketStatus, setTicketStatus] = useState<{ id: string, status: string } | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'info' | 'success' } | null>(null);

  // Support Form State
  const [supportForm, setSupportForm] = useState({
    subject: "Technical Issue",
    message: ""
  });
  const [isSendingTicket, setIsSendingTicket] = useState(false);

  // Notification Preferences State
  const [notifPrefs, setNotifPrefs] = useState(() => {
    const saved = localStorage.getItem('ss_notif_prefs');
    return saved ? JSON.parse(saved) : {
      email: true,
      push: true,
      aiAdvisor: true,
      reminders: false
    };
  });

  // Initialize from document classes
  useEffect(() => {
    localStorage.setItem('ss_notif_prefs', JSON.stringify(notifPrefs));
  }, [notifPrefs]);

  // Initialize from document classes
  useEffect(() => {
    setTheme(document.documentElement.classList.contains('light') ? 'light' : 'dark');
    setIsHighContrast(document.documentElement.classList.contains('high-contrast'));
    setIsDyslexicFont(document.documentElement.classList.contains('dyslexic-font'));
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
    document.documentElement.classList.toggle('light', newTheme === 'light');
    setStatusMessage({ text: `${newTheme === 'light' ? 'Light' : 'Dark'} Mode activated`, type: 'success' });
  };

  const toggleHighContrast = () => {
    const next = !isHighContrast;
    setIsHighContrast(next);
    document.documentElement.classList.toggle('high-contrast', next);
    setStatusMessage({ text: `High Contrast ${next ? 'Enabled' : 'Disabled'}`, type: 'success' });
  };

  const toggleDyslexicFont = () => {
    const next = !isDyslexicFont;
    setIsDyslexicFont(next);
    document.documentElement.classList.toggle('dyslexic-font', next);
    setStatusMessage({ text: `Dyslexic Font ${next ? 'Enabled' : 'Disabled'}`, type: 'success' });
  };

  const toggleLanguage = () => {
    const next: LangType = language === "EN" ? "ES" : language === "ES" ? "FR" : "EN";
    setLanguage(next);
    setStatusMessage({ text: `Language set to ${next === 'EN' ? 'English' : next === 'ES' ? 'Spanish' : 'French'}`, type: 'success' });
  };

  const handleAction = (id: string) => {
    if (id === "appearance") {
      toggleTheme();
    } else if (id === "language") {
      toggleLanguage();
    } else if (id === "accessibility") {
      setShowAccessibility(true);
    } else if (id === "help") {
      setShowHelp(true);
    } else if (id === "notifications") {
      setShowNotifications(true);
    } else if (id === "privacy") {
      setShowPrivacy(true);
    } else {
      setStatusMessage({ text: `Setting updated`, type: 'info' });
    }
  };

  const toggleNotif = (key: keyof typeof notifPrefs) => {
    setNotifPrefs(prev => ({ ...prev, [key]: !prev[key] }));
    setStatusMessage({ text: "Preference updated", type: 'success' });
  };

  const handleClearHistory = async () => {
    try {
      await clearChatHistory();
      setStatusMessage({ text: "Chat history cleared", type: 'success' });
    } catch (err) {
      console.error("Failed to clear history:", err);
      setStatusMessage({ text: "Error clearing history", type: 'info' });
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setStatusMessage({ text: "Password must be at least 6 characters", type: 'info' });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await updatePassword(newPassword);
      setStatusMessage({ text: "Password updated successfully", type: 'success' });
      setShowPasswordModal(false);
      setNewPassword("");
    } catch (err: any) {
      console.error("Failed to update password:", err);
      setStatusMessage({ text: err.message || "Error updating password", type: 'info' });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleContactSupport = async () => {
    if (!supportForm.message.trim()) {
      setStatusMessage({ text: "Please enter a message", type: 'info' });
      return;
    }

    setIsSendingTicket(true);
    try {
      const newId = Math.floor(1000 + Math.random() * 9000).toString();
      await createTicket(newId, supportForm.subject, supportForm.message);
      setTicketStatus({ id: newId, status: "Pending" });
      setStatusMessage({ text: `Support ticket #${newId} created!`, type: 'success' });
      setSupportForm({ subject: "Technical Issue", message: "" }); // Reset form
    } catch (err) {
      console.error("Failed to create ticket:", err);
      setStatusMessage({ text: "Error creating ticket. Please try again.", type: 'info' });
    } finally {
      setIsSendingTicket(false);
    }
  };

  const guides = [
    {
      title: "Getting Started with ScholarSync",
      icon: Book,
      content: "ScholarSync helps you track your academic performance using AI. Start by adding your current courses in the Grades Manager, then log your study sessions to see your productivity analytics grow."
    },
    {
      title: "How to use the AI Advisor",
      icon: MessageSquare,
      content: "The AI Advisor analyzes your grades and study logs to give personalized advice. Click 'Consult Advisor' on your dashboard to ask specific questions like 'How can I improve my GPA?' or 'What subjects need more focus?'"
    },
    {
      title: "Managing Attendance",
      icon: CalendarIcon,
      content: "In your Profile tab, you'll find the Attendance Calendar. Simply click on a date to toggle between 'Present' (Green) and 'Absent' (Red). This helps you track your consistency over the semester."
    },
    {
      title: "Account & Data Security",
      icon: Shield,
      content: "Your data is securely stored using Supabase. We only track the academic information you provide. You can manage your personal details anytime in the Profile section."
    }
  ];

  const sections = [
    {
      title: t('account_preferences'),
      icon: User,
      items: [
        { id: "notifications", label: t('notification_settings'), icon: Bell, description: t('notification_description') },
        { id: "privacy", label: t('privacy_security'), icon: Shield, description: t('privacy_description') },
        { id: "appearance", label: t('appearance'), icon: theme === 'dark' ? Moon : Sun, description: t('appearance_description') },
      ]
    },
    {
      title: t('app_settings'),
      icon: SettingsIcon,
      items: [
        { id: "language", label: t('language'), icon: Globe, description: t('language_description'), value: language },
        { id: "sync", label: t('device_sync'), icon: Smartphone, description: t('device_sync_description') },
        { id: "accessibility", label: t('accessibility'), icon: Eye, description: t('accessibility_description'), value: isHighContrast || isDyslexicFont ? "ACTIVE" : "OFF" },
      ]
    },
    {
      title: t('support'),
      icon: HelpCircle,
      items: [
        { id: "help", label: t('help_center'), icon: HelpCircle, description: "Find answers to your questions" },
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
            className={`fixed top-8 left-1/2 z-[300] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
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

      {/* Notifications Modal */}
      <AnimatePresence>
        {showNotifications && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifications(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card w-full max-w-md p-8 relative z-10 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-primary/20 p-2 rounded-lg">
                    <Bell className="w-6 h-6 text-brand-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-tx-main">Notifications</h2>
                </div>
                <button onClick={() => setShowNotifications(false)} className="p-2 hover:bg-bg-hover rounded-full transition">
                  <X className="w-5 h-5 text-tx-dim" />
                </button>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'email', label: 'Email Alerts', icon: Mail, desc: 'Weekly progress reports & reminders', comingSoon: true },
                  { id: 'push', label: 'Push Notifications', icon: Zap, desc: 'Real-time course updates' },
                  { id: 'aiAdvisor', label: 'AI Study Advice', icon: MessageSquare, desc: 'Smart tips from your Advisor' },
                  { id: 'reminders', label: 'Inactivity Reminders', icon: ClockIcon, desc: 'Nudges when you fall behind' }
                ].map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => !item.comingSoon && toggleNotif(item.id as any)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      (notifPrefs as any)[item.id] ? 'bg-brand-primary/10 border-brand-primary' : 'bg-bg-hover border-border-subtle'
                    } ${item.comingSoon ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className="p-2 bg-white/5 rounded-lg">
                        <item.icon className={`w-5 h-5 ${(notifPrefs as any)[item.id] ? 'text-brand-primary' : 'text-tx-dim'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-tx-main">{item.label}</p>
                          {item.comingSoon && (
                            <span className="text-[8px] font-bold bg-brand-primary/20 text-brand-primary px-1.5 py-0.5 rounded uppercase">Next Version</span>
                          )}
                        </div>
                        <p className="text-xs text-tx-dim">{item.desc}</p>
                      </div>
                    </div>
                    {!item.comingSoon && (
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${(notifPrefs as any)[item.id] ? 'bg-brand-primary' : 'bg-gray-700'}`}>
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${(notifPrefs as any)[item.id] ? 'right-1' : 'left-1'}`} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Privacy Modal */}
      <AnimatePresence>
        {showPrivacy && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPrivacy(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card w-full max-w-md p-8 relative z-10 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-primary/20 p-2 rounded-lg">
                    <Shield className="w-6 h-6 text-brand-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-tx-main">Privacy & Security</h2>
                </div>
                <button onClick={() => setShowPrivacy(false)} className="p-2 hover:bg-bg-hover rounded-full transition">
                  <X className="w-5 h-5 text-tx-dim" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-brand-primary" />
                    <p className="font-bold text-sm">Data Control</p>
                  </div>
                  <p className="text-xs text-tx-dim leading-relaxed">
                    You have full control over your academic data. Clearing your chat history will permanently remove all past conversations with the AI Advisor from our servers.
                  </p>
                  <button 
                    onClick={handleClearHistory}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-all border border-rose-500/20 font-bold text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear Chat History
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <p className="font-bold text-sm">Account Security</p>
                  </div>
                  <p className="text-xs text-tx-dim leading-relaxed">
                    Your session is protected with end-to-end encryption. To fully secure your account, ensure you log out after using ScholarSync on shared devices.
                  </p>
                  <button 
                    onClick={() => {
                      setShowPrivacy(false);
                      setShowPasswordModal(true);
                    }}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 text-tx-main rounded-xl transition-all border border-white/10 font-bold text-sm"
                  >
                    Manage Account
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPasswordModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card w-full max-w-md p-8 relative z-10 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-primary/20 p-2 rounded-lg">
                    <Key className="w-6 h-6 text-brand-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-tx-main">Account Security</h2>
                </div>
                <button onClick={() => setShowPasswordModal(false)} className="p-2 hover:bg-bg-hover rounded-full transition">
                  <X className="w-5 h-5 text-tx-dim" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-tx-dim ml-1">New Password</label>
                  <input 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl text-sm text-tx-main focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 outline-none transition-all placeholder:text-tx-muted"
                  />
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-tx-dim leading-relaxed">
                    <span className="text-brand-primary font-bold">Security Note:</span> Choosing a strong, unique password helps protect your academic data and personal information.
                  </p>
                </div>

                <button 
                  onClick={handleUpdatePassword}
                  disabled={isUpdatingPassword}
                  className="w-full bg-brand-primary hover:brightness-110 text-white py-4 rounded-2xl font-bold shadow-[0_20px_40px_-12px_rgba(0,184,212,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isUpdatingPassword ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Accessibility Modal */}
      <AnimatePresence>
        {showAccessibility && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAccessibility(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card w-full max-w-md p-8 relative z-10 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-primary/20 p-2 rounded-lg">
                    <Eye className="w-6 h-6 text-brand-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-tx-main">Accessibility</h2>
                </div>
                <button onClick={() => setShowAccessibility(false)} className="p-2 hover:bg-bg-hover rounded-full transition">
                  <X className="w-5 h-5 text-tx-dim" />
                </button>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={toggleHighContrast}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    isHighContrast ? 'bg-brand-primary/10 border-brand-primary' : 'bg-bg-hover border-border-subtle'
                  }`}
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="p-2 bg-white/5 rounded-lg">
                      <Zap className={`w-5 h-5 ${isHighContrast ? 'text-brand-primary' : 'text-tx-dim'}`} />
                    </div>
                    <div>
                      <p className="font-bold text-tx-main">High Contrast Mode</p>
                      <p className="text-xs text-tx-dim">Maximized visibility for all UI elements</p>
                    </div>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${isHighContrast ? 'bg-brand-primary' : 'bg-gray-700'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isHighContrast ? 'right-1' : 'left-1'}`} />
                  </div>
                </button>

                <button 
                  onClick={toggleDyslexicFont}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    isDyslexicFont ? 'bg-brand-primary/10 border-brand-primary' : 'bg-bg-hover border-border-subtle'
                  }`}
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="p-2 bg-white/5 rounded-lg">
                      <Type className={`w-5 h-5 ${isDyslexicFont ? 'text-brand-primary' : 'text-tx-dim'}`} />
                    </div>
                    <div>
                      <p className="font-bold text-tx-main">Dyslexic-Friendly Font</p>
                      <p className="text-xs text-tx-dim">Specialized typography for easier reading</p>
                    </div>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${isDyslexicFont ? 'bg-brand-primary' : 'bg-gray-700'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isDyslexicFont ? 'right-1' : 'left-1'}`} />
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHelp(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="bg-bg-dark/95 border border-white/10 w-full max-w-2xl p-0 relative z-10 overflow-hidden flex flex-col max-h-[85vh] rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]"
            >
              {/* Header */}
              <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="bg-brand-primary p-3 rounded-2xl shadow-lg shadow-brand-primary/20">
                    <LifeBuoy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-tx-main">Help Center</h2>
                    <p className="text-xs text-tx-dim">Support guides and direct assistance</p>
                  </div>
                </div>
                <button onClick={() => setShowHelp(false)} className="p-3 hover:bg-white/5 rounded-2xl transition-colors active:scale-95">
                  <X className="w-6 h-6 text-tx-dim" />
                </button>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Guides Section */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 bg-brand-primary rounded-full" />
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-tx-dim">Quick Guides</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {guides.map((guide, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setActiveGuide(activeGuide === idx ? null : idx)}
                        className={`group p-5 rounded-2xl border text-left transition-all ${
                          activeGuide === idx 
                            ? 'bg-brand-primary/10 border-brand-primary shadow-lg shadow-brand-primary/5' 
                            : 'bg-white/[0.03] border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className={`p-2 rounded-xl transition-colors ${activeGuide === idx ? 'bg-brand-primary text-white' : 'bg-white/5 text-tx-dim group-hover:text-tx-main'}`}>
                            <guide.icon className="w-4 h-4" />
                          </div>
                          <ChevronDown className={`w-4 h-4 transition-transform ${activeGuide === idx ? 'rotate-180 text-brand-primary' : 'text-tx-muted'}`} />
                        </div>
                        <h4 className="font-bold text-sm text-tx-main">{guide.title}</h4>
                        <AnimatePresence>
                          {activeGuide === idx && (
                            <motion.p
                              initial={{ height: 0, opacity: 0, marginTop: 0 }}
                              animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                              exit={{ height: 0, opacity: 0, marginTop: 0 }}
                              className="text-[11px] text-tx-dim leading-relaxed"
                            >
                              {guide.content}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Support Form Section */}
                <section className="space-y-4 pt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 bg-green-500 rounded-full" />
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-tx-dim">Direct Support</h3>
                  </div>

                  {ticketStatus ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-8 rounded-[24px] bg-green-500/[0.07] border border-green-500/20 relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <Ticket className="w-24 h-24 text-green-400" />
                      </div>
                      <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                          <div className="bg-green-500/20 p-2 rounded-xl w-fit">
                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-tx-main">Ticket Received</h4>
                            <span className="text-[10px] font-bold bg-green-500/20 text-green-400 px-2 py-0.5 rounded uppercase tracking-wider">Status: In Queue</span>
                          </div>
                        </div>
                        <p className="text-sm text-tx-dim leading-relaxed">
                          Your ticket <span className="text-green-400 font-bold">#{ticketStatus.id}</span> has been logged. Our student support team typically responds within <span className="text-tx-main font-bold">24 hours</span>.
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="bg-white/[0.03] border border-white/5 rounded-[24px] p-8 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-tx-dim ml-1">Inquiry Type</label>
                          <div className="relative group">
                            <select 
                              value={supportForm.subject}
                              onChange={(e) => setSupportForm(prev => ({ ...prev, subject: e.target.value }))}
                              className="w-full bg-bg-dark/50 border border-white/10 px-4 py-3.5 rounded-2xl text-sm text-tx-main focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 outline-none transition-all appearance-none cursor-pointer"
                            >
                              <option value="Technical Issue">Technical Issue</option>
                              <option value="Account Access">Account Access</option>
                              <option value="Feature Request">Feature Request</option>
                              <option value="Bug Report">Bug Report</option>
                              <option value="General Question">General Question</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-tx-dim pointer-events-none group-hover:text-brand-primary transition-colors" />
                          </div>
                        </div>
                        <div className="flex items-end">
                          <p className="text-[10px] text-tx-muted leading-relaxed mb-1 ml-1 italic">
                            Select the category that best fits your issue to help us route your ticket faster.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-tx-dim ml-1">Your Message</label>
                        <textarea 
                          value={supportForm.message}
                          onChange={(e) => setSupportForm(prev => ({ ...prev, message: e.target.value }))}
                          placeholder="How can we help you today?"
                          rows={4}
                          className="w-full bg-bg-dark/50 border border-white/10 px-5 py-4 rounded-2xl text-sm text-tx-main focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30 outline-none transition-all placeholder:text-tx-muted resize-none leading-relaxed"
                        />
                      </div>

                      <button 
                        onClick={handleContactSupport}
                        disabled={isSendingTicket}
                        className="w-full bg-brand-primary hover:brightness-110 text-white py-4 rounded-2xl font-bold shadow-[0_20px_40px_-12px_rgba(0,184,212,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 overflow-hidden relative group"
                      >
                        {isSendingTicket ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <Send className="w-4 h-4" />
                            Submit Support Ticket
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </section>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/5 bg-white/[0.02] flex justify-center shrink-0">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-tx-muted">ScholarSync Support System • v1.2</p>
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
          <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">{t('configuration')}</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">{t('settings')}</h1>
        <p className="text-tx-dim mt-2">{t('progress_summary')}</p>
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
                  onClick={() => handleAction(item.id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-bg-hover transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-bg-hover p-2.5 rounded-xl group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-tx-main">{item.label}</p>
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
        <p className="text-[10px] text-tx-muted font-bold uppercase tracking-[0.2em]">ScholarSync v1.0.0 • 2026 Edition</p>
      </div>
    </motion.div>
  );
}
