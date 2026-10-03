'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Leaderboard from './Leaderboard';
import { api, hostTokenKey, storage } from '@/lib/client/api';
import { usePoll } from '@/lib/client/usePoll';
import type { LeaderRow } from '@/lib/games/race';
import type { SessionView } from '@/lib/session/types';

export default function HostScreen({ code }: { code: string }) {
  const [hostToken, setHostToken] = useState<string | null | undefined>(undefined);
  const [error, setError] = useState('');
  useEffect(() => setHostToken(storage.get(hostTokenKey(code))), [code]);

  const { data: view, error: pollError, refresh } = usePoll<SessionView<LeaderRow>>(`/api/sessions/${code}`, 1000, !!hostToken);

  if (hostToken === undefined) return null;
  if (!hostToken) return <Card>This browser did not create lobby {code}.</Card>;
  if (pollError?.status === 404) return <Card>Lobby {code} no longer exists.</Card>;
  if (!view) return null;

  async function act(path: string, method: string) {
    setError('');
    try {
      await api(`/api/sessions/${code}${path}`, { method, body: method === 'POST' ? {} : undefined, hostToken: hostToken! });
      refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const playing = view.status === 'playing';

  return (
    <div className="flex w-full max-w-3xl flex-col gap-5">
      <Card className="text-center">
        <p className="m-0 text-sm font-medium text-slate-500">{view.title} · join at this site with code</p>
        <p className="m-0 text-7xl font-extrabold tracking-widest text-indigo-600">{code}</p>
      </Card>

      {error && <p className="m-0 rounded-lg bg-red-50 p-3 text-red-600">{error}</p>}

      {playing ? (
        <Card>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="m-0 text-xl font-bold">Leaderboard · top 10</h2>
            <span className="text-sm text-slate-500">
              {view.finishedCount}/{view.players.length} finished
            </span>
          </div>
          <Leaderboard rows={view.leaderboard} onRemove={row => act(`/players/${row.id}`, 'DELETE')} />
        </Card>
      ) : (
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="m-0 text-xl font-bold">Players ({view.players.length})</h2>
            <Button disabled={view.players.length === 0} onClick={() => act('/start', 'POST')}>
              Start game
            </Button>
          </div>
          {view.players.length === 0 && <p className="text-slate-500">Waiting for students to join…</p>}
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {view.players.map(p => (
              <li key={p.id} className="flex items-center gap-2 rounded-full bg-slate-100 py-1 pl-4 pr-1 text-lg">
                {p.name}
                <button
                  aria-label={`Remove ${p.name}`}
                  onClick={() => act(`/players/${p.id}`, 'DELETE')}
                  className="h-7 w-7 cursor-pointer rounded-full border-0 bg-slate-200 text-slate-600 hover:bg-red-100 hover:text-red-600"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
