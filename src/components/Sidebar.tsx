export default function Sidebar({ setPage }: any) {
    return (
      <div className="w-64 min-h-screen bg-[#0b0d10] border-r border-gray-800 p-4 text-white">
  
        <h1 className="text-xl font-bold mb-6">🎓 Student AI</h1>
  
        <div className="space-y-2">
  
          <button onClick={() => setPage("dashboard")}
            className="w-full text-left p-3 rounded-lg hover:bg-gray-800">
            📊 Dashboard
          </button>
  
          <button onClick={() => setPage("grades")}
            className="w-full text-left p-3 rounded-lg hover:bg-gray-800">
            📝 Grades Manager
          </button>
  
          <button onClick={() => setPage("profile")}
            className="w-full text-left p-3 rounded-lg hover:bg-gray-800">
            👤 Profile
          </button>
  
          <button onClick={() => setPage("chat")}
            className="w-full text-left p-3 rounded-lg hover:bg-gray-800">
            🤖 AI Chat
          </button>
  
        </div>
      </div>
    );
  }