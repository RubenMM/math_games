export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function api<T>(url: string, init: { method?: string; body?: unknown; hostToken?: string } = {}): Promise<T> {
  const res = await fetch(url, {
    method: init.method ?? (init.body ? 'POST' : 'GET'),
    headers: {
      ...(init.body ? { 'content-type': 'application/json' } : {}),
      ...(init.hostToken ? { 'x-host-token': init.hostToken } : {}),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error ?? 'Something went wrong', res.status);
  return data as T;
}

/** localStorage that never throws (private windows, blocked storage). */
export const storage = {
  get(key: string) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {}
  },
  remove(key: string) {
    try {
      localStorage.removeItem(key);
    } catch {}
  },
};

export const hostTokenKey = (code: string) => `host:${code}`;
export const playerIdKey = (code: string) => `player:${code}`;
