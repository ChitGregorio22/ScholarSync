import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.get('/', authenticateUser, async (req, res) => {
  const user = (req as any).user;
  const supabase = (req as any).supabase;
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (error) return res.status(400).json(error);
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.patch('/', authenticateUser, async (req, res) => {
  const user = (req as any).user;
  const supabase = (req as any).supabase;
  try {
    const { data, error } = await supabase.from('profiles').update(req.body).eq('id', user.id).select().single();
    if (error) return res.status(400).json(error);
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
