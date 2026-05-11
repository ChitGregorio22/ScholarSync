import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

app.use(cors());
app.use(express.json());

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// --- AUTH PROXY ---

app.post('/api/auth/signup', async (req, res) => {
  const { email, password, fullName } = req.body;
  console.log(`Signup attempt for: ${email}`);
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    if (error) {
      console.error(`Signup error:`, error.message);
      return res.status(400).json(error);
    }
    console.log(`Signup successful for: ${email}`);
    res.json(data);
  } catch (err: any) {
    console.error(`Signup crash:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body;
  console.log(`Signin attempt for: ${email}`);
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      console.error(`Signin error:`, error.message);
      return res.status(400).json(error);
    }
    console.log(`Signin successful for: ${email}`);
    res.json(data);
  } catch (err: any) {
    console.error(`Signin crash:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- DATA PROXY ---

app.get('/api/courses', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json(error);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- AI ADVICE ---

app.post('/api/ai/advice', async (req, res) => {
  const { prompt, history } = req.body;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chat = model.startChat({
      history: history.map((h: any) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }]
      }))
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    res.json({ text: response.text() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
