import { describe, expect, it } from 'vitest';
import {
  currentQuestion,
  rankPlayers,
  startRace,
  submitAnswer,
  topPlayers,
  viewFor,
  type Question,
  type RaceGame,
  type RaceState,
  type Tier,
} from './race';

const q = (tier: Tier, id: string, correctIndex = 0): Question => ({
  tier,
  prompt: id,
  options: [`${id}-0`, `${id}-1`, `${id}-2`, `${id}-3`],
  correctIndex,
});

// Authored out of tier order on purpose: the engine must still serve easy -> medium -> hard.
const game: RaceGame = {
  id: 't',
  tierMs: { easy: 5000, medium: 8000, hard: 12000 },
  questions: [q('hard', 'h1', 1), q('easy', 'e1'), q('medium', 'm1', 2), q('easy', 'e2', 3), q('easy', 'e3'), q('medium', 'm2')],
};

/** Display index of the right / a wrong option, as the player would see it. */
const display = (state: RaceState, correct: boolean) => {
  const question = currentQuestion(game, state);
  const options = viewFor(game, state, 0).question!.options;
  const right = options.indexOf(question.options[question.correctIndex]);
  return correct ? right : (right + 1) % options.length;
};

const playAll = (seed: number) => {
  const prompts: string[] = [];
  let state = startRace(0, seed);
  for (let i = 0; i < game.questions.length; i++) {
    prompts.push(currentQuestion(game, state).prompt);
    state = submitAnswer(game, state, display(state, true), (i + 1) * 100).state;
  }
  return { prompts, state };
};

describe('submitAnswer', () => {
  it('scores the ms left on the question and gives the next one its own full budget', () => {
    const start = startRace(0, 1);
    const { state, result } = submitAnswer(game, start, display(start, true), 1800);
    expect(result).toEqual({ correct: true, gained: 3200 }); // easy budget 5000
    expect(state).toMatchObject({ stage: 2, points: 3200, stageStartedAt: 1800 });
    expect(viewFor(game, state, 1800).remainingMs).toBe(5000); // next easy question: no carry-over
  });

  it('gives 0 points for a wrong answer', () => {
    const start = startRace(0, 1);
    const { state, result } = submitAnswer(game, start, display(start, false), 1000);
    expect(result).toEqual({ correct: false, gained: 0 });
    expect(state).toMatchObject({ stage: 2, points: 0 });
    expect(viewFor(game, state, 1000).remainingMs).toBe(5000);
  });

  it('treats a timeout (null) and a late correct answer as wrong', () => {
    const start = startRace(0, 1);
    expect(submitAnswer(game, start, null, 5000).result.correct).toBe(false);
    expect(submitAnswer(game, start, display(start, true), 5001).result).toEqual({ correct: false, gained: 0 });
  });

  it('finishes after the last question without moving past it', () => {
    const { state } = playAll(1);
    expect(state).toMatchObject({ stage: game.questions.length, finished: true });
    expect(viewFor(game, state, 999).question).toBeNull();
  });

  it('never exposes the correct answer in the view', () => {
    expect(JSON.stringify(viewFor(game, startRace(0, 1), 0))).not.toContain('correctIndex');
  });
});

describe('difficulty tiers', () => {
  it('serves every question once, easy then medium then hard, for any seed', () => {
    for (let seed = 0; seed < 50; seed++) {
      const { prompts } = playAll(seed);
      expect([...prompts].sort()).toEqual(game.questions.map(x => x.prompt).sort());
      expect(prompts.slice(0, 3).every(p => p.startsWith('e'))).toBe(true);
      expect(prompts.slice(3, 5).every(p => p.startsWith('m'))).toBe(true);
      expect(prompts[5]).toBe('h1');
    }
  });

  it('mixes the order inside a tier differently for different players', () => {
    const easyOrders = new Set(Array.from({ length: 30 }, (_, s) => playAll(s).prompts.slice(0, 3).join()));
    expect(easyOrders.size).toBeGreaterThan(2);
  });

  it('keeps a player\'s order stable across calls', () => {
    const s = startRace(0, 7);
    expect(currentQuestion(game, s)).toBe(currentQuestion(game, { ...s }));
  });

  it('uses the time budget of each tier', () => {
    let state = startRace(0, 3);
    const budgets: Record<string, number> = {};
    for (let i = 0; i < game.questions.length; i++) {
      budgets[currentQuestion(game, state).tier] = viewFor(game, state, state.stageStartedAt).remainingMs;
      state = submitAnswer(game, state, display(state, true), 10).state; // right and fast: still no carry-over
    }
    expect(budgets).toEqual({ easy: 5000, medium: 8000, hard: 12000 });
  });

  it('exposes the tier of the current question', () => {
    const { question } = viewFor(game, startRace(0, 1), 0);
    expect(question!.tier).toBe('easy');
  });
});

describe('option shuffling', () => {
  it('keeps every option, is stable per seed, and maps display answers back correctly', () => {
    for (let seed = 0; seed < 50; seed++) {
      const state = startRace(0, seed);
      const first = viewFor(game, state, 0).question!.options;
      expect([...first].sort()).toEqual(currentQuestion(game, state).options.slice().sort());
      expect(viewFor(game, state, 99).question!.options).toEqual(first);
      expect(submitAnswer(game, state, display(state, true), 100).result.correct).toBe(true);
      expect(submitAnswer(game, state, display(state, false), 100).result.correct).toBe(false);
    }
  });

  it('produces different orders for different seeds', () => {
    const orders = new Set(Array.from({ length: 30 }, (_, s) => viewFor(game, startRace(0, s), 0).question!.options.join()));
    expect(orders.size).toBeGreaterThan(5);
  });
});

describe('ranking', () => {
  const p = (id: string, points: number, stage: number, joinedAt: number) => ({
    id,
    name: id,
    joinedAt,
    state: { stage, points, stageStartedAt: 0, finished: false, seed: 0 },
  });
  const players = [p('a', 10, 2, 3), p('b', 10, 3, 2), p('c', 50, 1, 1), p('d', 10, 3, 1)];

  it('sorts by points, then stage, then join time', () => {
    expect(rankPlayers(players).map(r => r.id)).toEqual(['c', 'd', 'b', 'a']);
  });

  it('caps the top list', () => {
    expect(topPlayers(players, 3).map(r => r.id)).toEqual(['c', 'd', 'b']);
  });
});
