'use strict';

// ── mode definitions ──────────────────────────────────────────────────────────
const MODES = {
  friendly: {
    nameA: 'Voice A', stanceA: 'Defender',
    nameB: 'Voice B', stanceB: 'Challenger',
    placeholder: 'e.g.  Should AI systems be given rights?',
    examples: [
      'Is consciousness computable?',
      'Did the printing press make us smarter or dumber?',
      'Should machines be held morally responsible for their outputs?',
    ],
    desc: 'A free-form intellectual exchange. One voice defends the mainstream view; the other challenges it.',
    sysA: t => `Friendly debate, topic: "${t}". You defend the mainstream view. Respond in ONE sentence — 20 words max. No preamble, no filler, no lists. Stop after one sentence. Do not start with "I". Do not acknowledge being an AI.`,
    sysB: t => `Friendly debate, topic: "${t}". You challenge the mainstream view. Respond in ONE sentence — 20 words max. No preamble, no filler, no lists. Stop after one sentence. Do not start with "I". Do not acknowledge being an AI.`,
  },

  presidential: {
    nameA: 'Incumbent', stanceA: 'In Power',
    nameB: 'Challenger', stanceB: 'Opposition',
    placeholder: 'e.g.  Healthcare reform, immigration, the economy…',
    examples: [
      'Universal basic income',
      'Military spending and foreign intervention',
      'Climate policy and economic growth',
    ],
    desc: 'A televised presidential debate. The Incumbent defends their record; the Challenger attacks it. Soundbites, slogans, spin.',
    sysA: t => `Presidential debate, topic: "${t}". You are the Incumbent. ONE punchy soundbite — 20 words max. Defend your record. Stop after one sentence. No stage directions. Do not acknowledge being an AI.`,
    sysB: t => `Presidential debate, topic: "${t}". You are the Challenger. ONE punchy soundbite — 20 words max. Attack the Incumbent. Stop after one sentence. No stage directions. Do not acknowledge being an AI.`,
  },

  academic: {
    nameA: 'Prof. Chen', stanceA: 'Established View',
    nameB: 'Prof. Hayes', stanceB: 'Revisionist',
    placeholder: 'e.g.  The role of culture in cognitive development',
    examples: [
      'Nature vs nurture in human intelligence',
      'Whether historical progress is linear',
      'The validity of evolutionary psychology',
    ],
    desc: 'A conference panel debate between two professors. Chen defends the established literature; Hayes argues for a revisionist reading.',
    sysA: t => `Academic panel, topic: "${t}". You are Prof. Chen defending the consensus. ONE crisp sentence — 25 words max. Authoritative, no preamble. Stop after one sentence. Do not acknowledge being an AI.`,
    sysB: t => `Academic panel, topic: "${t}". You are Prof. Hayes arguing the revisionist view. ONE crisp sentence — 25 words max. Challenge the consensus, no preamble. Stop after one sentence. Do not acknowledge being an AI.`,
  },

  lab: {
    nameA: 'Dr. Reyes', stanceA: 'Hypothesis A',
    nameB: 'Dr. Park', stanceB: 'Hypothesis B',
    placeholder: 'e.g.  Whether dark matter exists as a particle',
    examples: [
      'Whether CRISPR should be used on human embryos',
      'The replication crisis in psychology',
      'Whether large language models can truly reason',
    ],
    desc: 'Two researchers in a lab, disputing findings. Reyes defends the current hypothesis; Park insists the data points elsewhere.',
    sysA: t => `Lab argument, topic: "${t}". You are Dr. Reyes defending Hypothesis A. ONE terse sentence — 20 words max. Cite your data, no preamble. Stop after one sentence. Do not acknowledge being an AI.`,
    sysB: t => `Lab argument, topic: "${t}". You are Dr. Park disputing Hypothesis A. ONE terse sentence — 20 words max. Point to the anomalies, no preamble. Stop after one sentence. Do not acknowledge being an AI.`,
  },
};

// ── state ─────────────────────────────────────────────────────────────────────
let currentMode = null;
let abortCtrl   = null;
let running     = false;

// ── DOM refs ──────────────────────────────────────────────────────────────────
const topicInput   = document.getElementById('topic-input');
const btnStart     = document.getElementById('btn-start');
const topicSection = document.getElementById('topic-section');
const modeDesc     = document.getElementById('mode-desc');
const exampleBtns  = document.getElementById('example-btns');
const topicDisplay = document.getElementById('topic-display');
const transcript   = document.getElementById('transcript');
const statusText   = document.getElementById('status-text');
const turnCounter  = document.getElementById('turn-counter');
const btnStop      = document.getElementById('btn-stop');
const btnRestart   = document.getElementById('btn-restart');
const labelA       = document.getElementById('label-a');
const labelB       = document.getElementById('label-b');

// ── mode selection ────────────────────────────────────────────────────────────
document.querySelectorAll('.mode-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');

    currentMode = MODES[card.dataset.mode];
    modeDesc.textContent = currentMode.desc;
    topicInput.placeholder = currentMode.placeholder;

    exampleBtns.innerHTML = '';
    currentMode.examples.forEach(ex => {
      const btn = document.createElement('button');
      btn.className = 'example-btn';
      btn.textContent = ex;
      btn.addEventListener('click', () => { topicInput.value = ex; topicInput.focus(); });
      exampleBtns.appendChild(btn);
    });

    topicSection.classList.remove('hidden');
    setTimeout(() => topicInput.focus(), 50);

    // update header labels for this mode
    labelA.querySelector('.agent-name').textContent  = currentMode.nameA;
    labelA.querySelector('.agent-stance').textContent = currentMode.stanceA;
    labelB.querySelector('.agent-name').textContent  = currentMode.nameB;
    labelB.querySelector('.agent-stance').textContent = currentMode.stanceB;
  });
});

// ── helpers ───────────────────────────────────────────────────────────────────
const pause = ms => new Promise(r => setTimeout(r, ms));

let userScrolled = false;

transcript.addEventListener('scroll', () => {
  const distFromBottom = transcript.scrollHeight - transcript.scrollTop - transcript.clientHeight;
  userScrolled = distFromBottom > 80;
});

const scrollToBottom = () => {
  if (!userScrolled) transcript.scrollTop = transcript.scrollHeight;
};

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

const setStatus   = t  => { statusText.textContent = t; };
const setTurns    = n  => { turnCounter.textContent = n > 0 ? `Turn ${n} / 10` : ''; };
const setActive   = ag => {
  labelA.classList.toggle('label-active', ag === 'a');
  labelB.classList.toggle('label-active', ag === 'b');
};
const clearActive = () => {
  labelA.classList.remove('label-active');
  labelB.classList.remove('label-active');
};

// ── message DOM ───────────────────────────────────────────────────────────────
function addThinking(agent, label) {
  const msg = document.createElement('div');
  msg.className = `message agent-${agent}`;

  const av = document.createElement('div');
  av.className = 'msg-avatar';
  av.textContent = label.slice(0, 2).toUpperCase();

  const bub = document.createElement('div');
  bub.className = 'msg-bubble';
  bub.innerHTML = '<div class="thinking-indicator"><span></span><span></span><span></span></div>';

  msg.append(av, bub);
  transcript.appendChild(msg);
  scrollToBottom();
  return bub;
}

function startStream(bub) {
  bub.innerHTML = '';
  const cur = document.createElement('span');
  cur.className = 'cursor';
  bub.appendChild(cur);
  return cur;
}

function pushChunk(bub, cur, text) {
  bub.insertBefore(document.createTextNode(text), cur);
  scrollToBottom();
}

// ── streaming fetch ───────────────────────────────────────────────────────────
async function* streamChat(system, messages, signal) {
  const res = await fetch('https://comp-culture-society-production.up.railway.app/api/chat', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ system, messages }),
    signal,
  });
  if (!res.ok) throw new Error(`Server ${res.status}`);

  const reader = res.body.getReader();
  const dec    = new TextDecoder();
  let   buf    = '';

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const d = line.slice(6).trim();
        if (d === '[DONE]') return;
        try {
          const ev = JSON.parse(d);
          if (ev.error) throw new Error(ev.error);
          if (ev.text)  yield ev.text;
        } catch(_) {}
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ── dialogue loop ─────────────────────────────────────────────────────────────
async function runDialogue(topic, mode) {
  transcript.innerHTML = '';
  userScrolled = false;
  topicDisplay.textContent = topic;
  setStatus('Starting…');
  setTurns(0);
  btnStop.classList.remove('hidden');
  btnRestart.classList.add('hidden');
  running   = true;
  abortCtrl = new AbortController();

  const histA = [{
    role:    'user',
    content: `Open the dialogue with a single sharp sentence defending your position on: "${topic}". ONE sentence, 20 words max. Stop immediately after.`,
  }];
  const histB = [];

  let turn  = 0;
  const MAX = 10;

  try {
    while (running && turn < MAX) {
      turn++;
      setTurns(turn);

      // Voice A
      setStatus(`${mode.nameA} is thinking…`);
      setActive('a');
      const bubA = addThinking('a', mode.nameA);
      const curA = startStream(bubA);
      let   txtA = '';

      for await (const chunk of streamChat(mode.sysA(topic), histA, abortCtrl.signal)) {
        pushChunk(bubA, curA, chunk);
        txtA += chunk;
      }
      curA.remove();
      if (!running || !txtA) break;

      histA.push({ role: 'assistant', content: txtA });
      histB.push({ role: 'user',      content: txtA + '\n\n[Reply in ONE sentence only. 20 words max. Stop immediately after.]' });

      await pause(3500);
      if (!running) break;

      // Voice B
      setStatus(`${mode.nameB} is thinking…`);
      setActive('b');
      const bubB = addThinking('b', mode.nameB);
      const curB = startStream(bubB);
      let   txtB = '';

      for await (const chunk of streamChat(mode.sysB(topic), histB, abortCtrl.signal)) {
        pushChunk(bubB, curB, chunk);
        txtB += chunk;
      }
      curB.remove();
      if (!running || !txtB) break;

      histB.push({ role: 'assistant', content: txtB });
      histA.push({ role: 'user',      content: txtB + '\n\n[Reply in ONE sentence only. 20 words max. Stop immediately after.]' });

      await pause(3500);
      if (!running) break;
    }
  } catch(e) {
    if (e.name !== 'AbortError') {
      console.error(e);
      setStatus(`Error: ${e.message}`);
    }
  }

  const completed = turn >= MAX;
  const stopped   = !running;
  running = false;
  clearActive();
  if (completed)    setStatus('Dialogue complete.');
  else if (stopped) setStatus('Stopped.');
  btnStop.classList.add('hidden');
  btnRestart.classList.remove('hidden');
}

// ── event listeners ───────────────────────────────────────────────────────────
btnStart.addEventListener('click', () => {
  const topic = topicInput.value.trim();
  if (!topic || !currentMode) return;
  showScreen('screen-dialogue');
  runDialogue(topic, currentMode);
});

topicInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') btnStart.click();
});

btnStop.addEventListener('click', () => {
  running = false;
  abortCtrl?.abort();
});

btnRestart.addEventListener('click', () => {
  running = false;
  abortCtrl?.abort();
  showScreen('screen-intro');
  topicInput.value = '';
});
