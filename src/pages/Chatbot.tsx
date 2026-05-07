import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { BrainIcon } from "../components/Icons";

type Message = {
  id: number;
  sender: "user" | "ai";
  text: string;
};

export default function Chatbot({ onBack }: any) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "ai",
      text: "Hello. I’m your AI study assistant. Ask me anything about your subjects.",
    },
  ]);

  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // SIMPLE AI RESPONSE
  const getAIResponse = (text: string) => {
    const msg = text.toLowerCase();

    if (msg.includes("math"))
      return "Focus on practice daily and break problems into steps.";
    if (msg.includes("study"))
      return "Try 25 mins focus + 5 mins break (Pomodoro).";
    if (msg.includes("exam"))
      return "Review weak topics and do mock tests before exams.";
    
    return "Stay consistent and focus on your weak areas.";
  };

  // SEND MESSAGE
  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      sender: "user",
      text: input,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // AI reply (delay for realism)
    setTimeout(() => {
      const aiMsg: Message = {
        id: Date.now() + 1,
        sender: "ai",
        text: getAIResponse(input),
      };

      setMessages((prev) => [...prev, aiMsg]);
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col bg-transparent text-white"
    >
      <div className="glass-card w-full rounded-[2rem] border border-white/10 p-6 shadow-2xl shadow-slate-950/20 flex flex-col h-screen">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 flex flex-col gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5 shadow-lg shadow-cyan-500/10"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="inline-flex items-center gap-3 text-2xl font-bold">
                <BrainIcon className="text-cyan-300" />
                AI Assistant
              </h1>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="rounded-3xl bg-slate-900/80 px-4 py-2 text-sm text-white transition hover:bg-slate-800"
            >
              Back
            </motion.button>
          </div>
        </motion.div>

        <div className="flex-1 space-y-4 px-2 pb-2 overflow-y-auto">
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: msg.sender === "user" ? 30 : -30, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className={`w-fit max-w-4xl rounded-[1.75rem] px-5 py-4 text-sm shadow-lg shadow-slate-950/10 transition ${
                msg.sender === "user"
                  ? "ml-auto bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950"
                  : "bg-slate-900/80 border border-white/10 text-slate-100"
              }`}
            >
              {msg.text}
            </motion.div>
          ))}

          <div ref={bottomRef} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-6 rounded-[2rem] border border-white/10 bg-slate-950/70 p-4 shadow-inner shadow-slate-950/20"
        >
          <div className="flex gap-3">
            <motion.input
              whileFocus={{ scale: 1.02 }}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask about your studies..."
              className="flex-1 rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-500/20"
            />
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={sendMessage}
              className="rounded-[1.5rem] bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-500/20"
            >
              Send
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}