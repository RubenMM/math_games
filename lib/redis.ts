import { Redis } from '@upstash/redis';

/** The subset of Redis commands the app uses. Upstash and the dev fallback both implement it. */
export interface Kv {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, opts?: { ex: number }): Promise<unknown>;
  hget<T>(key: string, field: string): Promise<T | null>;
  hset(key: string, fields: Record<string, unknown>): Promise<unknown>;
  hgetall<T>(key: string): Promise<Record<string, T> | null>;
  hdel(key: string, ...fields: string[]): Promise<unknown>;
  expire(key: string, seconds: number): Promise<unknown>;
}

/** Local-dev fallback used when no Redis credentials are configured. TTLs are ignored. */
function createMemoryKv(): Kv {
  const g = globalThis as { __memoryKv?: Map<string, unknown> };
  const data = (g.__memoryKv ??= new Map());
  const clone = <T>(v: unknown) => (v === undefined ? null : (JSON.parse(JSON.stringify(v)) as T));
  const hash = (key: string) => (data.get(key) ?? {}) as Record<string, unknown>;

  return {
    async get<T>(key: string) {
      return clone<T>(data.get(key));
    },
    async set(key, value) {
      data.set(key, clone(value));
    },
    async hget<T>(key: string, field: string) {
      return clone<T>(hash(key)[field]);
    },
    async hset(key, fields) {
      data.set(key, { ...hash(key), ...(clone(fields) as object) });
    },
    async hgetall<T>(key: string) {
      return data.has(key) ? clone<Record<string, T>>(hash(key)) : null;
    },
    async hdel(key, ...fields) {
      const h = { ...hash(key) };
      fields.forEach(f => delete h[f]);
      data.set(key, h);
    },
    async expire() {},
  };
}

function createKv(): Kv {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (url && token) return new Redis({ url, token }) as unknown as Kv;
  console.warn('[redis] No Upstash credentials found; using in-memory store.');
  return createMemoryKv();
}

let kv: Kv | undefined;
export const getKv = () => (kv ??= createKv());
