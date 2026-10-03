import { describe, expect, it } from 'vitest';
import { rankPlayers, startRace, submitAnswer, topPlayers, viewFor, type RaceGame, type RaceState } from './race';

const game: RaceGame = {
  id: 't',
  baseMs: 5000,
  questions: [
    { prompt: 'a', options: ['a1', 'a2', 'a3', 'a4'], correctIndex: 0 },
    { prompt: 'b', options: ['b1', 'b2', 'b3', 'b4'], correctIndex: 1 },
    { prompt: 'c', options: ['c1', 'c2', 'c3', 'c4'], correctIndex: 2 },
  ],
};

/** Display index of the right / a wrong option, as the player would see it. */
const display = (state: RaceState, correct: boolean) => {
  const q = game.questions[state.stage - 1];
  const options = viewFor(game, state, 0).question!.options;
  const right = options.indexOf(q.options[q.correctIndex]);
  return correct ? right : (right + 1) % options.length;
};

describe('submitAnswer', () => {
  it('scores remaining ms for a correct answer and carries them forward', () => {
    const start = startRace(0, 1);
    const { state, result } = submitAnswer(game, start, display(start, true), 1800);
    expect(result).toEqual({ correct: true, gained: 3200 });
    expect(state).toMatchObject({ stage: 2, points: 3200, carryMs: 3200, stageStartedAt: 1800 });
    expect(viewFor(game, state, 1800).remainingMs).toBe(8200); // 5000 + 3200
  });

  it('gives 0 points and a fresh budget for a wrong answer', () => {
    const start = startRace(0, 1);
    const { state, result } = submitAnswer(game, start, display(start, false), 1000);
    expect(result).toEqual({ correct: false, gained: 0 });
    expect(state).toMatchObject({ stage: 2, points: 0, carryMs: 0 });
    expect(viewFor(game, state, 1000).remainingMs).toBe(5000);
  });

  it('treats a timeout (null) and a late correct answer as wrong', () => {
    const start = startRace(0, 1);
    expect(submitAnswer(game, start, null, 5000).result.correct).toBe(false);
    expect(submitAnswer(game, start, display(start, true), 5001).result).toEqual({ correct: false, gained: 0 });
  });

  it('finishes after the last question without moving past it', () => {
    let state = startRace(0, 1);
    for (let i = 0; i < 3; i++) state = submitAnswer(game, state, display(state, true), (i + 1) * 100).state;
    expect(state).toMatchObject({ stage: 3, finished: true });
    expect(viewFor(game, state, 400).question).toBeNull();
  });

  it('never exposes the correct answer in the view', () => {
    expect(JSON.stringify(viewFor(game, startRace(0, 1), 0))).not.toContain('correctIndex');
  });
});

describe('option shuffling', () => {
  it('keeps every option, is stable per seed, and maps display answers back correctly', () => {
    for (let seed = 0; seed < 50; seed++) {
      const state = startRace(0, seed);
      const first = viewFor(game, state, 0).question!.options;
      expect([...first].sort()).toEqual(['a1', 'a2', 'a3', 'a4']);
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
    state: { stage, points, carryMs: 0, stageStartedAt: 0, finished: false, seed: 0 },
  });
  const players = [p('a', 10, 2, 3), p('b', 10, 3, 2), p('c', 50, 1, 1), p('d', 10, 3, 1)];

  it('sorts by points, then stage, then join time', () => {
    expect(rankPlayers(players).map(r => r.id)).toEqual(['c', 'd', 'b', 'a']);
  });

  it('caps the top list', () => {
    expect(topPlayers(players, 3).map(r => r.id)).toEqual(['c', 'd', 'b']);
  });
});
