import type { Player } from '@/lib/session/types';

/**
 * Shared engine for "race against the clock" games: multiple-choice questions grouped in
 * difficulty tiers and a fixed time budget per question (set by its tier).
 * Everyone plays all easy questions, then medium, then hard; the order inside each tier and
 * the order of the options are shuffled per player (stable for a given seed) on the server,
 * so the client only ever sees display order and never the correct answer.
 */
export const TIERS = ['easy', 'medium', 'hard'] as const;
export type Tier = (typeof TIERS)[number];

export interface Question {
  tier: Tier;
  prompt: string;
  options: string[];
  correctIndex: number; // index into `options` in authored order
}

export interface RaceGame {
  id: string;
  tierMs: Record<Tier, number>; // base time per question for each tier
  questions: Question[];
}

export interface RaceState {
  stage: number; // 1-based index of the current question
  points: number;
  stageStartedAt: number;
  finished: boolean;
  seed: number; // drives this player's option order
}

/** What a player may see: never includes the correct answer. */
export interface RaceView {
  stage: number;
  total: number;
  points: number;
  finished: boolean;
  remainingMs: number;
  question: { prompt: string; options: string[]; tier: Tier } | null;
  lastResult?: { correct: boolean; gained: number };
}

export interface LeaderRow {
  id: string;
  name: string;
  stage: number;
  points: number;
  finished: boolean;
}

export const startRace = (now: number, seed = Math.floor(Math.random() * 2 ** 32)): RaceState => ({
  stage: 1,
  points: 0,
  stageStartedAt: now,
  finished: false,
  seed,
});

// mulberry32: tiny seeded PRNG so a reload shows the same order.
function random(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(items: T[], next: () => number): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** questionOrder[stage - 1] = question index: tiers in order, shuffled within each tier per player. */
function questionOrder(game: RaceGame, seed: number): number[] {
  const next = random((seed ?? 0) + 104729);
  return TIERS.flatMap(tier =>
    shuffled(
      game.questions.flatMap((q, i) => (q.tier === tier ? [i] : [])),
      next,
    ),
  );
}

export const currentQuestion = (game: RaceGame, state: RaceState): Question =>
  game.questions[questionOrder(game, state.seed)[state.stage - 1]];

/** order[displayIndex] = authored option index for the player's current stage. */
function optionOrder(game: RaceGame, state: RaceState): number[] {
  const options = currentQuestion(game, state).options.map((_, i) => i);
  return shuffled(options, random((state.seed ?? 0) + state.stage * 7919));
}

const remainingMs = (game: RaceGame, state: RaceState, now: number) =>
  state.stageStartedAt + game.tierMs[currentQuestion(game, state).tier] - now;

/**
 * `answer` is the index the player saw (display order), or null for no answer.
 * Correct and in time: points = ms left on this question. Wrong, late or no answer: 0 points.
 * Every question starts with its own full budget (no carry-over).
 */
export function submitAnswer(
  game: RaceGame,
  state: RaceState,
  answer: number | null,
  now: number,
): { state: RaceState; result: { correct: boolean; gained: number } } {
  const left = remainingMs(game, state, now);
  const chosen = answer === null ? undefined : optionOrder(game, state)[answer];
  const correct = left > 0 && chosen === currentQuestion(game, state).correctIndex;
  const gained = correct ? left : 0;
  const finished = state.stage >= game.questions.length;

  return {
    result: { correct, gained },
    state: {
      ...state,
      stage: finished ? state.stage : state.stage + 1,
      points: state.points + gained,
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
  const q = state.finished ? null : currentQuestion(game, state);
  return {
    stage: state.stage,
    total: game.questions.length,
    points: state.points,
    finished: state.finished,
    remainingMs: state.finished ? 0 : Math.max(0, remainingMs(game, state, now)),
    question: q ? { prompt: q.prompt, options: optionOrder(game, state).map(i => q.options[i]), tier: q.tier } : null,
    lastResult,
  };
}

/** Finalises a player's race early (host ended the game): keeps stage and points. */
export const endRace = (state: RaceState): RaceState => ({ ...state, finished: true });

/** Everyone ranked by points, then furthest stage, then earliest to join. */
export function rankPlayers(players: Player<RaceState>[]): LeaderRow[] {
  return players
    .filter((p): p is Player<RaceState> & { state: RaceState } => p.state !== null)
    .sort((a, b) => b.state.points - a.state.points || b.state.stage - a.state.stage || a.joinedAt - b.joinedAt)
    .map(p => ({ id: p.id, name: p.name, stage: p.state.stage, points: p.state.points, finished: p.state.finished }));
}

export const topPlayers = (players: Player<RaceState>[], n: number) => rankPlayers(players).slice(0, n);
