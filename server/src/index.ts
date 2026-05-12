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

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// --- AUTH ---

app.post('/api/auth/signup', async (req, res) => {
  const { email, password, fullName } = req.body;
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    if (error) return res.status(400).json(error);
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(400).json(error);
    console.log(`Signin successful for: ${email}`);
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// --- DATA PROXY HELPERS ---

async function getAuthUser(req: express.Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return { user: null, error: 'No token provided' };
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  return { user, error };
}

// --- COURSES ---

app.get('/api/courses', async (req, res) => {
  const { user, error: authError } = await getAuthUser(req);
  if (authError || !user) return res.status(401).json({ error: authError || 'Unauthorized' });
  try {
    const { data, error } = await supabase.from('courses').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) return res.status(400).json(error);
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/courses', async (req, res) => {
  const { user, error: authError } = await getAuthUser(req);
  if (authError || !user) return res.status(401).json({ error: authError || 'Unauthorized' });
  try {
    const { data, error } = await supabase.from('courses').insert({ ...req.body, user_id: user.id }).select().single();
    if (error) return res.status(400).json(error);
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/courses/:id', async (req, res) => {
  const { user, error: authError } = await getAuthUser(req);
  if (authError || !user) return res.status(401).json({ error: authError || 'Unauthorized' });
  try {
    const { data, error } = await supabase.from('courses').update(req.body).eq('id', req.params.id).eq('user_id', user.id).select().single();
    if (error) return res.status(400).json(error);
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/courses/:id', async (req, res) => {
  const { user, error: authError } = await getAuthUser(req);
  if (authError || !user) return res.status(401).json({ error: authError || 'Unauthorized' });
  try {
    const { error } = await supabase.from('courses').delete().eq('id', req.params.id).eq('user_id', user.id);
    if (error) return res.status(400).json(error);
    res.json({ status: 'deleted' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// --- ASSESSMENTS ---

app.get('/api/assessments/:courseId', async (req, res) => {
  const { user, error: authError } = await getAuthUser(req);
  if (authError || !user) return res.status(401).json({ error: authError || 'Unauthorized' });
  try {
    const { data, error } = await supabase.from('assessments').select('*').eq('course_id', req.params.courseId).order('created_at', { ascending: false });
    if (error) return res.status(400).json(error);
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/assessments', async (req, res) => {
  const { user, error: authError } = await getAuthUser(req);
  if (authError || !user) return res.status(401).json({ error: authError || 'Unauthorized' });
  try {
    const { data, error } = await supabase.from('assessments').insert({ ...req.body, user_id: user.id }).select().single();
    if (error) return res.status(400).json(error);
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/assessments/:id', async (req, res) => {
  const { user, error: authError } = await getAuthUser(req);
  if (authError || !user) return res.status(401).json({ error: authError || 'Unauthorized' });
  try {
    const { error } = await supabase.from('assessments').delete().eq('id', req.params.id).eq('user_id', user.id);
    if (error) return res.status(400).json(error);
    res.json({ status: 'deleted' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// --- STUDY LOGS ---

app.get('/api/study-logs', async (req, res) => {
  const { user, error: authError } = await getAuthUser(req);
  if (authError || !user) return res.status(401).json({ error: authError || 'Unauthorized' });
  try {
    let query = supabase.from('study_logs').select('*').eq('user_id', user.id).order('date', { ascending: false });
    if (req.query.courseId) query = query.eq('course_id', req.query.courseId as string);
    const { data, error } = await query;
    if (error) return res.status(400).json(error);
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/study-logs', async (req, res) => {
  const { user, error: authError } = await getAuthUser(req);
  if (authError || !user) return res.status(401).json({ error: authError || 'Unauthorized' });
  try {
    const { data, error } = await supabase.from('study_logs').insert({ ...req.body, user_id: user.id }).select().single();
    if (error) return res.status(400).json(error);
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/study-logs/:id', async (req, res) => {
  const { user, error: authError } = await getAuthUser(req);
  if (authError || !user) return res.status(401).json({ error: authError || 'Unauthorized' });
  try {
    const { error } = await supabase.from('study_logs').delete().eq('id', req.params.id).eq('user_id', user.id);
    if (error) return res.status(400).json(error);
    res.json({ status: 'deleted' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// --- PROFILE ---

app.get('/api/profile', async (req, res) => {
  const { user, error: authError } = await getAuthUser(req);
  if (authError || !user) return res.status(401).json({ error: authError || 'Unauthorized' });
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (error) return res.status(400).json(error);
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/profile', async (req, res) => {
  const { user, error: authError } = await getAuthUser(req);
  if (authError || !user) return res.status(401).json({ error: authError || 'Unauthorized' });
  try {
    const { data, error } = await supabase.from('profiles').update(req.body).eq('id', user.id).select().single();
    if (error) return res.status(400).json(error);
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// --- CHAT HISTORY ---

app.get('/api/chat/history', async (req, res) => {
  const { user, error: authError } = await getAuthUser(req);
  if (authError || !user) return res.status(401).json({ error: authError || 'Unauthorized' });
  try {
    const { data, error } = await supabase.from('chat_history').select('*').eq('user_id', user.id).order('created_at', { ascending: true });
    if (error) return res.status(400).json(error);
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.post('/api/chat', async (req, res) => {
  const { user, error: authError } = await getAuthUser(req);
  if (authError || !user) return res.status(401).json({ error: authError || 'Unauthorized' });
  try {
    const { data, error } = await supabase.from('chat_history').insert({ ...req.body, user_id: user.id }).select().single();
    if (error) return res.status(400).json(error);
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// --- HEALTH & DIAGNOSTICS ---

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/ai/models', async (req, res) => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

app.get('/api/ai/student-data', async (req, res) => {
  const { user, error: authError } = await getAuthUser(req);
  if (authError || !user) return res.status(401).json({ error: authError || 'Unauthorized' });
  try {
    const { data, error } = await supabase.rpc('get_student_data_for_ai', { p_user_id: user.id });
    if (error) return res.status(400).json(error);
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

// --- AI ADVICE ---

app.post('/api/ai/advice', async (req, res) => {
  const { prompt, history, modelType } = req.body;
  const modelsToTry = modelType ? [modelType] : ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-flash-latest"];
  
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
      console.error(`Model ${modelName} failed:`, err.message);
      if (!err.message.includes('404') && !err.message.includes('not found')) {
        return res.status(500).json({ error: err.message });
      }
    }
  }
  res.status(404).json({ error: "No working AI models found." });
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
