'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { api, hostTokenKey, storage } from '@/lib/client/api';
import { HOSTABLE_GAMES } from '@/lib/games/catalog';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { MessageKey } from '@/lib/i18n/messages';

export default function HostPage() {
  const router = useRouter();
  const { t, tError } = useI18n();
  const [error, setError] = useState('');

  async function create(gameId: string) {
    try {
      const { code, hostToken } = await api<{ code: string; hostToken: string }>('/api/sessions', { body: { gameId } });
      storage.set(hostTokenKey(code), hostToken);
      router.push(`/host/${code}`);
    } catch (e) {
      setError(tError((e as Error).message));
    }
  }

  return (
    <Card className="w-full max-w-sm text-center">
      <h1 className="m-0 mb-1 text-3xl font-extrabold">🎓 {t('host.title')}</h1>
      <p className="m-0 mb-5 text-violet-400">{t('host.subtitle')}</p>
      <div className="flex flex-col gap-3">
        {HOSTABLE_GAMES.map(game => (
          <Button key={game.id} onClick={() => create(game.id)}>
            {game.icon} {t(`game.${game.id}` as MessageKey)}
          </Button>
        ))}
      </div>
      {error && <p className="mb-0 mt-4 text-sm font-bold text-rose-600">{error}</p>}
    </Card>
  );
}
