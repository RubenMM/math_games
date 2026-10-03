'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { api, hostTokenKey, storage } from '@/lib/client/api';
import { HOSTABLE_GAMES } from '@/lib/games/catalog';

export default function HostPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  async function create(gameId: string) {
    try {
      const { code, hostToken } = await api<{ code: string; hostToken: string }>('/api/sessions', { body: { gameId } });
      storage.set(hostTokenKey(code), hostToken);
      router.push(`/host/${code}`);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <Card className="w-full max-w-sm text-center">
      <h1 className="m-0 mb-1 text-2xl font-bold">Host a game</h1>
      <p className="m-0 mb-5 text-slate-500">Pick a game to open a lobby for your class.</p>
      <div className="flex flex-col gap-3">
        {HOSTABLE_GAMES.map(game => (
          <Button key={game.id} onClick={() => create(game.id)}>
            {game.icon} {game.title}
          </Button>
        ))}
      </div>
      {error && <p className="mb-0 mt-4 text-sm text-red-600">{error}</p>}
    </Card>
  );
}
