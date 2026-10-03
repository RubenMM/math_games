import { NextResponse } from 'next/server';
import { endRace } from '@/lib/games/race';
import { handle, loadHostSession, type CodeContext } from '@/lib/session/http';
import { endSession } from '@/lib/session/store';

export const POST = handle(async (req, ctx: CodeContext) => {
  await endSession(await loadHostSession(req, ctx), endRace);
  return NextResponse.json({ ok: true });
});
