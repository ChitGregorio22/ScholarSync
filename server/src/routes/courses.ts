import { Router, Request, Response } from 'express';
import { authenticateUser } from '../middleware/auth';

const router = Router();

router.get('/', authenticateUser, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const supabase = (req as any).supabase;
  try {
    const { data, error } = await supabase.from('courses').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) return res.status(400).json(error);
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateUser, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const supabase = (req as any).supabase;
  try {
    const { data, error } = await supabase.from('courses').insert({ ...req.body, user_id: user.id }).select().single();
    if (error) return res.status(400).json(error);
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id', authenticateUser, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const supabase = (req as any).supabase;
  try {
    const { data, error } = await supabase.from('courses').update(req.body).eq('id', req.params.id).eq('user_id', user.id).select().single();
    if (error) return res.status(400).json(error);
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateUser, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const supabase = (req as any).supabase;
  try {
    const { error } = await supabase.from('courses').delete().eq('id', req.params.id).eq('user_id', user.id);
    if (error) return res.status(400).json(error);
    res.json({ status: 'deleted' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
