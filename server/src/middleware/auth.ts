import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

/**
 * Middleware to authenticate Supabase users via JWT
 * Attaches both the user object and a scoped Supabase client to the request
 */
export async function authenticateUser(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // Create a scoped client that passes the user's JWT
    // This allows Supabase RLS to recognize the user
    const userSupabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },
      }
    );

    const { data: { user }, error } = await userSupabase.auth.getUser();
    
    if (error || !user) {
      return res.status(401).json({ error: error?.message || 'Unauthorized' });
    }

    // Attach user and scoped client to request
    (req as any).user = user;
    (req as any).supabase = userSupabase;
    next();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
