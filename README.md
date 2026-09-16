# Memory Match: Math Edition

A browser-based memory matching game. Flip cards to pair each math question
with its correct answer — multiplication, division, squares, square roots,
and simple arithmetic.

## How to play

1. Open [index.html](index.html) in a browser (or serve the folder with any
   static file server).
2. Enter your name, then pick a game from the grid (game tiles stay disabled
   until a name is entered).
3. Flip two cards at a time. If a question matches its answer, the pair stays
   revealed; otherwise both cards flip back.
4. Match all pairs to win. Your best score (fewest steps) is saved per player
   name in the browser's local storage.

## Project structure

- [index.html](index.html) — page structure and modals
- [style.css](style.css) — layout and card-flip styling
- [game.js](game.js) — game logic (deck building, matching, scoring)
- [deck-config.js](deck-config.js) — the question/answer pairs; edit this to
  change the game's content
