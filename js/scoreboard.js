(function () {
  const TEACHER_PASSWORD = 'C0rdTe0cher1';

  const authScreen = document.getElementById('auth-screen');
  const scoreboardScreen = document.getElementById('scoreboard-screen');
  const authBtn = document.getElementById('auth-btn');
  const passwordInput = document.getElementById('teacher-password');
  const authError = document.getElementById('auth-error');
  const clearBtn = document.getElementById('clear-scores-btn');

  const foodList = document.getElementById('food-scores');
  const monumentList = document.getElementById('monument-scores');
  const combinedList = document.getElementById('combined-scores');

  let foodScores = [];
  let monumentScores = [];

  function authenticate() {
    if (passwordInput.value === TEACHER_PASSWORD) {
      authScreen.classList.add('hidden');
      scoreboardScreen.classList.remove('hidden');
      listenToScores();
    } else {
      authError.classList.remove('hidden');
    }
  }

  authBtn.addEventListener('click', authenticate);
  passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') authenticate();
  });

  clearBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all scores?')) {
      db.ref('scores').remove();
    }
  });

  function snapshotToSorted(snap) {
    const data = snap.val();
    if (!data) return [];
    return Object.values(data).sort((a, b) => a.time - b.time);
  }

  function listenToScores() {
    db.ref('scores/food').on('value', (snap) => {
      foodScores = snapshotToSorted(snap);
      renderList(foodList, foodScores);
      updateCombined();
    });

    db.ref('scores/monument').on('value', (snap) => {
      monumentScores = snapshotToSorted(snap);
      renderList(monumentList, monumentScores);
      updateCombined();
    });
  }

  function updateCombined() {
    const all = [...foodScores, ...monumentScores].sort((a, b) => a.time - b.time);
    renderList(combinedList, all);
  }

  function renderList(listEl, scores) {
    listEl.innerHTML = '';
    if (scores.length === 0) {
      const li = document.createElement('li');
      li.className = 'empty-msg';
      li.textContent = 'No scores yet';
      listEl.appendChild(li);
      return;
    }
    scores.forEach((entry) => {
      const li = document.createElement('li');

      const nameSpan = document.createElement('span');
      nameSpan.className = 'score-name';
      nameSpan.textContent = entry.name;

      const timeSpan = document.createElement('span');
      timeSpan.className = 'score-time';
      timeSpan.textContent = formatTime(entry.time);

      li.appendChild(nameSpan);
      li.appendChild(timeSpan);
      listEl.appendChild(li);
    });
  }

  function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = (seconds % 60).toFixed(1);
    return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
  }
})();
