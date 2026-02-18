const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export async function apiGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  });
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok) {
    const message =
      res.status === 429
        ? 'Too many requests. Please wait a moment and try again.'
        : res.status === 500
          ? 'SERVER_ERROR'
          : 'Failed to fetch';
    const err = new Error(message) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function apiPatch(path: string, token: string, body: unknown): Promise<Response> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  return res;
}

export async function apiPut(path: string, token: string, body: unknown): Promise<Response> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  return res;
}

export async function apiPost(path: string, token: string, body: unknown): Promise<Response> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  return res;
}
