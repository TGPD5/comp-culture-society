(() => {
  const STORAGE_KEY = 'wordguessr_state';

  // --- Vector store (populated after vocab.json loads) ---
  let normed   = {};  // word -> Float32Array
  let wordList = [];  // eligible daily targets (length >= 5)
  let target   = '';

  // --- State ---
  let guesses    = []; // { word, similarity, correct, neighbors }
  let guessCount = 0;
  let won        = false;

  // --- DOM refs ---
  const form             = document.getElementById('guess-form');
  const input            = document.getElementById('guess-input');
  const guessCountEl     = document.getElementById('guess-count');
  const resultMsg        = document.getElementById('result-message');
  const guessesTable     = document.getElementById('guesses-table');
  const guessesBody      = document.getElementById('guesses-body');
  const statusBanner     = document.getElementById('status-banner');
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

  function findNeighbors(word, exclude) {
    const qv = normed[word];
    const scores = [];
    for (const w in normed) {
      if (w === word || exclude.has(w)) continue;
      scores.push([w, dot(qv, normed[w])]);
    }
    scores.sort((a, b) => b[1] - a[1]);
    return scores.slice(0, 5).map(([w, s]) => ({ word: w, similarity: Math.round(s * 10000) / 100 }));
  }

  function getDailyTarget() {
    const dayIndex = Math.floor(Date.now() / 86400000) % wordList.length;
    return wordList[dayIndex];
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
      const { word, similarity, correct, neighbors } = sorted[i];
      const color    = warmthColor(similarity);
      const label    = warmthLabel(similarity);
      const barWidth = Math.max(2, similarity);

      const tr = document.createElement('tr');
      if (correct) tr.classList.add('correct-row');
      tr.innerHTML = `
        <td class="col-rank">${i + 1}</td>
        <td class="col-word">${correct ? '⭐ ' : ''}${escHtml(word)}</td>
        <td class="col-sim" style="color:${color}">${similarity.toFixed(2)}%</td>
        <td class="col-warmth">
          <div class="warmth-bar" title="${label}">
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
  function todayKey() { return new Date().toISOString().slice(0, 10); }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayKey(), guesses, guessCount, won }));
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.date !== todayKey()) return;
      guesses    = data.guesses    || [];
      guessCount = data.guessCount || 0;
      won        = data.won        || false;
    } catch (_) {}
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

    const similarity = cosineSim(word);
    const correct    = word === target;
    const exclude    = new Set([word, ...guesses.map(g => g.word)]);
    const neighbors  = correct ? [] : findNeighbors(word, exclude);

    guesses.unshift({ word, similarity, correct, neighbors });
    saveState();
    renderGuesses();

    if (correct) {
      won = true;
      saveState();
      winMessage.textContent = `The word was "${word}". You found it in ${guessCount} guess${guessCount !== 1 ? 'es' : ''}!`;
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

  surrenderBtn.addEventListener('click', () => { if (!won) surrenderDialog.showModal(); });

  confirmSurrender.addEventListener('click', () => {
    surrenderDialog.close();
    won = true;
    showMsg(`The word was "${target}". Better luck tomorrow!`, 'not-found');
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
    loadState();
    try {
      await loadVocab();
    } catch (_) {
      return;
    }
    renderGuesses();
    if (won) {
      input.disabled = true;
      form.querySelector('button[type=submit]').disabled = true;
      surrenderBtn.disabled = true;
      showMsg("You already solved today's puzzle! Come back tomorrow.", '');
    } else {
      input.focus();
    }
  }

  init();
})();
