import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// POST /api/support/tickets
router.post('/tickets', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    
    // Create a user-specific Supabase client using their token
    const userSupabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );

    const { data: { user }, error: authError } = await userSupabase.auth.getUser();

    if (authError || !user) return res.status(401).json({ error: 'Invalid token' });

    const { subject, message, ticketId } = req.body;

    const { data, error } = await userSupabase
      .from('support_tickets')
      .insert([
        { 
          user_id: user.id, 
          ticket_id: ticketId, 
          subject: subject || 'General Support', 
          message: message || 'No message provided',
          status: 'pending'
        }
      ])
      .select();

    if (error) throw error;
    res.json({ status: 'success', ticket: data[0] });
  } catch (error: any) {
    console.error('[Support] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
