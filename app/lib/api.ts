import { getToken } from '@/lib/session';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function login(username: string, password: string) {
  const res = await fetch(`${API_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  }).catch((e) => {
    console.warn('Login network error', { API_URL, error: String(e) });
    throw new Error('Network request failed');
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any)?.error ?? 'Inloggning misslyckades');
  }
  return (await res.json()) as { token: string };
}

export async function register(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).catch((e) => {
    console.warn('Register network error', { API_URL, error: String(e) });
    throw new Error('Network request failed');
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as any;
    const issues: string[] | undefined = Array.isArray(err?.issues)
      ? err.issues.map((i: any) => {
          const path = Array.isArray(i?.path) ? i.path.join('.') : String(i?.path ?? '');
          return path ? `${path}: ${i?.message ?? 'ogiltigt värde'}` : `${i?.message ?? 'ogiltigt värde'}`;
        })
      : undefined;
    const detail = issues && issues.length ? ` (${issues.join(', ')})` : '';
    throw new Error(`${err?.error ?? 'Registrering misslyckades'}${detail}`);
  }
  return (await res.json()) as { token: string };
}

export async function authedFetch(path: string, init: RequestInit = {}) {
  const token = await getToken();
  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: token ? `Bearer ${token}` : '',
    },
  }).catch((e) => {
    console.warn('authedFetch network error', { API_URL, path, error: String(e) });
    throw e;
  });
}

export async function health() {
  const res = await fetch(`${API_URL}/api/health`).catch((e) => {
    console.warn('Health check network error', { API_URL, error: String(e) });
    throw new Error('Network request failed');
  });
  return res.ok;
}

export async function getMe(): Promise<{
  id: number;
  username: string;
  email: string | null;
  total_co2_saved: number;
  created_at: string;
}> {
  const res = await authedFetch('/api/me');
  if (!res.ok) {
    throw new Error('Inte inloggad');
  }
  return (await res.json()) as any;
}


