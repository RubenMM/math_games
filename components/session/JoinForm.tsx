'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { api, playerIdKey, storage } from '@/lib/client/api';

export default function JoinForm() {
  const router = useRouter();
  const [code, setCode] = useState(useSearchParams().get('code') ?? '');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function join(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { playerId } = await api<{ playerId: string }>(`/api/sessions/${code.trim()}/join`, { body: { name } });
      storage.set(playerIdKey(code.trim()), playerId);
      router.push(`/play/${code.trim()}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <Card className="w-full max-w-sm text-center">
      <h1 className="m-0 mb-1 text-2xl font-bold">Join a game</h1>
      <p className="m-0 mb-5 text-slate-500">Enter the code on the teacher&apos;s screen.</p>
      <form onSubmit={join} className="flex flex-col gap-4">
        <Input label="Game code" inputMode="numeric" maxLength={4} value={code} onChange={e => setCode(e.target.value)} />
        <Input label="Your name" maxLength={24} autoComplete="off" value={name} onChange={e => setName(e.target.value)} />
        {error && <p className="m-0 text-sm text-red-600">{error}</p>}
        <Button disabled={busy || code.trim().length !== 4 || !name.trim()}>Join</Button>
      </form>
    </Card>
  );
}
