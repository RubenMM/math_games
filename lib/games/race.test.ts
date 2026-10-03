import { describe, expect, it } from 'vitest';
import { startRace, submitAnswer, topPlayers, viewFor, type RaceGame } from './race';

const game: RaceGame = {
  id: 't',
  title: 'T',
  instruction: 'i',
  baseMs: 5000,
  questions: [
    { prompt: 'a', options: ['x', 'y'], correctIndex: 0 },
    { prompt: 'b', options: ['x', 'y'], correctIndex: 1 },
    { prompt: 'c', options: ['x', 'y'], correctIndex: 0 },
  ],
};

describe('submitAnswer', () => {
  it('scores remaining ms for a correct answer and carries them forward', () => {
    const { state, result } = submitAnswer(game, startRace(0), 0, 1800);
    expect(result).toEqual({ correct: true, gained: 3200 });
    expect(state).toMatchObject({ stage: 2, points: 3200, carryMs: 3200, stageStartedAt: 1800 });
    // next question budget = 5000 + 3200
    expect(viewFor(game, state, 1800).remainingMs).toBe(8200);
  });

  it('gives 0 points and a fresh budget for a wrong answer', () => {
    const { state, result } = submitAnswer(game, startRace(0), 1, 1000);
    expect(result).toEqual({ correct: false, gained: 0 });
    expect(state).toMatchObject({ stage: 2, points: 0, carryMs: 0 });
    expect(viewFor(game, state, 1000).remainingMs).toBe(5000);
  });

  it('treats a timeout (null) and a late correct answer as wrong', () => {
    expect(submitAnswer(game, startRace(0), null, 5000).result.correct).toBe(false);
    expect(submitAnswer(game, startRace(0), 0, 5001).result).toEqual({ correct: false, gained: 0 });
  });

  it('finishes after the last question without moving past it', () => {
    let state = startRace(0);
    for (const [i, a] of [0, 1, 0].entries()) state = submitAnswer(game, state, a, (i + 1) * 100).state;
    expect(state).toMatchObject({ stage: 3, finished: true });
    expect(viewFor(game, state, 400).question).toBeNull();
  });

  it('never exposes the correct answer in the view', () => {
    expect(JSON.stringify(viewFor(game, startRace(0), 0))).not.toContain('correctIndex');
  });
});

describe('topPlayers', () => {
  const p = (id: string, points: number, stage: number, joinedAt: number) => ({
    id,
    name: id,
    joinedAt,
    state: { stage, points, carryMs: 0, stageStartedAt: 0, finished: false },
  });

  it('sorts by points, then stage, then join time and caps the list', () => {
    const rows = topPlayers([p('a', 10, 2, 3), p('b', 10, 3, 2), p('c', 50, 1, 1), p('d', 10, 3, 1)], 3);
    expect(rows.map(r => r.id)).toEqual(['c', 'd', 'b']);
  });
});
