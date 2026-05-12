import { Router } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

router.post('/signup', async (req, res) => {
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

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(400).json(error);
    res.json(data);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
