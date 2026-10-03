import { getKv } from '@/lib/redis';
import type { Player, Session } from './types';

const TTL_SECONDS = 60 * 60 * 3;
const MAX_NAME_LENGTH = 24;

const sessionKey = (code: string) => `session:${code}`;
const playersKey = (code: string) => `session:${code}:players`;

export class SessionError extends Error {
  // `message` is a stable error code; the client translates it.
  constructor(
    code: string,
    public status: number,
  ) {
    super(code);
  }
}

export async function createSession(gameId: string): Promise<Session> {
  const kv = getKv();
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = String(Math.floor(1000 + Math.random() * 9000));
    if (await kv.get(sessionKey(code))) continue;
    const session: Session = {
      code,
      gameId,
      status: 'lobby',
      hostToken: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    await kv.set(sessionKey(code), session, { ex: TTL_SECONDS });
    return session;
  }
  throw new SessionError('codeUnavailable', 503);
}

export const getSession = (code: string) => getKv().get<Session>(sessionKey(code));

export async function listPlayers<S>(code: string): Promise<Player<S>[]> {
  const all = await getKv().hgetall<Player<S>>(playersKey(code));
  return all ? Object.values(all) : [];
}

export const getPlayer = <S>(code: string, id: string) => getKv().hget<Player<S>>(playersKey(code), id);

export async function savePlayer<S>(code: string, player: Player<S>) {
  const kv = getKv();
  await kv.hset(playersKey(code), { [player.id]: player });
  await kv.expire(playersKey(code), TTL_SECONDS);
}

export async function addPlayer(session: Session, rawName: string): Promise<Player> {
  const name = rawName.trim().slice(0, MAX_NAME_LENGTH);
  if (!name) throw new SessionError('nameRequired', 400);
  if (session.status !== 'lobby') throw new SessionError('gameStarted', 409);

  const players = await listPlayers(session.code);
  if (players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
    throw new SessionError('nameTaken', 409);
  }

  const player: Player = { id: crypto.randomUUID(), name, joinedAt: Date.now(), state: null };
  await savePlayer(session.code, player);
  return player;
}

export const removePlayer = (code: string, id: string) => getKv().hdel(playersKey(code), id);

/** Moves the lobby to `playing` and gives every player their initial game state. */
export async function startSession(session: Session, makeState: (now: number) => unknown) {
  if (session.status !== 'lobby') throw new SessionError('gameStarted', 409);
  const players = await listPlayers(session.code);
  if (players.length === 0) throw new SessionError('noPlayers', 409);

  const now = Date.now();
  await Promise.all(players.map(p => savePlayer(session.code, { ...p, state: makeState(now) })));
  await getKv().set(sessionKey(session.code), { ...session, status: 'playing' }, { ex: TTL_SECONDS });
}
