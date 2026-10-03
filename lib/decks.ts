// Deck configuration: question/answer pairs used to build the memory grid.
// The board's column count adapts automatically to the number of pairs here.
// Edit this array to change the game's content.
export type Pair = { question: string; answer: string };

export const DECK_CONFIG: Pair[] = [
  { "question": "√18", "answer": "3√2" },
  { "question": "√50", "answer": "5√2" },
  { "question": "√75", "answer": "5√3" },
  { "question": "√48", "answer": "4√3" },
  { "question": "√(20x²)", "answer": "2x√5" },
  { "question": "√(45x⁴)", "answer": "3x²√5" },
  { "question": "√12 + √48", "answer": "6√3" },
  { "question": "√50 − √32", "answer": "√2" },
  { "question": "√44 + √99", "answer": "5√11" },
  { "question": "√45 − √20", "answer": "√5" },
  { "question": "√(8x²) + √(18x²)", "answer": "5x√2" },
  { "question": "√(50x²) − √(32x²)", "answer": "x√2" },
  { "question": "√63 + √28", "answer": "5√7" },
  { "question": "√2 × √8", "answer": "4" },
  { "question": "√3 × √15", "answer": "3√5" },
  { "question": "√5 × √20", "answer": "10" },
  { "question": "√6 × √10", "answer": "2√15" },
  { "question": "√(2x) × √(8x)", "answer": "4x" },
  { "question": "√(3x) × √(6x)", "answer": "3x√2" },
  { "question": "√7 × √21", "answer": "7√3" }
];
