import { NextResponse } from 'next/server';
import { getSession, SessionError } from './store';
import type { Session } from './types';

export const fail = (status: number, code: string) => NextResponse.json({ error: code }, { status });

export type CodeContext = { params: Promise<{ code: string }> };

/** Wraps a route handler: maps SessionError to its HTTP status and bad JSON to 400. */
export function handle<C>(fn: (req: Request, ctx: C) => Promise<Response>) {
  return async (req: Request, ctx: C) => {
    try {
      return await fn(req, ctx);
    } catch (e) {
      if (e instanceof SessionError) return fail(e.status, e.message);
      if (e instanceof SyntaxError) return fail(400, 'invalidJson');
      throw e;
    }
  };
}

export async function loadSession(ctx: CodeContext): Promise<Session> {
  const { code } = await ctx.params;
  const session = await getSession(code);
  if (!session) throw new SessionError('lobbyNotFound', 404);
  return session;
}

export async function loadHostSession(req: Request, ctx: CodeContext): Promise<Session> {
  const session = await loadSession(ctx);
  if (req.headers.get('x-host-token') !== session.hostToken) throw new SessionError('notHost', 403);
  return session;
}
