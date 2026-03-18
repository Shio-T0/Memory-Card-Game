(function () {
  const params = new URLSearchParams(window.location.search);
  const theme = params.get('theme');
  if (!theme || !['food', 'monument'].includes(theme)) {
    window.location.href = 'index.html';
    return;
  }

  const playerName = sessionStorage.getItem('playerName');
  if (!playerName) {
    window.location.href = 'index.html';
    return;
  }

  const themeTitle = document.getElementById('theme-title');
  themeTitle.textContent = theme === 'food' ? 'Foods' : 'Monuments';

  const board = document.getElementById('game-board');
  const matchedNamesEl = document.getElementById('matched-names');
  const timerEl = document.getElementById('timer');
  const gameOverEl = document.getElementById('game-over');
  const finalTimeEl = document.getElementById('final-time');
  const penaltyInfoEl = document.getElementById('penalty-info');

  let textsData = null;
  let cards = [];
  let flippedCards = [];
  let matchedPairs = 0;
  let locked = false;
  let timerInterval = null;
  let startTime = null;
  let penaltyMs = 0;
  const TOTAL_PAIRS = 6;
  const PENALTY_SECONDS = 3;

  // Load texts_names.json then init
  fetch('texts_names.json')
    .then(r => r.json())
    .then(data => {
      textsData = data[theme];
      initGame();
    });

  // Detect actual image file extension by trying common formats
  function findImageSrc(id, theme) {
    const exts = ['jpg', 'jpeg', 'png', 'webp'];
    return new Promise((resolve) => {
      let tried = 0;
      for (const ext of exts) {
        const img = new Image();
        const src = `images/${id}-${theme}.${ext}`;
        img.onload = () => resolve(src);
        img.onerror = () => { tried++; if (tried === exts.length) resolve(null); };
        img.src = src;
      }
    });
  }

  async function initGame() {
    // Detect image extensions for all pairs
    const imageSrcs = await Promise.all(
      Array.from({ length: TOTAL_PAIRS }, (_, i) => findImageSrc(i + 1, theme))
    );

    // Build card data: 6 image cards + 6 text cards
    const cardData = [];
    for (let i = 1; i <= TOTAL_PAIRS; i++) {
      const item = textsData[String(i)];
      cardData.push({ id: i, type: 'image', src: imageSrcs[i - 1], name: item.name });
      cardData.push({ id: i, type: 'text', text: item.text, name: item.name });
    }

    // Shuffle
    for (let i = cardData.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardData[i], cardData[j]] = [cardData[j], cardData[i]];
    }

    // Render
    cardData.forEach((data, index) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.dataset.pairId = data.id;
      card.dataset.cardType = data.type;
      card.dataset.index = index;

      const inner = document.createElement('div');
      inner.className = 'card-inner';

      const front = document.createElement('div');
      front.className = 'card-face card-front';
      front.textContent = '?';

      const back = document.createElement('div');
      back.className = 'card-face card-back';

      if (data.type === 'image') {
        const img = document.createElement('img');
        img.src = data.src;
        img.alt = data.name;
        img.draggable = false;
        // Fallback for missing images: show a placeholder
        img.onerror = function () {
          this.style.display = 'none';
          const placeholder = document.createElement('div');
          placeholder.className = 'card-text';
          placeholder.textContent = `[Image: ${data.name}]`;
          back.appendChild(placeholder);
        };
        back.appendChild(img);
      } else {
        const textDiv = document.createElement('div');
        textDiv.className = 'card-text';
        textDiv.textContent = data.text;
        back.appendChild(textDiv);
      }

      inner.appendChild(front);
      inner.appendChild(back);
      card.appendChild(inner);

      card.addEventListener('click', () => onCardClick(card));
      board.appendChild(card);
      cards.push({ el: card, ...data });
    });

    startTimer();
  }

  function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 100);
  }

  function updateTimer() {
    const elapsed = Date.now() - startTime + penaltyMs;
    timerEl.textContent = formatTime(elapsed);
  }

  function formatTime(ms) {
    const totalSec = Math.floor(ms / 1000);
    const min = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const sec = String(totalSec % 60).padStart(2, '0');
    return `${min}:${sec}`;
  }

  function formatTimeDetailed(ms) {
    const totalSec = ms / 1000;
    const min = Math.floor(totalSec / 60);
    const sec = (totalSec % 60).toFixed(1);
    return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
  }

  function onCardClick(cardEl) {
    if (locked) return;
    if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;
    // Don't allow flipping two cards of same type that are already flipped
    if (flippedCards.length === 1 && flippedCards[0] === cardEl) return;

    cardEl.classList.add('flipped');
    flippedCards.push(cardEl);

    if (flippedCards.length === 2) {
      locked = true;
      checkMatch();
    }
  }

  function checkMatch() {
    const [a, b] = flippedCards;
    const idA = a.dataset.pairId;
    const idB = b.dataset.pairId;
    const typeA = a.dataset.cardType;
    const typeB = b.dataset.cardType;

    // Match requires same pair id AND different types (one image, one text)
    if (idA === idB && typeA !== typeB) {
      // Correct match
      a.classList.add('matched');
      b.classList.add('matched');
      matchedPairs++;

      // Show name with checkmark
      const item = textsData[String(idA)];
      const tag = document.createElement('span');
      tag.className = 'matched-tag';
      tag.textContent = `✓ ${item.name}`;
      matchedNamesEl.appendChild(tag);

      flippedCards = [];
      locked = false;

      if (matchedPairs === TOTAL_PAIRS) {
        endGame();
      }
    } else {
      // Wrong match — add penalty
      penaltyMs += PENALTY_SECONDS * 1000;
      a.classList.add('wrong');
      b.classList.add('wrong');

      setTimeout(() => {
        a.classList.remove('flipped', 'wrong');
        b.classList.remove('flipped', 'wrong');
        flippedCards = [];
        locked = false;
      }, 800);
    }
  }

  function endGame() {
    clearInterval(timerInterval);
    const totalMs = Date.now() - startTime + penaltyMs;
    const totalSeconds = parseFloat((totalMs / 1000).toFixed(1));
    const penaltyCount = penaltyMs / (PENALTY_SECONDS * 1000);

    timerEl.textContent = formatTime(totalMs);
    finalTimeEl.textContent = `Your time: ${formatTimeDetailed(totalMs)}`;
    penaltyInfoEl.textContent = penaltyCount > 0
      ? `(includes ${penaltyCount} × ${PENALTY_SECONDS}s penalty)`
      : 'No penalties — perfect game!';
    gameOverEl.classList.remove('hidden');

    // Save to Firebase
    saveScore(playerName, theme, totalSeconds);
  }

  function saveScore(name, theme, timeSeconds) {
    const entry = {
      name: name,
      time: timeSeconds,
      timestamp: firebase.database.ServerValue.TIMESTAMP
    };
    db.ref(`scores/${theme}`).push(entry);
  }
})();
