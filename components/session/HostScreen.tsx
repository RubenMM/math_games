'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Leaderboard from './Leaderboard';
import Podium from './Podium';
import { api, hostTokenKey, storage } from '@/lib/client/api';
import { celebrate } from '@/lib/client/confetti';
import { usePoll } from '@/lib/client/usePoll';
import type { LeaderRow } from '@/lib/games/race';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { SessionView } from '@/lib/session/types';

export default function HostScreen({ code }: { code: string }) {
  const { t, tError } = useI18n();
  const [hostToken, setHostToken] = useState<string | null | undefined>(undefined);
  const [origin, setOrigin] = useState('');
  const [error, setError] = useState('');
  const [showPodium, setShowPodium] = useState(false);
  useEffect(() => {
    setHostToken(storage.get(hostTokenKey(code)));
    setOrigin(window.location.origin);
  }, [code]);

  const { data: view, error: pollError, refresh } = usePoll<SessionView<LeaderRow>>(`/api/sessions/${code}`, 1000, !!hostToken);

  const allDone = !!view && view.players.length > 0 && view.finishedCount === view.players.length;
  const ended = view?.status === 'finished';
  const podiumVisible = allDone || ended || showPodium;
  useEffect(() => {
    if (podiumVisible) celebrate();
  }, [podiumVisible]);

  if (hostToken === undefined) return null;
  if (!hostToken) return <Card>{t('host.notHost', { code })}</Card>;
  if (pollError?.status === 404) return <Card>{t('host.gone', { code })}</Card>;
  if (!view) return null;

  async function act(path: string, method: string) {
    setError('');
    try {
      await api(`/api/sessions/${code}${path}`, { method, body: method === 'POST' ? {} : undefined, hostToken: hostToken! });
      refresh();
    } catch (e) {
      setError(tError((e as Error).message));
    }
  }

  const playing = view.status !== 'lobby';
  const joinUrl = `${origin}/join?code=${code}`;

  return (
    <div className="flex w-full max-w-3xl flex-col gap-5">
      {!playing && (
        <Card className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          {origin && (
            <div className="shrink-0 rounded-2xl border-4 border-solid border-violet-200 p-2">
              <QRCodeSVG value={joinUrl} size={160} />
            </div>
          )}
          <div className="flex-1">
            <p className="m-0 text-sm font-bold text-violet-500">
              {t('host.joinHint', { url: `${origin.replace(/^https?:\/\//, '')}/join` })}
            </p>
            <p className="m-0 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500 bg-clip-text text-8xl font-extrabold tracking-widest text-transparent">
              {code}
            </p>
          </div>
        </Card>
      )}

      {error && <p className="m-0 rounded-2xl bg-rose-100 p-3 font-bold text-rose-700">{error}</p>}

      {playing ? (
        <>
          {podiumVisible && (
            <Card>
              <h2 className="m-0 mb-4 text-center text-2xl font-extrabold">🏆 {t('host.podium')}</h2>
              <Podium rows={view.leaderboard} />
            </Card>
          )}
          <Card>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="m-0 text-xl font-extrabold">{t('host.leaderboard')}</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-violet-400">
                  {t('host.finishedCount', { done: view.finishedCount, total: view.players.length })}
                </span>
                {!allDone && !ended && (
                  <Button variant="secondary" className="px-3 py-1.5 text-sm" onClick={() => setShowPodium(v => !v)}>
                    {t(showPodium ? 'host.hidePodium' : 'host.showPodium')}
                  </Button>
                )}
                {!ended && (
                  <Button
                    variant="danger"
                    className="px-3 py-1.5 text-sm"
                    onClick={() => window.confirm(t('host.endConfirm')) && act('/end', 'POST')}
                  >
                    {t('host.end')}
                  </Button>
                )}
              </div>
            </div>
            <Leaderboard rows={view.leaderboard} onRemove={row => act(`/players/${row.id}`, 'DELETE')} />
          </Card>
        </>
      ) : (
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="m-0 text-xl font-extrabold">{t('host.players', { count: view.players.length })}</h2>
            <Button disabled={view.players.length === 0} onClick={() => act('/start', 'POST')}>
              {t('host.start')}
            </Button>
          </div>
          {view.players.length === 0 && <p className="text-violet-400">{t('host.waiting')} ⏳</p>}
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {view.players.map(p => (
              <li
                key={p.id}
                className="flex animate-[pop_0.35s_ease-out] items-center gap-2 rounded-full bg-violet-100 py-1 pl-3 pr-1 text-lg font-bold"
              >
                <Avatar name={p.name} />
                {p.name}
                <button
                  aria-label={t('host.remove', { name: p.name })}
                  onClick={() => act(`/players/${p.id}`, 'DELETE')}
                  className="h-7 w-7 cursor-pointer rounded-full border-0 bg-violet-200 text-violet-600 hover:bg-rose-100 hover:text-rose-600"
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
