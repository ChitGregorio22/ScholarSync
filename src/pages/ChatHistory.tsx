export default function ChatHistory() {
    const data = JSON.parse(localStorage.getItem("chatHistory") || "[]");
  
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">💬 Chat History</h1>
  
        {data.length === 0 && (
          <p className="text-gray-400">No history yet</p>
        )}
  
        {data.map((c: any, i: number) => (
          <div key={i} className="bg-[#1a1d23] p-3 mb-2 rounded">
            <p>Q: {c.q}</p>
            <p className="text-emerald-400">A: {c.a}</p>
          </div>
        ))}
      </div>
    );
  }