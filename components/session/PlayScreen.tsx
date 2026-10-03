'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { api, playerIdKey, storage } from '@/lib/client/api';
import { usePoll } from '@/lib/client/usePoll';
import type { RaceView } from '@/lib/games/race';
import type { MeResponse } from '@/app/api/sessions/[code]/me/route';

export default function PlayScreen({ code }: { code: string }) {
  const [playerId, setPlayerId] = useState<string | null | undefined>(undefined);
  useEffect(() => setPlayerId(storage.get(playerIdKey(code))), [code]);

  const [race, setRace] = useState<RaceView | null>(null);
  const receivedAt = useRef(0);
  const [left, setLeft] = useState(0);
  const submitting = useRef(false);

  const applyRace = useCallback((next: RaceView) => {
    receivedAt.current = performance.now();
    submitting.current = false;
    setRace(next);
    setLeft(next.remainingMs);
  }, []);

  // Poll until the host starts the game; afterwards state comes back from each answer.
  const { data: me, error } = usePoll<MeResponse>(`/api/sessions/${code}/me?playerId=${playerId}`, 1000, !!playerId && !race);
  useEffect(() => {
    if (me?.race && !race) applyRace(me.race);
  }, [me, race, applyRace]);

  const submit = useCallback(
    async (optionIndex: number | null) => {
      if (!race || submitting.current) return;
      submitting.current = true;
      try {
        applyRace(await api<RaceView>(`/api/sessions/${code}/answer`, { body: { playerId, stage: race.stage, optionIndex } }));
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

  if (playerId === undefined) return null;
  if (!playerId || error?.status === 404) {
    return (
      <Card className="text-center">
        <p className="mt-0">You are not in this game (or the teacher removed you).</p>
        <Link href={`/join?code=${code}`}>Join again</Link>
      </Card>
    );
  }
  if (!me) return null;

  if (!race) {
    return (
      <Card className="text-center">
        <h1 className="m-0 text-2xl font-bold">You&apos;re in, {me.name}!</h1>
        <p className="mb-0 text-slate-500">Waiting for the teacher to start {me.title}…</p>
      </Card>
    );
  }

  if (race.finished) {
    return (
      <Card className="text-center">
        <h1 className="m-0 text-3xl font-bold">🎉 Finished!</h1>
        <p className="my-3 text-5xl font-extrabold text-indigo-600 tabular-nums">{race.points.toLocaleString()}</p>
        <p className="m-0 text-slate-500">points · watch the big screen for the results</p>
      </Card>
    );
  }

  const budget = race.remainingMs;
  const pct = budget > 0 ? Math.min(100, (left / budget) * 100) : 0;

  return (
    <Card className="w-full max-w-xl">
      <div className="mb-4 flex justify-between text-sm font-semibold text-slate-500">
        <span>
          Stage {race.stage}/{race.total}
        </span>
        <span className="tabular-nums">{race.points.toLocaleString()} pts</span>
      </div>
      <div className="mb-6 h-3 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full ${pct < 30 ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="m-0 mb-1 text-center text-sm text-slate-500">{race.instruction} · {(left / 1000).toFixed(1)}s</p>
      <p className="mb-6 mt-0 text-center text-4xl font-bold">{race.question!.prompt}</p>
      <div className="flex flex-col gap-3">
        {race.question!.options.map((option, i) => (
          <Button key={option} variant="secondary" className="text-xl" onClick={() => submit(i)}>
            {option}
          </Button>
        ))}
      </div>
      {race.lastResult && (
        <p className={`mb-0 mt-4 text-center font-semibold ${race.lastResult.correct ? 'text-emerald-600' : 'text-red-500'}`}>
          {race.lastResult.correct ? `Correct! +${race.lastResult.gained}` : 'Not quite — next one!'}
        </p>
      )}
    </Card>
  );
}
