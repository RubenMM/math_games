import { NextResponse } from 'next/server';
import { topPlayers, type LeaderRow, type RaceState } from '@/lib/games/race';
import { handle, loadSession, type CodeContext } from '@/lib/session/http';
import { listPlayers } from '@/lib/session/store';
import type { SessionView } from '@/lib/session/types';

export const dynamic = 'force-dynamic';

export const GET = handle(async (_req, ctx: CodeContext) => {
  const session = await loadSession(ctx);
  const players = await listPlayers<RaceState>(session.code);
  const view: SessionView<LeaderRow> = {
    code: session.code,
    gameId: session.gameId,
    status: session.status,
    players: players.map(({ id, name }) => ({ id, name })),
    leaderboard: topPlayers(players, 10),
    finishedCount: players.filter(p => p.state?.finished).length,
  };
  return NextResponse.json(view);
});
