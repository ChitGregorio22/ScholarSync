import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.get('/history', authenticateUser, async (req, res) => {
  const user = (req as any).user;
  const supabase = (req as any).supabase;
  try {
    const { data, error } = await supabase.from('chat_history').select('*').eq('user_id', user.id).order('created_at', { ascending: true });
    if (error) return res.status(400).json(error);
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateUser, async (req, res) => {
  const user = (req as any).user;
  const supabase = (req as any).supabase;
  try {
    const { data, error } = await supabase.from('chat_history').insert({ ...req.body, user_id: user.id }).select().single();
    if (error) return res.status(400).json(error);
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete('/history', authenticateUser, async (req, res) => {
  const user = (req as any).user;
  const supabase = (req as any).supabase;
  try {
    const { error } = await supabase.from('chat_history').delete().eq('user_id', user.id);
    if (error) return res.status(400).json(error);
    res.json({ status: 'cleared' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
