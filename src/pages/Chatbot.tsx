import { useState, useRef, useEffect } from "react";
import { getStudentDataForAI, saveChatMessage, getChatHistory, type ChatMessage } from "../lib/supabase-simple";
import { getAIAdvice } from "../lib/gemini";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
}

export default function Chatbot({ onBack }: { onBack?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello 👋 I'm ScholarSync, your AI academic advisor. I can see your courses and grades to give you personalized advice. Ask me anything about your studies!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Load chat history from Supabase on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const history = await getChatHistory(50);
      if (history.length > 0) {
        const formattedMessages: Message[] = history.map((msg: ChatMessage) => ({
          id: msg.id,
          sender: msg.role === "user" ? "user" : "ai",
          text: msg.content,
        }));
        setMessages(formattedMessages);
      }
    } catch (err) {
      console.error("Error loading chat history:", err);
    }
  };

  // Quick suggestion buttons
  const quickSuggestions = [
    "How can I improve my grades?",
    "Create a study plan for me",
    "Which course should I focus on?",
    "Am I on track to reach my goals?",
  ];

  const sendMessage = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: messageText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      // Save user message to Supabase
      await saveChatMessage({
        role: "user",
        content: messageText,
      });

      // Get student data for context
      const studentData = await getStudentDataForAI();

      // Get AI response with context
      const chatHistoryForAI = messages.map((msg) => ({
        role: msg.sender as "user" | "assistant",
        content: msg.text,
      }));

      const aiResponse = await getAIAdvice(studentData, messageText, chatHistoryForAI);

      // Save AI response to Supabase
      await saveChatMessage({
        role: "assistant",
        content: aiResponse,
        context: studentData,
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: aiResponse,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error("Error getting AI response:", err);
      setError(err.message || "Failed to get AI response. Please try again.");
      
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "I'm sorry, I encountered an error. Please make sure you have added your Gemini API key in the .env file and that your Supabase database is set up correctly.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f1115] text-white">

      {/* HEADER */}
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1a1d23]">
        <div>
          <h1 className="font-semibold text-lg">🤖 ScholarSync AI Advisor</h1>
          <p className="text-xs text-gray-400">Personalized advice based on your academic data</p>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="text-sm bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg"
          >
            Back
          </button>
        )}
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 m-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* QUICK SUGGESTIONS */}
      <div className="px-4 pt-4">
        <div className="flex flex-wrap gap-2">
          {quickSuggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(suggestion)}
              disabled={loading}
              className="text-xs bg-[#1a1d23] hover:bg-[#252a33] border border-gray-700 px-3 py-2 rounded-full transition disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
              msg.sender === "user"
                ? "ml-auto bg-teal-600 text-white"
                : "bg-[#1a1d23] border border-gray-800 text-gray-200"
            }`}
          >
            {msg.text}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-500"></div>
            ScholarSync is thinking...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="p-4 border-t border-gray-800 bg-[#1a1d23] flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
          placeholder="Ask about your studies..."
          disabled={loading}
          className="flex-1 bg-[#111318] border border-gray-700 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
        />

        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-600 disabled:cursor-not-allowed px-5 rounded-xl font-medium transition"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            "Send"
          )}
        </button>
      </div>
    </div>
  );
}