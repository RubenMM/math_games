const HIGH_SCORE_KEY = 'memoryGameHighScore';
const MISMATCH_DELAY_MS = 900;

let currentPlayer = '';
let points = 0;
let steps = 0;
let flippedCards = [];
let isChecking = false;
let matchedPairIds = new Set();
let totalPairs = 0;

const GAMES = [
  { id: 'radicals-memory', name: 'Radicals Memory Game', icon: '🧠', start: initGame },
];

const nameModal = document.getElementById('name-modal');
const nameInput = document.getElementById('player-name-input');
const gameGrid = document.getElementById('game-grid');

const winModal = document.getElementById('win-modal');
const winPlayerLine = document.getElementById('win-player-line');
const winStepsLine = document.getElementById('win-steps-line');
const winHighscoreLine = document.getElementById('win-highscore-line');
const playAgainBtn = document.getElementById('play-again-btn');

const gameContainer = document.getElementById('game-container');
const board = document.getElementById('board');
const hudPlayer = document.getElementById('hud-player');
const hudPoints = document.getElementById('hud-points');
const hudSteps = document.getElementById('hud-steps');
const hudBest = document.getElementById('hud-best');

function buildDeck(config) {
  const cards = [];
  config.forEach((pair, pairId) => {
    cards.push({ id: `${pairId}-q`, pairId, type: 'question', text: pair.question });
    cards.push({ id: `${pairId}-a`, pairId, type: 'answer', text: pair.answer });
  });
  return cards;
}

function shuffle(array) {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getHighScores() {
  try {
    return JSON.parse(localStorage.getItem(HIGH_SCORE_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function getPlayerBest(name) {
  const scores = getHighScores();
  return scores[name];
}

function updateHighScore(name, finalSteps) {
  const scores = getHighScores();
  const current = scores[name];
  const isNewBest = current === undefined || finalSteps < current;
  if (isNewBest) {
    scores[name] = finalSteps;
    localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(scores));
  }
  return isNewBest;
}

function updateHud() {
  hudPlayer.textContent = currentPlayer;
  hudPoints.textContent = points;
  hudSteps.textContent = steps;
  const best = getPlayerBest(currentPlayer);
  hudBest.textContent = best === undefined ? '-' : best;
}

function renderBoard(cards) {
  const columns = Math.ceil(Math.sqrt(cards.length));
  board.style.setProperty('--cols', columns);

  board.innerHTML = '';
  cards.forEach(card => {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    cardEl.dataset.id = card.id;
    cardEl.dataset.pairId = card.pairId;
    cardEl.dataset.type = card.type;

    cardEl.innerHTML = `
      <div class="card-inner">
        <div class="card-front">?</div>
        <div class="card-back">${card.text}</div>
      </div>
    `;

    cardEl.addEventListener('click', () => onCardClick(cardEl));
    board.appendChild(cardEl);
  });
}

function onCardClick(cardEl) {
  if (isChecking) return;
  if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;

  cardEl.classList.add('flipped');
  flippedCards.push(cardEl);
  steps++;
  updateHud();

  if (flippedCards.length < 2) return;

  isChecking = true;
  const [first, second] = flippedCards;
  const samePair = first.dataset.pairId === second.dataset.pairId;
  const differentType = first.dataset.type !== second.dataset.type;

  if (samePair && differentType) {
    matchedPairIds.add(first.dataset.pairId);
    first.classList.add('matched');
    second.classList.add('matched');
    points++;
    updateHud();
    flippedCards = [];
    isChecking = false;

    if (matchedPairIds.size === totalPairs) {
      handleWin();
    }
  } else {
    setTimeout(() => {
      first.classList.remove('flipped');
      second.classList.remove('flipped');
      flippedCards = [];
      isChecking = false;
    }, MISMATCH_DELAY_MS);
  }
}

function handleWin() {
  const isNewBest = updateHighScore(currentPlayer, steps);
  const best = getPlayerBest(currentPlayer);

  winPlayerLine.textContent = `Great job, ${currentPlayer}!`;
  winStepsLine.textContent = `You finished in ${steps} steps with ${points} matches.`;
  winHighscoreLine.textContent = isNewBest
    ? `New personal best: ${best} steps!`
    : `Your best is ${best} steps. Try to beat it next time!`;

  updateHud();
  winModal.classList.remove('hidden');
}

function initGame() {
  points = 0;
  steps = 0;
  flippedCards = [];
  isChecking = false;
  matchedPairIds = new Set();
  totalPairs = DECK_CONFIG.length;

  const deck = shuffle(buildDeck(DECK_CONFIG));
  renderBoard(deck);
  updateHud();

  gameContainer.classList.remove('hidden');
  winModal.classList.add('hidden');
}

function updateGameGridState() {
  const enabled = nameInput.value.trim().length > 0;
  gameGrid.querySelectorAll('.game-card').forEach(btn => {
    btn.disabled = !enabled;
  });
}

function renderGameGrid() {
  gameGrid.innerHTML = '';
  GAMES.forEach(game => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'game-card';
    btn.innerHTML = `
      <span class="game-icon">${game.icon}</span>
      <span class="game-name">${game.name}</span>
    `;
    btn.addEventListener('click', () => {
      const name = nameInput.value.trim();
      if (!name) {
        nameInput.focus();
        return;
      }
      currentPlayer = name;
      nameModal.classList.add('hidden');
      game.start();
    });
    gameGrid.appendChild(btn);
  });
  updateGameGridState();
}

nameInput.addEventListener('input', updateGameGridState);

renderGameGrid();

playAgainBtn.addEventListener('click', () => {
  winModal.classList.add('hidden');
  initGame();
});
