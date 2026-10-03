import { NextResponse } from 'next/server';
import { getGame } from '@/lib/games/registry';
import { fail, handle } from '@/lib/session/http';
import { createSession } from '@/lib/session/store';

export const POST = handle(async req => {
  const { gameId } = await req.json();
  if (!getGame(gameId)) return fail(400, 'Unknown game');
  const { code, hostToken } = await createSession(gameId);
  return NextResponse.json({ code, hostToken });
});
