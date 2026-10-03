import { describe, expect, it } from 'vitest';
import { factorization } from './factorization';

describe('factorization game', () => {
  const count = (tier: string) => factorization.questions.filter(q => q.tier === tier).length;

  it('has 10 easy, 5 medium and 5 hard questions', () => {
    expect([count('easy'), count('medium'), count('hard')]).toEqual([10, 5, 5]);
  });

  it('gives 20s / 40s / 60s per tier', () => {
    expect(factorization.tierMs).toEqual({ easy: 20_000, medium: 40_000, hard: 60_000 });
  });

  it('has valid correct indexes and no duplicate options', () => {
    for (const q of factorization.questions) {
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(q.options.length);
      expect(new Set(q.options).size).toBe(q.options.length);
    }
  });
});
