import { NextResponse } from 'next/server';
import { getGame } from '@/lib/games/registry';
import { viewFor, type RaceState, type RaceView } from '@/lib/games/race';
import { fail, handle, loadSession, type CodeContext } from '@/lib/session/http';
import { getPlayer } from '@/lib/session/store';
import type { SessionStatus } from '@/lib/session/types';

export const dynamic = 'force-dynamic';

export interface MeResponse {
  status: SessionStatus;
  name: string;
  title: string;
  race: RaceView | null; // null until the host starts the game
}

export const GET = handle(async (req, ctx: CodeContext) => {
  const session = await loadSession(ctx);
  const playerId = new URL(req.url).searchParams.get('playerId') ?? '';
  const player = await getPlayer<RaceState>(session.code, playerId);
  if (!player) return fail(404, 'Player not found');

  const game = getGame(session.gameId);
  const body: MeResponse = {
    status: session.status,
    name: player.name,
    title: game.title,
    race: player.state ? viewFor(game, player.state, Date.now()) : null,
  };
  return NextResponse.json(body);
});
