import type { Question, RaceGame, Tier } from './race';

const tier =
  (t: Tier) =>
  (prompt: string, options: string[], correctIndex: number): Question => ({ tier: t, prompt, options, correctIndex });

const easy = tier('easy');
const medium = tier('medium');
const hard = tier('hard');

// 10 easy, 5 medium, 5 hard. Partly factored forms are wrong answers.
export const factorization: RaceGame = {
  id: 'factorization',
  tierMs: { easy: 20_000, medium: 40_000, hard: 60_000 },
  questions: [
    easy('3x + 6', ['3(x + 2)', '3x(x + 2)', 'x(3 + 6)'], 0),
    easy('x² + 5x', ['x(x + 5)', 'x + 5', '5(x + 1)'], 0),
    easy('2x² + x', ['2x + 1', 'x(2x + 1)', '2(x² + 1)'], 1),
    easy('4x² − 8x', ['4x(x − 2)', '4(x² − 2x)', '2x(2x − 4)'], 0),
    easy('x² − 9', ['(x − 3)²', '(x − 3)(x + 3)', '(x − 9)(x + 1)'], 1),
    easy('x² + 5x + 6', ['(x + 1)(x + 6)', '(x + 2)(x + 3)', '(x + 5)(x + 1)'], 1),
    easy('x² − 5x + 6', ['(x − 2)(x − 3)', '(x + 2)(x + 3)', '(x − 1)(x − 6)'], 0),
    easy('x² + x − 12', ['(x + 6)(x − 2)', '(x − 4)(x + 3)', '(x + 4)(x − 3)'], 2),
    easy('x² − 2x − 15', ['(x − 5)(x + 3)', '(x + 5)(x − 3)', '(x − 15)(x + 1)'], 0),
    easy('2x² − 18', ['2(x − 3)(x + 3)', '(2x − 6)(x + 3)', '2(x − 9)(x + 1)'], 0),

    medium('3x² + 12x', ['3(x² + 4x)', '3x(x + 4)', 'x(3x + 12)'], 1),
    medium('x² + 6x + 9', ['(x + 3)²', '(x + 9)(x − 1)', '(x + 3)(x − 3)'], 0),
    medium('4x² − 25', ['(2x − 5)²', '(4x − 5)(x + 5)', '(2x − 5)(2x + 5)'], 2),
    medium('2x² + 7x + 3', ['(2x + 1)(x + 3)', '(2x + 3)(x + 1)', '(2x − 1)(x − 3)'], 0),
    medium('3x² − 10x + 8', ['(3x − 4)(x − 2)', '(3x − 2)(x − 4)', '(3x + 4)(x + 2)'], 0),

    hard('6x² + x − 2', ['(3x − 2)(2x + 1)', '(3x + 2)(2x − 1)', '(6x − 1)(x + 2)'], 1),
    hard('x³ − 4x', ['x(x − 2)(x + 2)', 'x(x − 4)', '(x − 2)(x + 2)'], 0),
    hard('2x³ + 8x² + 6x', ['2x(x + 1)(x + 3)', '2x(x + 2)(x + 4)', '2x(x² + 4x + 3)'], 0),
    hard('x⁴ − 16', ['(x² − 4)(x² + 4)', '(x − 2)(x + 2)(x² + 4)', '(x − 4)(x + 4)(x² + 1)'], 1),
    hard('6x² − 7x − 3', ['(3x − 1)(2x + 3)', '(3x + 1)(2x − 3)', '(6x + 1)(x − 3)'], 1),
  ],
};
