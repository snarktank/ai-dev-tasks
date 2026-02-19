import type { Request, Response, NextFunction } from 'express';
import type { SupabaseClient, User } from '@supabase/supabase-js';

export type AuthedRequest = Request & { authUser?: User };

export function authMiddleware(supabase: SupabaseClient) {
  return async (req: AuthedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : undefined;
    if (!token) {
      return res.status(401).json({ error: 'missing_bearer_token' });
    }
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: 'invalid_token', detail: error?.message });
    }
    req.authUser = data.user;
    next();
  };
}


