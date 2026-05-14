(() => {
  const STORAGE_KEY = 'wordguessr_state';

  // --- Vector store (populated after vocab.json loads) ---
  let normed   = {};  // word -> Float32Array
  let wordList = [];  // eligible daily targets (length >= 5)
  let target   = '';

  // --- State ---
  let guesses       = []; // { word, similarity, rank, correct, neighbors }
  let guessCount    = 0;
  let won           = false;
  let revealedWords = new Set(); // words surfaced as neighbor chips — no hints if guessed

  // --- DOM refs ---
  const form             = document.getElementById('guess-form');
  const input            = document.getElementById('guess-input');
  const guessCountEl     = document.getElementById('guess-count');
  const resultMsg        = document.getElementById('result-message');
  const guessesTable     = document.getElementById('guesses-table');
  const guessesBody      = document.getElementById('guesses-body');
  const statusBanner     = document.getElementById('status-banner');
  const landmarksEl      = document.getElementById('landmarks');
  const lm1El            = document.getElementById('lm-1');
  const lm10El           = document.getElementById('lm-10');
  const lm500El          = document.getElementById('lm-500');
  const newGameBtn       = document.getElementById('new-game-btn');
  const surrenderBtn     = document.getElementById('surrender-btn');
  const surrenderDialog  = document.getElementById('surrender-dialog');
  const confirmSurrender = document.getElementById('confirm-surrender');
  const cancelSurrender  = document.getElementById('cancel-surrender');
  const winDialog        = document.getElementById('win-dialog');
  const winMessage       = document.getElementById('win-message');
  const closeWin         = document.getElementById('close-win');

  // --- Maths helpers ---
  function normalize(arr) {
    let mag = 0;
    for (const x of arr) mag += x * x;
    mag = Math.sqrt(mag);
    if (mag === 0) return new Float32Array(arr.length);
    const out = new Float32Array(arr.length);
    for (let i = 0; i < arr.length; i++) out[i] = arr[i] / mag;
    return out;
  }

  function dot(a, b) {
    let s = 0;
    for (let i = 0; i < a.length; i++) s += a[i] * b[i];
    return s;
  }

  function cosineSim(word) {
    return Math.round(dot(normed[word], normed[target]) * 10000) / 100;
  }

  // How many vocab words are closer to the target than `word` is (1-indexed rank).
  function rankAgainstTarget(word) {
    const guessScore = dot(normed[word], normed[target]);
    let closer = 1; // start at 1 so the top word has rank 1
    for (const w in normed) {
      if (w === word) continue;
      if (dot(normed[w], normed[target]) > guessScore) closer++;
    }
    return closer;
  }

  // Number of neighbor chips to show based on vocab rank.
  // Full hints while far away, tapering to zero once inside top 100.
  function neighborCount(rank) {
    if (rank > 1000) return 5;
    if (rank > 500)  return 4;
    if (rank > 200)  return 3;
    if (rank > 100)  return 2;
    return 0; // top 100 — you're close enough, no more hints
  }

  function findNeighbors(word, exclude, count) {
    if (count === 0) return [];
    const qv = normed[word];
    const scores = [];
    for (const w in normed) {
      if (w === word || exclude.has(w)) continue;
      scores.push([w, dot(qv, normed[w])]);
    }
    scores.sort((a, b) => b[1] - a[1]);
    return scores.slice(0, count).map(([w, s]) => ({ word: w, similarity: Math.round(s * 10000) / 100 }));
  }

  function randomTarget() {
    return wordList[Math.floor(Math.random() * wordList.length)];
  }

  // Return the nth-closest word to the target (1-indexed) and its similarity score.
  function nthNearest(n) {
    const tv = normed[target];
    const scores = [];
    for (const w in normed) {
      if (w === target) continue;
      scores.push([w, dot(tv, normed[w])]);
    }
    scores.sort((a, b) => b[1] - a[1]);
    const [word, sim] = scores[n - 1];
    return { word, score: Math.round(sim * 10000) / 100 };
  }

  function renderLandmarks() {
    const r1   = nthNearest(1);
    const r10  = nthNearest(10);
    const r500 = nthNearest(500);
    lm1El.textContent   = `#1 "${r1.word}": ${r1.score}`;
    lm10El.textContent  = `#10 "${r10.word}": ${r10.score}`;
    lm500El.textContent = `#500 "${r500.word}": ${r500.score}`;
    landmarksEl.classList.remove('hidden');
  }

  // --- Load vocab.json ---
  async function loadVocab() {
    showBanner('Loading word vectors…');
    try {
      const res = await fetch('data/vocab.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.json();
      for (const word in raw) normed[word] = normalize(raw[word]);
      wordList = Object.keys(normed).filter(w => w.length >= 5);
      target = getDailyTarget();
      hideBanner();
      renderLandmarks();
    } catch (err) {
      showBanner(`Failed to load vocab.json: ${err.message}`, true);
      throw err;
    }
  }

  // --- Colour helpers ---
  function warmthColor(sim) {
    if (sim >= 90) return '#e04040';
    if (sim >= 75) return '#e87830';
    if (sim >= 55) return '#f0c040';
    if (sim >= 35) return '#a0cc60';
    if (sim >= 15) return '#6eb5e8';
    return '#4a90d9';
  }

  function warmthLabel(sim) {
    if (sim >= 90) return 'Blazing';
    if (sim >= 75) return 'Hot';
    if (sim >= 55) return 'Warm';
    if (sim >= 35) return 'Tepid';
    if (sim >= 15) return 'Cool';
    return 'Cold';
  }

  function escHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // --- Render ---
  function renderGuesses() {
    guessesBody.innerHTML = '';
    const sorted = [...guesses].sort((a, b) => b.similarity - a.similarity);

    for (let i = 0; i < sorted.length; i++) {
      const { word, similarity, rank, correct, neighbors, wasRevealed } = sorted[i];
      const color    = warmthColor(similarity);
      const label    = warmthLabel(similarity);
      const barWidth = Math.max(2, similarity);
      const rankStr  = correct ? '🎯' : `#${rank.toLocaleString()}`;

      const tr = document.createElement('tr');
      if (correct) tr.classList.add('correct-row');
      tr.innerHTML = `
        <td class="col-rank">${i + 1}</td>
        <td class="col-word">${correct ? '⭐ ' : ''}${escHtml(word)}${wasRevealed ? ' <span class="revealed-badge">hint</span>' : ''}</td>
        <td class="col-sim" style="color:${color}">${similarity.toFixed(2)}</td>
        <td class="col-vocab-rank" style="color:${color}" title="${label}">${rankStr}</td>
        <td class="col-warmth">
          <div class="warmth-bar">
            <div class="warmth-fill" style="width:${barWidth}%;background:${color}"></div>
          </div>
        </td>`;
      guessesBody.appendChild(tr);

      if (!correct && neighbors && neighbors.length > 0) {
        const alreadyGuessed = new Set(guesses.map(g => g.word));
        const chips = neighbors.map(n => {
          const used = alreadyGuessed.has(n.word);
          return `<button class="neighbor-chip${used ? ' used' : ''}" data-word="${escHtml(n.word)}" ${used ? 'disabled' : ''}>${escHtml(n.word)}</button>`;
        }).join('');
        const tr2 = document.createElement('tr');
        tr2.classList.add('neighbor-row');
        tr2.innerHTML = `<td colspan="4"><span class="neighbor-label">nearby:</span>${chips}</td>`;
        guessesBody.appendChild(tr2);
      }
    }

    if (guesses.length > 0) guessesTable.classList.remove('hidden');
    guessCountEl.textContent = `${guessCount} guess${guessCount !== 1 ? 'es' : ''}`;
  }

  guessesBody.addEventListener('click', e => {
    const chip = e.target.closest('.neighbor-chip');
    if (chip && !chip.disabled) { input.value = chip.dataset.word; input.focus(); }
  });

  // --- Banners / messages ---
  function showBanner(text, isError = false) {
    statusBanner.textContent = text;
    statusBanner.classList.toggle('error', isError);
    statusBanner.classList.remove('hidden');
  }
  function hideBanner() { statusBanner.classList.add('hidden'); }

  function showMsg(text, cls) {
    resultMsg.textContent = text;
    resultMsg.className = cls || '';
    resultMsg.classList.remove('hidden');
  }
  function hideMsg() { resultMsg.classList.add('hidden'); }

  // --- Persistence ---
  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      target, guesses, guessCount, won,
      revealedWords: [...revealedWords],
    }));
  }

  // Returns true if a saved game was found and restored.
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data.target || !normed[data.target]) return false;
      target        = data.target;
      guesses       = data.guesses       || [];
      guessCount    = data.guessCount    || 0;
      won           = data.won           || false;
      revealedWords = new Set(data.revealedWords || []);
      return true;
    } catch (_) { return false; }
  }

  function resetState() {
    target        = randomTarget();
    guesses       = [];
    guessCount    = 0;
    won           = false;
    revealedWords = new Set();
  }

  // --- Guess logic (all client-side) ---
  function processGuess(word) {
    if (!normed[word]) {
      const msgs = [
        `Woah ok slow down professor, "${word}" is too uncommon!`,
        `"${word}"? Never heard of it. Try something more everyday.`,
        `Impressive vocabulary, but "${word}" isn't in our word list!`,
        `Our word list doesn't include "${word}". Keep it simple!`,
        `"${word}" — are you reading a dictionary? That one's too rare.`,
      ];
      showMsg(msgs[Math.floor(Math.random() * msgs.length)], 'not-found');
      return;
    }

    if (guesses.some(g => g.word === word)) {
      showMsg(`You already guessed "${word}".`, 'not-found');
      return;
    }

    guessCount++;
    hideMsg();

    const similarity   = cosineSim(word);
    const correct      = word === target;
    const rank         = correct ? 1 : rankAgainstTarget(word);
    const exclude      = new Set([word, ...guesses.map(g => g.word)]);
    // Words that arrived via a neighbor chip get no hints of their own
    const wasRevealed  = revealedWords.has(word);
    const count        = (!correct && !wasRevealed) ? neighborCount(rank) : 0;
    const neighbors    = findNeighbors(word, exclude, count);

    // Register these new chips so guessing them later yields no hints
    for (const n of neighbors) revealedWords.add(n.word);

    guesses.unshift({ word, similarity, rank, correct, neighbors, wasRevealed });
    saveState();
    renderGuesses();

    if (correct) {
      won = true;
      saveState();
      winMessage.textContent = `You found it in ${guessCount} guess${guessCount !== 1 ? 'es' : ''}! Hit New game to play again.`;
      winDialog.showModal();
    }
  }

  // --- Event handlers ---
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (won || !target) return;
    const word = input.value.trim().toLowerCase();
    if (!word) return;
    input.value = '';
    processGuess(word);
  });

  newGameBtn.addEventListener('click', () => {
    resetState();
    saveState();
    renderLandmarks();
    renderGuesses();
    hideMsg();
    input.disabled = false;
    form.querySelector('button[type=submit]').disabled = false;
    surrenderBtn.disabled = false;
    input.focus();
  });

  surrenderBtn.addEventListener('click', () => { if (!won) surrenderDialog.showModal(); });

  confirmSurrender.addEventListener('click', () => {
    surrenderDialog.close();
    won = true;
    showMsg(`The word was "${target}". Hit New game to try again!`, 'not-found');
    surrenderBtn.disabled = true;
    input.disabled = true;
    form.querySelector('button[type=submit]').disabled = true;
  });

  cancelSurrender.addEventListener('click', () => surrenderDialog.close());
  closeWin.addEventListener('click', () => winDialog.close());
  surrenderDialog.addEventListener('click', e => { if (e.target === surrenderDialog) surrenderDialog.close(); });
  winDialog.addEventListener('click', e => { if (e.target === winDialog) winDialog.close(); });

  // --- Init ---
  async function init() {
    try {
      await loadVocab();
    } catch (_) {
      return;
    }
    const restored = loadState();
    if (!restored) resetState();
    saveState();
    renderLandmarks();
    renderGuesses();
    if (won) {
      input.disabled = true;
      form.querySelector('button[type=submit]').disabled = true;
      surrenderBtn.disabled = true;
      showMsg('Game over — hit New game to play again!', '');
    } else {
      input.focus();
    }
  }

  init();
})();
