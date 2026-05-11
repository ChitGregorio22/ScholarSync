import { useState, useEffect } from "react";
import { getChatHistory, type ChatMessage } from "../lib/supabase-simple";

export default function ChatHistory() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const history = await getChatHistory(100);
      setMessages(history);
    } catch (err) {
      console.error("Error loading chat history:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">💬 Chat History</h1>
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-[#0f1115] text-white">
      <h1 className="text-2xl font-bold mb-6">💬 Chat History</h1>

      {messages.length === 0 ? (
        <p className="text-gray-400">No chat history yet. Start a conversation with the AI advisor!</p>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`p-4 rounded-lg ${
                msg.role === "user" 
                  ? "bg-teal-900/30 border border-teal-700/50 ml-8" 
                  : "bg-[#1a1d23] border border-gray-700 mr-8"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-semibold px-2 py-1 rounded ${
                  msg.role === "user" ? "bg-teal-600" : "bg-purple-600"
                }`}>
                  {msg.role === "user" ? "You" : "AI Advisor"}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(msg.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}