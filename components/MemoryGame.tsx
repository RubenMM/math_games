'use client';

import { useEffect, useRef, useState } from 'react';
import { DECK_CONFIG, type Pair } from '@/lib/decks';
import { useI18n } from '@/lib/i18n/I18nProvider';

const HIGH_SCORE_KEY = 'memoryGameHighScore';
const MISMATCH_DELAY_MS = 900;

type Card = { id: string; pairId: number; type: 'question' | 'answer'; text: string };

function buildDeck(config: Pair[]): Card[] {
  const cards: Card[] = [];
  config.forEach((pair, pairId) => {
    cards.push({ id: `${pairId}-q`, pairId, type: 'question', text: pair.question });
    cards.push({ id: `${pairId}-a`, pairId, type: 'answer', text: pair.answer });
  });
  return cards;
}

function shuffle<T>(array: T[]): T[] {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getHighScores(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(HIGH_SCORE_KEY) ?? '') || {};
  } catch {
    return {};
  }
}

function saveHighScore(name: string, steps: number): boolean {
  const scores = getHighScores();
  const current = scores[name];
  const isNewBest = current === undefined || steps < current;
  if (isNewBest) {
    scores[name] = steps;
    try {
      localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(scores));
    } catch {}
  }
  return isNewBest;
}

export default function MemoryGame({ player }: { player: string }) {
  const { t } = useI18n();
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [steps, setSteps] = useState(0);
  const [best, setBest] = useState<number | undefined>();
  const [won, setWon] = useState<{ isNewBest: boolean } | null>(null);
  const checking = useRef(false);

  const points = matched.size;
  const totalPairs = DECK_CONFIG.length;

  function start() {
    checking.current = false;
    setCards(shuffle(buildDeck(DECK_CONFIG)));
    setFlipped([]);
    setMatched(new Set());
    setSteps(0);
    setWon(null);
    setBest(getHighScores()[player]);
  }

  // Shuffle on the client only, to avoid a server/client hydration mismatch.
  useEffect(start, [player]);

  function onCardClick(card: Card) {
    if (checking.current) return;
    if (flipped.includes(card.id) || matched.has(card.pairId)) return;

    const nextFlipped = [...flipped, card.id];
    const nextSteps = steps + 1;
    setFlipped(nextFlipped);
    setSteps(nextSteps);

    if (nextFlipped.length < 2) return;

    checking.current = true;
    const [first, second] = nextFlipped.map(id => cards.find(c => c.id === id)!);

    if (first.pairId === second.pairId && first.type !== second.type) {
      const nextMatched = new Set(matched).add(first.pairId);
      setMatched(nextMatched);
      setFlipped([]);
      checking.current = false;

      if (nextMatched.size === totalPairs) {
        const isNewBest = saveHighScore(player, nextSteps);
        setBest(getHighScores()[player]);
        setWon({ isNewBest });
      }
    } else {
      setTimeout(() => {
        setFlipped([]);
        checking.current = false;
      }, MISMATCH_DELAY_MS);
    }
  }

  const columns = Math.ceil(Math.sqrt(cards.length));

  return (
    <>
      {won && (
        <div className="modal-overlay">
          <div className="modal">
            <h1>🎉 {t('memory.won')}</h1>
            <p>{t('memory.greatJob', { player })}</p>
            <p>{t('memory.finished', { steps, points })}</p>
            <p>
              {won.isNewBest
                ? t('memory.newBest', { best: best ?? steps })
                : t('memory.yourBest', { best: best ?? steps })}
            </p>
            <button onClick={start}>{t('memory.playAgain')}</button>
          </div>
        </div>
      )}

      <div className="game-container">
        <header className="hud">
          <div className="hud-item">{t('memory.player')}: <span>{player}</span></div>
          <div className="hud-item">{t('memory.points')}: <span>{points}</span></div>
          <div className="hud-item">{t('memory.steps')}: <span>{steps}</span></div>
          <div className="hud-item">{t('memory.best')}: <span>{best ?? '-'}</span></div>
        </header>
        <main className="board" style={{ '--cols': columns } as React.CSSProperties}>
          {cards.map(card => {
            const isMatched = matched.has(card.pairId);
            const isFlipped = flipped.includes(card.id);
            return (
              <div
                key={card.id}
                className={`card${isFlipped ? ' flipped' : ''}${isMatched ? ' matched' : ''}`}
                onClick={() => onCardClick(card)}
              >
                <div className="card-inner">
                  <div className="card-front">?</div>
                  <div className="card-back">{card.text}</div>
                </div>
              </div>
            );
          })}
        </main>
      </div>
    </>
  );
}
