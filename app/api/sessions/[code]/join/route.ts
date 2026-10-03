import { NextResponse } from 'next/server';
import { handle, loadSession, type CodeContext } from '@/lib/session/http';
import { addPlayer } from '@/lib/session/store';

export const POST = handle(async (req, ctx: CodeContext) => {
  const session = await loadSession(ctx);
  const { name } = await req.json();
  const player = await addPlayer(session, String(name ?? ''));
  return NextResponse.json({ playerId: player.id });
});
