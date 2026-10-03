import { NextResponse } from 'next/server';
import { getGame } from '@/lib/games/registry';
import { rankPlayers, viewFor, type RaceState, type RaceView } from '@/lib/games/race';
import { fail, handle, loadSession, type CodeContext } from '@/lib/session/http';
import { getPlayer, listPlayers } from '@/lib/session/store';
import type { SessionStatus } from '@/lib/session/types';

export const dynamic = 'force-dynamic';

export interface MeResponse {
  status: SessionStatus;
  name: string;
  gameId: string;
  race: RaceView | null; // null until the host starts the game
  /** Only once the player has finished; provisional while others are still playing. */
  standing: { rank: number; total: number; stillPlaying: number } | null;
}

export const GET = handle(async (req, ctx: CodeContext) => {
  const session = await loadSession(ctx);
  const playerId = new URL(req.url).searchParams.get('playerId') ?? '';
  const player = await getPlayer<RaceState>(session.code, playerId);
  if (!player) return fail(404, 'playerNotFound');

  const game = getGame(session.gameId);
  let standing: MeResponse['standing'] = null;
  if (player.state?.finished) {
    const ranked = rankPlayers(await listPlayers<RaceState>(session.code));
    standing = {
      rank: ranked.findIndex(r => r.id === player.id) + 1,
      total: ranked.length,
      stillPlaying: ranked.filter(r => !r.finished).length,
    };
  }

  const body: MeResponse = {
    status: session.status,
    name: player.name,
    gameId: session.gameId,
    race: player.state ? viewFor(game, player.state, Date.now()) : null,
    standing,
  };
  return NextResponse.json(body);
});
