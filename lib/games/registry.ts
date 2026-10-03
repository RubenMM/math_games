import { factorization } from './factorization';
import type { RaceGame } from './race';

// Server-only: contains the correct answers. Client code uses lib/games/catalog.ts.
const games: Record<string, RaceGame> = { [factorization.id]: factorization };

export const getGame = (id: string) => games[id];
