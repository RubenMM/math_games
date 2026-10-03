import { NextResponse } from 'next/server';
import { getGame } from '@/lib/games/registry';
import { submitAnswer, viewFor, type RaceState } from '@/lib/games/race';
import { fail, handle, loadSession, type CodeContext } from '@/lib/session/http';
import { getPlayer, savePlayer } from '@/lib/session/store';

/** `stage` is the question being answered; a stale or duplicate submit is ignored. */
export const POST = handle(async (req, ctx: CodeContext) => {
  const session = await loadSession(ctx);
  const { playerId, stage, optionIndex } = await req.json();
  const player = await getPlayer<RaceState>(session.code, String(playerId));
  if (!player) return fail(404, 'playerNotFound');
  if (!player.state) return fail(409, 'notStarted');

  const game = getGame(session.gameId);
  const now = Date.now();
  if (player.state.finished || player.state.stage !== stage) {
    return NextResponse.json(viewFor(game, player.state, now));
  }

  const answer = Number.isInteger(optionIndex) ? optionIndex : null;
  const { state, result } = submitAnswer(game, player.state, answer, now);
  await savePlayer(session.code, { ...player, state });
  return NextResponse.json(viewFor(game, state, now, result));
});
