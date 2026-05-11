import { useState, useRef, useEffect } from "react";
import { getStudentDataForAI, saveChatMessage, getChatHistory } from "../lib/supabase-simple";
import { getAIAdvice } from "../lib/gemini";
import type { ChatMessage } from "../types/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  ChevronLeft,
  History,
  Maximize2,
  Minimize2,
  Lightbulb,
  Target,
  Clock,
  TrendingUp
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

/**
 * Chatbot Component
 * 
 * Premium AI Advisor chat interface with animations and context-aware insights.
 * Integrates with Google Gemini API for personalized academic advice.
 * 
 * @param {Object} props
 * @param {Function} props.onBack - Optional callback to go back
 */
export default function Chatbot({ onBack }: { onBack?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! I'm ScholarSync, your AI academic advisor. I've analyzed your courses and grades to provide personalized guidance. How can I help you excel today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const history = await getChatHistory();
      if (history.length > 0) {
        const formattedMessages: Message[] = history.map((msg: ChatMessage) => ({
          id: msg.id,
          sender: msg.role === "user" ? "user" : "ai",
          text: msg.content,
          timestamp: new Date(msg.created_at || Date.now()),
        }));
        setMessages(formattedMessages);
      }
    } catch (err) {
      console.error("Error loading chat history:", err);
    }
  };

  const quickSuggestions = [
    { text: "Improve my grades", icon: TrendingUp },
    { text: "Study plan for me", icon: Clock },
    { text: "Focus areas", icon: Target },
    { text: "Study techniques", icon: Lightbulb },
  ];

  const sendMessage = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      await saveChatMessage({
        role: "user",
        content: messageText,
      });

      const studentData = await getStudentDataForAI();

      const aiResponse = await getAIAdvice(
        studentData,
        messageText,
        messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
        selectedModel
      );

      await saveChatMessage({
        role: "assistant",
        content: aiResponse,
        context: studentData,
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: aiResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error("Error getting AI response:", err);

      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "I encountered an error. Please verify your API configuration and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col bg-bg-dark text-white rounded-3xl overflow-hidden transition-all duration-500 shadow-2xl border border-white/5 ${isFullscreen ? 'fixed inset-4 z-[100]' : 'h-[calc(100vh-2rem)]'}`}>

      {/* HEADER */}
      <header className="p-5 flex justify-between items-center bg-bg-card border-b border-white/5 backdrop-blur-md bg-opacity-80">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-xl transition">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-4">
            <div className="bg-brand-primary/10 p-2.5 rounded-2xl">
              <Bot className="w-6 h-6 text-brand-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">AI Academic Advisor</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="bg-transparent text-[10px] text-gray-400 border-none focus:ring-0 p-0 cursor-pointer hover:text-white transition-colors uppercase tracking-widest font-bold"
                >
                  <option value="gemini-2.5-flash" className="bg-bg-card">Gemini 2.5 Flash</option>
                  <option value="gemini-2.5-pro" className="bg-bg-card">Gemini 2.5 Pro</option>
                  <option value="gemma-4-31b-it" className="bg-bg-card">Gemma 4 (31B)</option>
                  <option value="gemini-flash-latest" className="bg-bg-card">Latest Flash</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2.5 hover:bg-white/5 rounded-xl transition text-gray-400 hover:text-white"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          <button
            className="p-2.5 hover:bg-white/5 rounded-xl transition text-gray-400 hover:text-white"
            title="View History"
          >
            <History className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* CHAT AREA */}
      <div className="flex-1 p-6 overflow-y-auto space-y-8 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} items-end gap-3`}
            >
              {msg.sender === "ai" && (
                <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20 mb-1">
                  <Bot className="w-4 h-4 text-brand-primary" />
                </div>
              )}

              <div className={`relative group max-w-[80%] md:max-w-[70%] ${msg.sender === "user" ? "order-1" : "order-2"}`}>
                <div className={`px-5 py-4 rounded-3xl shadow-sm text-sm leading-relaxed ${msg.sender === "user"
                  ? "bg-brand-primary text-white rounded-br-none"
                  : "bg-white/5 border border-white/5 text-gray-200 rounded-bl-none"
                  }`}>
                  {msg.text}
                </div>
                <span className={`text-[10px] text-gray-600 font-medium mt-1.5 block px-1 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {msg.sender === "user" && (
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 mb-1 order-2">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
              <Bot className="w-4 h-4 text-brand-primary" />
            </div>
            <div className="bg-white/5 border border-white/5 px-4 py-3 rounded-2xl rounded-bl-none flex gap-1.5 items-center">
              <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" />
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* QUICK SUGGESTIONS */}
      <AnimatePresence>
        {messages.length < 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 pb-4"
          >
            <div className="flex flex-wrap gap-2 justify-center">
              {quickSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(suggestion.text)}
                  disabled={loading}
                  className="flex items-center gap-2 text-xs bg-white/5 hover:bg-brand-primary hover:text-white border border-white/5 px-4 py-2.5 rounded-full transition-all active:scale-95 disabled:opacity-50"
                >
                  <suggestion.icon className="w-3.5 h-3.5" />
                  {suggestion.text}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INPUT AREA */}
      <footer className="p-6 bg-bg-card border-t border-white/5">
        <div className="relative group">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
            placeholder="Ask anything about your academic progress..."
            disabled={loading}
            className="w-full bg-bg-dark border border-white/5 pl-6 pr-16 py-4 rounded-2xl focus:outline-none focus:border-brand-primary transition-all placeholder:text-gray-600 disabled:opacity-50 shadow-inner"
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed group-hover:shadow-[0_0_15px_rgba(99,102,241,0.4)]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-[10px] text-gray-600 text-center mt-4 uppercase tracking-widest font-bold">
          AI can make mistakes. Verify important academic details.
        </p>
      </footer>
    </div>
  );
}

