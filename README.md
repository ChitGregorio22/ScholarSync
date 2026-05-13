# ScholarSync 🎓

**ScholarSync** is an AI-powered academic performance platform designed to help students track their grades, visualize their progress, and receive personalized study advice through a cutting-edge AI Student Advisor.

![ScholarSync Banner](https://img.shields.io/badge/ScholarSync-AI--Powered-blueviolet?style=for-the-badge)
![Deployment](https://img.shields.io/badge/Deployed-Vercel%20%26%20Render-success?style=for-the-badge)

## 🚀 Features

- **AI Student Advisor**: A personalized chatbot that analyzes your coursework and grades to provide actionable study plans.
- **Grades Manager**: Track your courses, credits, and target grades with a premium, interactive interface.
- **Academic Dashboard**: Visualize your GPA, study hours, and performance trends using dynamic charts.
- **Study Logs**: Log your study sessions and associate them with specific courses to track productivity.
- **Multi-Language Support**: Seamlessly switch between English and other languages.
- **Modern UI/UX**: Built with a sleek, dark-mode-first aesthetic using Tailwind CSS and Framer Motion.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **Hosting**: Vercel

### Backend
- **Runtime**: Node.js + Express
- **Language**: TypeScript
- **AI**: Google Gemini API (via `@google/generative-ai`)
- **Hosting**: Render

### Database & Auth
- **Provider**: Supabase (PostgreSQL + GoTrue Auth)

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Supabase Account
- Google AI Studio API Key (for Gemini)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ArcaIcr/Scholar-Sync.git
   cd Scholar-Sync
   ```

2. **Setup the Server**:
   ```bash
   cd server
   npm install
   # Create a .env file with:
   # PORT=5000
   # SUPABASE_URL=your_url
   # SUPABASE_ANON_KEY=your_key
   # GEMINI_API_KEY=your_key
   ```

3. **Setup the Client**:
   ```bash
   cd ../client
   npm install
   # Create a .env file with:
   # VITE_API_URL=http://localhost:5000/api
   # VITE_SUPABASE_URL=your_url
   # VITE_SUPABASE_ANON_KEY=your_key
   ```

4. **Run Locally**:
   - Server: `npm run dev` (in /server)
   - Client: `npm run dev` (in /client)

## 🌐 Deployment

### Backend (Render)
- **Environment**: Node.js
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Root Directory**: `server`

### Frontend (Vercel)
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Root Directory**: `client`

## 📄 Documentation
For detailed information on the AI integration, see [AI_INTEGRATION.md](./AI_INTEGRATION.md).

## ⚖️ License
This project is for educational purposes.
