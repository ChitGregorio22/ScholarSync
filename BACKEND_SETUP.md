# ScholarSync Backend Setup Guide

This guide will help you set up the backend for your AI Student Performance Advisor.

## Quick Start

### Step 1: Database Setup

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `kujcypiqwitgflnneykk`
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New query**
5. Open the file `supabase_schema.sql` from this project folder
6. Copy the entire contents and paste into the SQL Editor
7. Click **Run** to create all tables

**Expected Result:** All tables (courses, assessments, study_logs, chat_history, profiles) will be created with proper Row Level Security (RLS) policies.

---

### Step 2: Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Verify the Supabase credentials are correct:
   - `VITE_SUPABASE_URL` should be: `https://kujcypiqwitgflnneykk.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` is already filled in

3. **Get Gemini API Key** (optional - for AI chatbot):
   - Go to https://ai.google.dev/
   - Sign in with Google account
   - Click "Get API Key" 
   - Create a new API key
   - Copy it to `VITE_GEMINI_API_KEY` in `.env`

---

### Step 3: Install Dependencies

```bash
npm install
```

This will install `@supabase/supabase-js` and any other required packages.

---

### Step 4: Configure CORS (One-time setup)

In Supabase Dashboard:
1. Go to **Authentication** → **URL Configuration**
2. Add your site URL:
   - For development: `http://localhost:5173`
   - For production: your Vercel/Netlify URL
3. Save changes

---

### Step 5: Enable Authentication

In Supabase Dashboard:
1. Go to **Authentication** → **Providers**
2. Ensure **Email** provider is enabled
3. Configure settings:
   - Disable "Confirm email" for easier testing (optional)
   - Or keep enabled for production security

---

## Architecture Overview

### Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                         USERS (auth)                        │
│  • id, email, created_at (managed by Supabase)              │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┬──────────────────┐
        │               │               │                  │
        ▼               ▼               ▼                  ▼
┌───────────────┐ ┌─────────────┐ ┌──────────────┐ ┌────────────────┐
│   COURSES     │ │ ASSESSMENTS │ │  STUDY_LOGS  │ │  CHAT_HISTORY  │
│  • user_id    │ │ • course_id │ │ • course_id  │ │  • user_id     │
│  • course_name│ │ • user_id   │ │ • user_id    │ │  • role        │
│  • credits    │ │ • type      │ │ • hours      │ │  • content     │
│  • target     │ │ • score     │ │ • date       │ │  • context     │
│               │ │ • weight    │ │              │ │                │
└───────────────┘ └─────────────┘ └──────────────┘ └────────────────┘
```

### Row Level Security (RLS)

All tables have RLS enabled. Users can only access their own data through these policies:

```sql
-- Example policy for courses table
CREATE POLICY "Users can only access their own courses" 
ON courses FOR ALL 
USING (auth.uid() = user_id);
```

### API Functions (Supabase Client)

All database operations are in `src/lib/supabase.ts`:

| Function | Description |
|----------|-------------|
| `signUp()` | Register new user with email/password |
| `signIn()` | Authenticate user |
| `signOut()` | Log out user |
| `getCourses()` | Fetch all user's courses |
| `createCourse()` | Add new course |
| `updateCourse()` | Edit course details |
| `deleteCourse()` | Remove course |
| `getAssessments()` | Fetch all grades/assessments |
| `createAssessment()` | Add grade entry |
| `updateAssessment()` | Edit grade entry |
| `deleteAssessment()` | Remove grade entry |
| `getStudyLogs()` | Fetch study history |
| `createStudyLog()` | Log study session |
| `getChatHistory()` | Fetch chat messages |
| `saveChatMessage()` | Save chat message |
| `getStudentDataForAI()` | Get all data formatted for AI |

---

## Integration Steps

### 1. Update App.tsx to use Supabase Auth

Replace the localStorage-based auth with Supabase:

```typescript
import { useEffect, useState } from 'react';
import { supabase, getSession, signOut } from './lib/supabase';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ... rest of component
}
```

### 2. Replace localStorage with Supabase for Data

Replace localStorage operations with Supabase CRUD functions:

**Old (localStorage):**
```typescript
const saved = localStorage.getItem("subjects");
if (saved) setSubjects(JSON.parse(saved));
```

**New (Supabase):**
```typescript
import { getCourses, getAssessments } from './lib/supabase';

const loadData = async () => {
  const courses = await getCourses();
  const assessments = await getAssessments();
  // Transform and set state
};
```

---

## Testing the Backend

### Test 1: Authentication
1. Start the dev server: `npm run dev`
2. Go to `http://localhost:5173`
3. Try registering a new user
4. Check Supabase Dashboard → Authentication → Users to verify

### Test 2: CRUD Operations
1. Add a course
2. Add an assessment/grade
3. Check Supabase Dashboard → Table Editor to verify data

### Test 3: RLS Security
- Verify you can only see your own data when logged in
- Verify data persists after refresh

---

## Next Steps

1. ✅ Run the SQL schema in Supabase
2. ✅ Set up environment variables
3. ✅ Install dependencies
4. ⏳ Integrate Supabase auth into App.tsx
5. ⏳ Replace localStorage with Supabase CRUD
6. ⏳ Add Gemini API integration for AI chatbot
7. ⏳ Test everything

---

## Troubleshooting

### "Missing Supabase environment variables"
- Check that `.env` file exists in project root
- Verify variable names start with `VITE_` (required for Vite)
- Restart the dev server after adding env variables

### "Permission denied" errors
- Ensure you're logged in before making database calls
- Check RLS policies are properly set up in Supabase
- Verify the SQL schema was executed successfully

### Auth not persisting
- Check browser's localStorage for `supabase.auth.token`
- Verify CORS settings in Supabase Dashboard

---

## Gemini API Integration

For the AI chatbot, you'll need to add the Gemini integration:

```typescript
// src/lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function getAIAdvice(studentData: any, userMessage: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const prompt = `You are an expert academic advisor. Here's the student's data:
  ${JSON.stringify(studentData, null, 2)}
  
  Student asks: ${userMessage}
  
  Provide personalized, actionable advice.`;
  
  const result = await model.generateContent(prompt);
  return result.response.text();
}
```

---

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Supabase JS Client**: https://supabase.com/docs/reference/javascript
- **Gemini API Docs**: https://ai.google.dev/docs

Need help? Check the Supabase Dashboard logs or contact me!
