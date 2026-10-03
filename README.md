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
