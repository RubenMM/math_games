'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import Avatar from '@/components/ui/Avatar';
import Card from '@/components/ui/Card';
import { api, playerIdKey, storage } from '@/lib/client/api';
import { celebrate } from '@/lib/client/confetti';
import { usePoll } from '@/lib/client/usePoll';
import type { RaceView } from '@/lib/games/race';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { MessageKey } from '@/lib/i18n/messages';
import type { MeResponse } from '@/app/api/sessions/[code]/me/route';

// Kahoot-style: each answer slot has its own colour and shape.
const ANSWER_STYLES = [
  { color: 'bg-rose-500 border-rose-800 hover:bg-rose-400', shape: '▲' },
  { color: 'bg-sky-500 border-sky-800 hover:bg-sky-400', shape: '◆' },
  { color: 'bg-amber-400 border-amber-700 hover:bg-amber-300', shape: '●' },
  { color: 'bg-emerald-500 border-emerald-800 hover:bg-emerald-400', shape: '■' },
];

export default function PlayScreen({ code }: { code: string }) {
  const { t } = useI18n();
  const [playerId, setPlayerId] = useState<string | null | undefined>(undefined);
  useEffect(() => setPlayerId(storage.get(playerIdKey(code))), [code]);

  const [race, setRace] = useState<RaceView | null>(null);
  const receivedAt = useRef(0);
  const [left, setLeft] = useState(0);
  const submitting = useRef(false);
  const [streak, setStreak] = useState(0);

  const applyRace = useCallback((next: RaceView) => {
    receivedAt.current = performance.now();
    submitting.current = false;
    setRace(next);
    setLeft(next.remainingMs);
  }, []);

  // Poll while waiting for the host to start, and again after finishing (to keep the rank fresh).
  // Mid-game, state comes back from each answer instead.
  const { data: me, error } = usePoll<MeResponse>(
    `/api/sessions/${code}/me?playerId=${playerId}`,
    1000,
    !!playerId && (!race || race.finished),
  );
  useEffect(() => {
    if (me?.race && !race) applyRace(me.race);
  }, [me, race, applyRace]);

  const submit = useCallback(
    async (optionIndex: number | null) => {
      if (!race || submitting.current) return;
      submitting.current = true;
      try {
        const next = await api<RaceView>(`/api/sessions/${code}/answer`, { body: { playerId, stage: race.stage, optionIndex } });
        if (next.lastResult) setStreak(s => (next.lastResult!.correct ? s + 1 : 0));
        applyRace(next);
      } catch {
        submitting.current = false;
      }
    },
    [race, code, playerId, applyRace],
  );

  // Countdown driven by the server-provided remaining time; times out as a wrong answer.
  useEffect(() => {
    if (!race?.question) return;
    const timer = setInterval(() => {
      const remaining = Math.max(0, race.remainingMs - (performance.now() - receivedAt.current));
      setLeft(remaining);
      if (remaining === 0) submit(null);
    }, 50);
    return () => clearInterval(timer);
  }, [race, submit]);

  const finished = !!race?.finished;
  useEffect(() => {
    if (finished) celebrate();
  }, [finished]);

  if (playerId === undefined) return null;
  if (!playerId || error?.status === 404) {
    return (
      <Card className="text-center">
        <p className="mt-0">{t('play.notInGame')}</p>
        <Link href={`/join?code=${code}`}>{t('play.joinAgain')}</Link>
      </Card>
    );
  }
  if (!me) return null;

  if (!race) {
    return (
      <Card className="text-center">
        <Avatar name={me.name} className="inline-block animate-[wiggle_1.2s_ease-in-out_infinite] text-7xl" />
        <h1 className="m-0 text-3xl font-extrabold">{t('play.youreIn', { name: me.name })}</h1>
        <p className="mb-0 animate-[pulse-fast_1.5s_ease-in-out_infinite] text-violet-500">{t('play.waitingStart', { game: t(`game.${me.gameId}` as MessageKey) })}</p>
      </Card>
    );
  }

  if (race.finished) {
    const standing = me.standing;
    return (
      <Card className="text-center">
        <h1 className="m-0 text-4xl font-extrabold">🎉 {t('play.finished')}</h1>
        <p className="my-3 bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-6xl font-extrabold text-transparent tabular-nums">{race.points.toLocaleString()}</p>
        <p className="m-0 text-violet-400">{t('play.pointsWatch')}</p>
        {standing && (
          <div className="mt-5 animate-[pop_0.5s_ease-out_0.3s_backwards] rounded-2xl bg-violet-100 p-4">
            <p className="m-0 text-3xl font-extrabold text-violet-700">
              {['🥇', '🥈', '🥉'][standing.rank - 1] ?? '🏅'} {t('play.rank', { rank: standing.rank, total: standing.total })}
            </p>
            <p className="mb-0 mt-1 text-sm font-bold text-violet-400">
              {standing.stillPlaying > 0 ? t('play.stillPlaying', { count: standing.stillPlaying }) : t('play.allDone')}
            </p>
          </div>
        )}
      </Card>
    );
  }

  const budget = race.remainingMs;
  const pct = budget > 0 ? Math.min(100, (left / budget) * 100) : 0;
  const urgent = pct < 25;
  const bar = pct > 50 ? 'bg-emerald-400' : pct > 25 ? 'bg-amber-400' : 'bg-rose-500';
  const wrong = race.lastResult && !race.lastResult.correct;

  return (
    <Card key={race.stage} className={`w-full max-w-xl ${wrong ? 'animate-[shake_0.4s_ease-out]' : ''}`}>
      <div className="mb-4 flex items-center justify-between text-sm font-extrabold text-violet-400">
        <span className="flex items-center gap-2 whitespace-nowrap">
          <Avatar name={me.name} className="text-3xl" />
          {t('play.stage', { stage: race.stage, total: race.total })}
        </span>
        {streak >= 2 && (
          <span key={streak} className="animate-[pop_0.3s_ease-out] rounded-full bg-orange-100 px-3 py-1 text-base text-orange-600">
            🔥 ×{streak}
          </span>
        )}
        <span className="whitespace-nowrap tabular-nums text-violet-700">⭐ {t('play.pts', { points: race.points.toLocaleString() })}</span>
      </div>
      <div className="mb-2 h-5 overflow-hidden rounded-full bg-violet-100">
        <div
          className={`h-full rounded-full ${bar} ${urgent ? 'animate-[pulse-fast_0.5s_ease-in-out_infinite]' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="m-0 mb-1 text-center text-sm font-bold text-violet-400">
        {t(`instruction.${me.gameId}` as MessageKey)} · <span className={urgent ? 'text-rose-500' : ''}>⏱ {(left / 1000).toFixed(1)}s</span>
      </p>
      <p className="mb-6 mt-0 text-center text-5xl font-extrabold">{race.question!.prompt}</p>
      <div className="flex flex-col gap-3">
        {race.question!.options.map((option, i) => {
          const style = ANSWER_STYLES[i % ANSWER_STYLES.length];
          return (
            <button
              key={option}
              onClick={() => submit(i)}
              className={`flex cursor-pointer items-center gap-4 rounded-2xl border-0 border-b-8 border-solid px-5 py-4 text-left text-2xl font-extrabold text-white shadow transition active:translate-y-1.5 active:border-b-2 ${style.color}`}
            >
              <span className="text-3xl opacity-80">{style.shape}</span>
              {option}
            </button>
          );
        })}
      </div>
      {race.lastResult && (
        <p
          key={race.stage}
          className={`mb-0 mt-4 animate-[pop_0.35s_ease-out] text-center text-xl font-extrabold ${race.lastResult.correct ? 'text-emerald-500' : 'text-rose-500'}`}
        >
          {race.lastResult.correct ? `✅ ${t('play.correct', { gained: race.lastResult.gained.toLocaleString() })}` : `💪 ${t('play.wrong')}`}
        </p>
      )}
    </Card>
  );
}
