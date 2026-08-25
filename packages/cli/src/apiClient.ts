// Thin wrapper around the backend's REST API. The CLI never talks to Google (or any
// upstream service) directly — everything routes through the backend so auth/token
// handling lives in exactly one place. Not yet used by any command (see index.ts).

const BASE_URL = process.env.DASHBOARD_API_URL ?? 'http://localhost:4317/api';

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`API ${path} failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as T;
}
