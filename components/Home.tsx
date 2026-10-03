'use client';

import { useState } from 'react';
import MemoryGame from './MemoryGame';

type Game = {
  id: string;
  name: string;
  icon: string;
  Component: React.ComponentType<{ player: string }>;
};

const GAMES: Game[] = [
  { id: 'radicals-memory', name: 'Radicals Memory Game', icon: '🧠', Component: MemoryGame },
];

export default function Home() {
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
        <h1>Math Games</h1>
        <p>Enter your name, then pick a game!</p>
        <label htmlFor="player-name-input">Enter your name</label>
        <input
          type="text"
          id="player-name-input"
          placeholder="Your name"
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
              <span className="game-name">{game.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
