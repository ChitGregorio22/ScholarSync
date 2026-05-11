# ScholarSync Backend Setup Checklist

## Immediate Actions Required (5 minutes)

### Step 1: Run SQL Schema in Supabase (2 minutes)
- [ ] Go to https://supabase.com/dashboard
- [ ] Select project: `kujcypiqwitgflnneykk`
- [ ] Navigate to **SQL Editor** → **New query**
- [ ] Open `supabase_schema.sql` file
- [ ] Copy entire contents
- [ ] Paste into SQL Editor
- [ ] Click **Run**
- [ ] ✅ Verify: Tables created without errors

### Step 2: Configure Environment Variables (1 minute)
- [ ] ✅ `.env` file created (already done)
- [ ] Verify `VITE_SUPABASE_URL` is correct
- [ ] Verify `VITE_SUPABASE_ANON_KEY` is correct
- [ ] (Optional) Add `VITE_GEMINI_API_KEY` from https://ai.google.dev/

### Step 3: Configure CORS in Supabase (1 minute)
- [ ] Go to Supabase Dashboard → **Authentication** → **URL Configuration**
- [ ] Add Site URL: `http://localhost:5173`
- [ ] Add Redirect URL: `http://localhost:5173`
- [ ] Save changes

### Step 4: Enable Email Auth (1 minute)
- [ ] Go to Supabase Dashboard → **Authentication** → **Providers**
- [ ] Enable **Email** provider
- [ ] (Optional) Disable "Confirm email" for easier testing
- [ ] Save changes

---

## Backend Integration in Your Code

### Replace App.tsx Auth (Current priority)

Your current `App.tsx` uses localStorage for auth. Replace it with Supabase:

```typescript
import { useEffect, useState } from 'react';
import { supabase, getSession } from './lib/supabase';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Remove these localStorage-based handlers:
  // const handleLogin = (data: any) => {...}
  // const handleRegister = (data: any) => {...}
  // Replace with supabase signIn/signUp calls

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    // ... rest of your JSX
  );
}
```

### Update HomePage.tsx

Replace login/register forms to use Supabase:

```typescript
import { signIn, signUp } from '../lib/supabase';

// In your login handler:
const handleLogin = async (email: string, password: string) => {
  try {
    const data = await signIn(email, password);
    // Redirect to dashboard
  } catch (error) {
    // Show error message
  }
};

// In your register handler:
const handleRegister = async (email: string, password: string, fullName: string) => {
  try {
    const data = await signUp(email, password, fullName);
    // Show success / redirect
  } catch (error) {
    // Show error message
  }
};
```

### Update Dashboard.tsx

Replace localStorage with Supabase CRUD:

```typescript
import { useEffect, useState } from 'react';
import { getCourses, createCourse, updateCourse, deleteCourse } from '../lib/supabase';

// Replace this:
// const saved = localStorage.getItem("subjects");

// With this:
useEffect(() => {
  const loadCourses = async () => {
    const courses = await getCourses();
    setSubjects(courses);
  };
  loadCourses();
}, []);

// Replace this:
// localStorage.setItem("subjects", JSON.stringify(subjects));

// With Supabase create/update/delete calls
```

### Update Chatbot.tsx

Replace localStorage chat with Supabase + Gemini:

```typescript
import { getStudentDataForAI, saveChatMessage, getChatHistory } from '../lib/supabase';
import { getAIAdvice } from '../lib/gemini';

// Load chat history from Supabase
useEffect(() => {
  const loadChat = async () => {
    const history = await getChatHistory();
    setChatHistory(history);
  };
  loadChat();
}, []);

// Send message handler
const handleSendMessage = async (message: string) => {
  // 1. Save user message to Supabase
  await saveChatMessage({ role: 'user', content: message });
  
  // 2. Get student data for context
  const studentData = await getStudentDataForAI();
  
  // 3. Get AI response with context
  const aiResponse = await getAIAdvice(studentData, message, chatHistory);
  
  // 4. Save AI response to Supabase
  await saveChatMessage({ 
    role: 'assistant', 
    content: aiResponse,
    context: studentData 
  });
  
  // 5. Update UI
  setChatHistory([...chatHistory, { role: 'user', content: message }, { role: 'assistant', content: aiResponse }]);
};
```

---

## Testing Checklist

### Test 1: Database Schema (Run in Supabase SQL Editor)

```sql
-- Verify tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Expected: courses, assessments, study_logs, chat_history, profiles
```

### Test 2: Authentication

```typescript
// In browser console (when app is running)
import { signUp, signIn, signOut, getCurrentUser } from './lib/supabase';

// Test signup
await signUp('test@example.com', 'password123', 'Test User');

// Test signin
await signIn('test@example.com', 'password123');

// Test get user
await getCurrentUser();

// Test signout
await signOut();
```

### Test 3: CRUD Operations

```typescript
import { createCourse, getCourses, createAssessment } from './lib/supabase';

// Create a course
const course = await createCourse({
  course_name: 'Calculus I',
  course_code: 'MATH101',
  credits: 3,
  target_grade: 'A'
});

// Get all courses
const courses = await getCourses();
console.log(courses);

// Add an assessment
await createAssessment({
  course_id: course.id,
  type: 'Midterm',
  name: 'Midterm Exam',
  score: 85,
  total_points: 100,
  weight: 30
});
```

### Test 4: AI Integration

```typescript
import { getStudentDataForAI, getAIAdvice } from './lib/supabase';

// Get student data
const data = await getStudentDataForAI();
console.log(data);

// Get AI advice (requires Gemini API key)
const advice = await getAIAdvice(data, 'How can I improve my grades?');
console.log(advice);
```

---

## Troubleshooting

### Error: "Missing Supabase environment variables"
- ✅ Check `.env` file exists in project root
- ✅ Verify variable names: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- ✅ Restart dev server after adding env variables

### Error: "Permission denied" or 401
- ✅ Check user is logged in: `await getCurrentUser()`
- ✅ Verify RLS policies created (check SQL schema ran successfully)
- ✅ Verify CORS settings in Supabase Dashboard

### Error: "Failed to get AI advice"
- ✅ Check `VITE_GEMINI_API_KEY` is set in `.env`
- ✅ Verify API key is valid at https://ai.google.dev/
- ✅ Check browser console for detailed error

### Database tables not showing in Supabase
- ✅ Go to Supabase Dashboard → Table Editor
- ✅ Verify you ran the SQL schema
- ✅ Check SQL Editor for any error messages

---

## Next Steps Priority Order

1. **HIGH PRIORITY** - Run SQL schema in Supabase
2. **HIGH PRIORITY** - Configure CORS and Auth in Supabase
3. **HIGH PRIORITY** - Update App.tsx with Supabase auth
4. **MEDIUM PRIORITY** - Update Dashboard with Supabase CRUD
5. **MEDIUM PRIORITY** - Update Chatbot with Supabase + Gemini
6. **LOW PRIORITY** - Add study logs feature
7. **LOW PRIORITY** - Add profile editing

---

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Supabase JS Reference**: https://supabase.com/docs/reference/javascript
- **Gemini API Docs**: https://ai.google.dev/docs
- **Your Project URL**: https://kujcypiqwitgflnneykk.supabase.co

---

## ✅ Success Criteria

When all of the following work, your backend is fully set up:

- [ ] Can register new user (appears in Supabase Auth → Users)
- [ ] Can login with existing user
- [ ] Can create a course (appears in Supabase Table Editor)
- [ ] Can add grades/assessments
- [ ] Data persists after refresh (no longer using localStorage)
- [ ] AI chatbot responds with personalized advice (requires Gemini API key)
