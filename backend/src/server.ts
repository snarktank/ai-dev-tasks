import express from 'express';
import cors from 'cors';
import { loadEnv } from './env';
import { createSupabaseClient } from './supabaseClient';
import { authMiddleware, type AuthedRequest } from './auth';

const env = loadEnv();
const supabase = createSupabaseClient(env);

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// Returns auth user information (requires Authorization: Bearer <token>)
app.get('/me', authMiddleware(supabase), async (req: AuthedRequest, res) => {
  const user = req.authUser!;
  res.json({
    id: user.id,
    email: user.email,
    metadata: user.user_metadata,
    created_at: user.created_at,
  });
});

// Returns the caller's profile row from Supabase (if exists)
app.get('/profiles/me', authMiddleware(supabase), async (req: AuthedRequest, res) => {
  const user = req.authUser!;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, first_name, last_name, avatar_url, created_at, updated_at')
    .eq('id', user.id)
    .single();
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.json({ profile: data });
});

// Updates caller's profile (simple example)
app.post('/profiles/update', authMiddleware(supabase), async (req: AuthedRequest, res) => {
  const user = req.authUser!;
  const { username, first_name, last_name, full_name } = req.body ?? {};
  const { data, error } = await supabase
    .from('profiles')
    .update({
      username: typeof username === 'string' ? username : undefined,
      first_name: typeof first_name === 'string' ? first_name : undefined,
      last_name: typeof last_name === 'string' ? last_name : undefined,
      full_name:
        typeof full_name === 'string'
          ? full_name
          : [first_name, last_name].filter(Boolean).join(' ') || undefined,
    })
    .eq('id', user.id)
    .select()
    .single();
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.json({ profile: data });
});

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API server listening on http://localhost:${env.PORT}`);
});


