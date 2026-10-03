# Math Games

A Next.js (App Router, TypeScript) site with math games for students.
Currently includes the Radicals Memory Game: flip cards to pair each radical
expression with its simplified form.

## Run locally

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

Requires Node.js 20 or newer.

## How to play

1. Enter your name, then pick a game from the grid (tiles stay disabled until
   a name is entered).
2. Flip two cards at a time. If a question matches its answer, the pair stays
   revealed; otherwise both cards flip back.
3. Match all pairs to win. Your best score (fewest steps) is saved per player
   name in the browser's local storage.

## Project structure

- `app/` — layout, global styles (`globals.css`) and the home page
- `components/Home.tsx` — name entry and game selection grid (add new games to
  the `GAMES` list)
- `components/MemoryGame.tsx` — the memory game
- `lib/decks.ts` — the question/answer pairs; edit this to change the game's
  content

## Live games (Factorization)

Teachers host a lobby at `/host`; students join at `/join` with the 4-digit code.
The teacher presses **Start**, everyone races through 20 questions in three tiers — 10 easy (20 s each), 5 medium (40 s),
5 hard (60 s). Everyone plays easy → medium → hard, with the order inside each tier shuffled per
player. Leftover time carries over to the next question; points = ms remaining, and the
host screen shows a live top-10 leaderboard and, once everyone finishes (or on demand),
a podium. Students scan a QR code on the host screen to join, see their final rank, and
get answer options shuffled per player. The whole site is available in English and Spanish
(EN/ES toggle; defaults to the browser language). Teachers can remove players, and can **End game** at any time (unfinished players keep their
current score and see their rank). Names are checked against an English + Spanish profanity
filter (`lib/session/names.ts`) when joining.

- `lib/session/` — game-agnostic lobby/players on Redis (`store.ts`) and API helpers
- `lib/games/race.ts` — shared timing/scoring/shuffle/ranking engine (unit-tested: `npm test`)
- `lib/i18n/` — EN/ES dictionaries (`messages.ts`; add keys to both), provider and `useI18n()`.
  API errors are returned as codes and translated on the client
- `lib/games/factorization.ts` — the questions; add another file + `registry.ts`/`catalog.ts`
  entries for a new race game
- `app/api/sessions/**` — API routes; `components/session/` — host/join/play screens

### Configuration

Copy `.env.example` to `.env.local` and fill in an
[Upstash Redis](https://console.upstash.com) REST URL and token (also set them in
Vercel). Without them, a per-process in-memory store is used: fine for local
development, but it will not work on Vercel.
