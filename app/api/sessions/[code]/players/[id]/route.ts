import { NextResponse } from 'next/server';
import { handle, loadHostSession, type CodeContext } from '@/lib/session/http';
import { removePlayer } from '@/lib/session/store';

export const DELETE = handle(async (req, ctx: CodeContext & { params: Promise<{ code: string; id: string }> }) => {
  const session = await loadHostSession(req, ctx);
  const { id } = await ctx.params;
  await removePlayer(session.code, id);
  return NextResponse.json({ ok: true });
});
