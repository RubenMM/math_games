import type { Player } from '@/lib/session/types';

/**
 * Shared engine for "race against the clock" games: a fixed list of multiple-choice
 * questions, a per-question time budget, and carry-over of leftover time.
 */
export interface Question {
  prompt: string;
  options: string[];
  correctIndex: number;
}

export interface RaceGame {
  id: string;
  title: string;
  instruction: string;
  baseMs: number;
  questions: Question[];
}

export interface RaceState {
  stage: number; // 1-based index of the current question
  points: number;
  carryMs: number; // leftover time from the previous (correct) answer
  stageStartedAt: number;
  finished: boolean;
}

/** What a player may see: never includes the correct answer. */
export interface RaceView {
  instruction: string;
  stage: number;
  total: number;
  points: number;
  finished: boolean;
  remainingMs: number;
  question: { prompt: string; options: string[] } | null;
  lastResult?: { correct: boolean; gained: number };
}

export interface LeaderRow {
  id: string;
  name: string;
  stage: number;
  points: number;
  finished: boolean;
}

export const startRace = (now: number): RaceState => ({
  stage: 1,
  points: 0,
  carryMs: 0,
  stageStartedAt: now,
  finished: false,
});

const remainingMs = (game: RaceGame, state: RaceState, now: number) =>
  state.stageStartedAt + game.baseMs + state.carryMs - now;

/**
 * Correct and in time: points = ms left, and those ms carry into the next question.
 * Wrong, late or no answer (null): 0 points and the next question gets a fresh budget.
 */
export function submitAnswer(
  game: RaceGame,
  state: RaceState,
  answer: number | null,
  now: number,
): { state: RaceState; result: { correct: boolean; gained: number } } {
  const left = remainingMs(game, state, now);
  const correct = answer !== null && left > 0 && answer === game.questions[state.stage - 1].correctIndex;
  const gained = correct ? left : 0;
  const finished = state.stage >= game.questions.length;

  return {
    result: { correct, gained },
    state: {
      stage: finished ? state.stage : state.stage + 1,
      points: state.points + gained,
      carryMs: gained,
      stageStartedAt: now,
      finished,
    },
  };
}

export function viewFor(
  game: RaceGame,
  state: RaceState,
  now: number,
  lastResult?: RaceView['lastResult'],
): RaceView {
  const q = game.questions[state.stage - 1];
  return {
    instruction: game.instruction,
    stage: state.stage,
    total: game.questions.length,
    points: state.points,
    finished: state.finished,
    remainingMs: state.finished ? 0 : Math.max(0, remainingMs(game, state, now)),
    question: state.finished ? null : { prompt: q.prompt, options: q.options },
    lastResult,
  };
}

/** Top `n` by points, then furthest stage, then earliest to join. */
export function topPlayers(players: Player<RaceState>[], n: number): LeaderRow[] {
  return players
    .filter((p): p is Player<RaceState> & { state: RaceState } => p.state !== null)
    .sort((a, b) => b.state.points - a.state.points || b.state.stage - a.state.stage || a.joinedAt - b.joinedAt)
    .slice(0, n)
    .map(p => ({ id: p.id, name: p.name, stage: p.state.stage, points: p.state.points, finished: p.state.finished }));
}
