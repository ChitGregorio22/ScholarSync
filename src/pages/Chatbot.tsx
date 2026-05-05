import { useState, useRef, useEffect } from "react";

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
      text: "Hello 👋 I’m your AI study assistant. Ask me anything about your subjects.",
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
    
    return "Stay consistent and focus on your weak areas 💡";
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
    <div className="min-h-screen flex flex-col bg-[#0f1115] text-white">

      {/* HEADER */}
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1a1d23]">
        <h1 className="font-semibold text-lg">🤖 AI Assistant</h1>

        <button
          onClick={onBack}
          className="text-sm bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg"
        >
          Back
        </button>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-xs px-4 py-3 rounded-2xl text-sm ${
              msg.sender === "user"
                ? "ml-auto bg-teal-600 text-white"
                : "bg-[#1a1d23] border border-gray-800 text-gray-200"
            }`}
          >
            {msg.text}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="p-4 border-t border-gray-800 bg-[#1a1d23] flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask about your studies..."
          className="flex-1 bg-[#111318] border border-gray-700 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
        />

        <button
          onClick={sendMessage}
          className="bg-teal-500 hover:bg-teal-600 px-5 rounded-xl font-medium"
        >
          Send
        </button>
      </div>
    </div>
  );
}