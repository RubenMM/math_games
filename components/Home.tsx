'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { MessageKey } from '@/lib/i18n/messages';
import MemoryGame from './MemoryGame';

type Game = {
  id: string;
  icon: string;
  Component: React.ComponentType<{ player: string }>;
};

const GAMES: Game[] = [
  { id: 'radicals-memory', icon: '🧠', Component: MemoryGame },
];

export default function Home() {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [player, setPlayer] = useState('');
  const [gameId, setGameId] = useState<string | null>(null);

  const active = GAMES.find(g => g.id === gameId);
  if (active && player) {
    return <active.Component player={player} />;
  }

  const enabled = name.trim().length > 0;

  return (
    <div className="modal-overlay">
      <div className="modal modal-wide">
        <h1>{t('home.title')}</h1>
        <p>{t('home.subtitle')}</p>
        <label htmlFor="player-name-input">{t('home.nameLabel')}</label>
        <input
          type="text"
          id="player-name-input"
          placeholder={t('home.namePlaceholder')}
          maxLength={24}
          autoComplete="off"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <div className="game-grid">
          {GAMES.map(game => (
            <button
              key={game.id}
              type="button"
              className="game-card"
              disabled={!enabled}
              onClick={() => {
                setPlayer(name.trim());
                setGameId(game.id);
              }}
            >
              <span className="game-icon">{game.icon}</span>
              <span className="game-name">{t(`game.${game.id}` as MessageKey)}</span>
            </button>
          ))}
        </div>
        <p className="mb-0 mt-5 text-sm">
          <Link href="/join">{t('home.joinLive')}</Link> · <Link href="/host">{t('home.host')}</Link>
        </p>
      </div>
    </div>
  );
}
