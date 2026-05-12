import { useState, useEffect } from "react";
import { getChatHistory, type ChatMessage } from "../lib/supabase-simple";
import { motion } from "framer-motion";
import { MessageSquare, Clock, Bot, User } from "lucide-react";

/**
 * Chat History Page
 * 
 * Displays a chronological list of past AI advisor conversations.
 * Updated with semantic theme tokens for Light/Dark mode support.
 */
export default function ChatHistory() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const history = await getChatHistory();
      setMessages(history);
    } catch (err) {
      console.error("Error loading chat history:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-2rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
          <p className="text-tx-dim font-medium animate-pulse">Fetching history...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 pb-12"
    >
      <header>
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-5 h-5 text-brand-primary" />
          <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">Archive</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">Conversation History</h1>
        <p className="text-tx-dim mt-2">Review your past sessions with the AI advisor.</p>
      </header>

      {messages.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-bg-hover rounded-full flex items-center justify-center mx-auto">
            <MessageSquare className="w-8 h-8 text-tx-muted" />
          </div>
          <p className="text-tx-dim">No chat history yet. Start a conversation with the AI advisor!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {messages.map((msg, idx) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-6 rounded-3xl border ${
                msg.role === "user" 
                  ? "bg-brand-primary/5 border-brand-primary/10 ml-12" 
                  : "bg-bg-card border-border-subtle mr-12"
              } shadow-sm`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${msg.role === "user" ? "bg-brand-primary/10" : "bg-accent/10"}`}>
                    {msg.role === "user" ? (
                      <User className="w-4 h-4 text-brand-primary" />
                    ) : (
                      <Bot className="w-4 h-4 text-accent" />
                    )}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-tx-main">
                    {msg.role === "user" ? "You" : "AI Advisor"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-tx-muted">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold">
                    {new Date(msg.created_at || "").toLocaleString()}
                  </span>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-tx-main whitespace-pre-wrap">{msg.content}</p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}