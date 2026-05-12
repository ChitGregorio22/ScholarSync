import { motion } from "framer-motion";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Eye, 
  Moon, 
  HelpCircle, 
  User,
  Smartphone,
  Globe
} from "lucide-react";

/**
 * Settings Page
 * 
 * A premium settings interface for user preferences and application configuration.
 */
export default function Settings() {
  const sections = [
    {
      title: "Account Preferences",
      icon: User,
      items: [
        { label: "Notification Settings", icon: Bell, description: "Manage how you receive alerts" },
        { label: "Privacy & Security", icon: Shield, description: "Control your data and account safety" },
        { label: "Appearance", icon: Moon, description: "Switch between dark and light modes" },
      ]
    },
    {
      title: "App Settings",
      icon: SettingsIcon,
      items: [
        { label: "Language", icon: Globe, description: "English (US)", value: "EN" },
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
      className="max-w-4xl mx-auto space-y-8 pb-12"
    >
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
                    <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full text-gray-400">{item.value}</span>
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
