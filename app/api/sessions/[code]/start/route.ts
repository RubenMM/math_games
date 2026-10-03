import { NextResponse } from 'next/server';
import { startRace } from '@/lib/games/race';
import { handle, loadHostSession, type CodeContext } from '@/lib/session/http';
import { startSession } from '@/lib/session/store';

export const POST = handle(async (req, ctx: CodeContext) => {
  await startSession(await loadHostSession(req, ctx), startRace);
  return NextResponse.json({ ok: true });
});
