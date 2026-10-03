export type SessionStatus = 'lobby' | 'playing' | 'finished';

export interface Session {
  code: string;
  gameId: string;
  status: SessionStatus;
  hostToken: string;
  createdAt: number;
}

/** `state` is owned by the game; it is null while the lobby is open. */
export interface Player<S = unknown> {
  id: string;
  name: string;
  joinedAt: number;
  state: S | null;
}

/** Public view of a session (no host token, no per-player state). */
export interface SessionView<Row = unknown> {
  code: string;
  gameId: string;
  status: SessionStatus;
  players: { id: string; name: string }[];
  leaderboard: Row[];
  finishedCount: number;
}
