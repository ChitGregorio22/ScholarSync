import { Router } from 'express';
import { genAI } from '../config/gemini';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// --- AI ADVICE ---
router.post('/advice', authenticateUser, async (req, res) => {
  const { prompt, history, modelType } = req.body;
  
  // Using exact model names available in the 2026 environment
  const modelsToTry = modelType ? [modelType] : ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.0-flash"];
  
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
    }
  }
  res.status(404).json({ error: "No working AI models found. Please check your API key and model names." });
});

// --- STUDENT DATA FOR AI ---
router.get('/student-data', authenticateUser, async (req, res) => {
  const user = (req as any).user;
  const supabase = (req as any).supabase;
  try {
    const { data, error } = await supabase.rpc('get_student_data_for_ai', { p_user_id: user.id });
    if (error) return res.status(400).json(error);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- DIAGNOSTICS ---
router.get('/models', async (req, res) => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
