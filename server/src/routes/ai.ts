import { Router, Request, Response } from 'express';
import { genAI } from '../config/gemini';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// --- AI ADVICE ---
router.post('/advice', authenticateUser, async (req: Request, res: Response) => {
  const { prompt, history, modelType } = req.body;
  
  // Prioritize the selected model if provided, but always include fallbacks for reliability
  const fallbacks = [
    "gemini-2.0-flash", 
    "gemini-1.5-flash", 
    "gemini-1.5-pro",
    "gemini-flash-latest"
  ];
  
  const modelsToTry = modelType 
    ? [modelType, ...fallbacks.filter(m => m !== modelType)] 
    : ["gemini-2.5-flash", ...fallbacks];
  
  for (const modelName of modelsToTry) {
    try {
      console.log(`[AI] Attempting model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const chat = model.startChat({
        history: (history || []).map((h: any) => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }]
        }))
      });
      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      console.log(`[AI] Success with model: ${modelName}`);
      return res.json({ text: response.text() });
    } catch (err: any) {
      console.error(`[AI] Model ${modelName} failed. Reason:`, err.message);
      // Log more details if it's a specific API error
      if (err.response) console.error(`[AI] API Status:`, err.status);
    }
  }
  res.status(404).json({ error: "No working AI models found. Please check your API key and model names." });
});

// --- STUDENT DATA FOR AI ---
router.get('/student-data', authenticateUser, async (req: Request, res: Response) => {
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
router.get('/models', async (req: Request, res: Response) => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
