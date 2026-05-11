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

// Diagnostic endpoint to see what models your key can access
app.get('/api/ai/models', async (req, res) => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/advice', async (req, res) => {
  const { prompt, history, modelType } = req.body;
  
  // List of models based on your diagnostic results
  const modelsToTry = modelType ? [modelType] : [
    "gemini-2.5-flash", 
    "gemini-2.5-pro", 
    "gemini-2.0-flash",
    "gemini-flash-latest",
    "gemini-pro-latest"
  ];
  
  for (const modelName of modelsToTry) {
    try {
      console.log(`Trying AI model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const chat = model.startChat({
        history: (history || []).map((h: any) => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }]
        }))
      });

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      console.log(`Success with model: ${modelName}`);
      return res.json({ text: response.text() });
    } catch (err: any) {
      console.error(`Model ${modelName} failed with error:`, err.message);
      // If it's a 404 or 400, continue to next model. 
      if (!err.message.includes('404') && !err.message.includes('not found') && !err.message.includes('400')) {
        return res.status(500).json({ error: err.message });
      }
    }
  }

  res.status(404).json({ error: "No working AI models found. Please check your API key and permissions." });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
