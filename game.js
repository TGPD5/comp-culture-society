'use strict';

// ── CONSTANTS ─────────────────────────────────────────────────────────────────

const Z_THRESHOLD    = 0.9;    // ±15% of bar width (bar spans ±3σ); covers ~63% of population per dimension
const CRASH_THRESHOLD = 2;     // ≥2 out-of-range → crash
const MAX_DEATHS     = 3;      // 3 crashes → court-martial

function rand(n) { return Math.floor(Math.random() * n); }
function zToPercent(z) { return Math.max(1, Math.min(99, ((z + 3) / 6) * 100)); }

// ── MEASUREMENTS ──────────────────────────────────────────────────────────────

const MEASUREMENTS = [
  { id: 'height',        label: 'Height',            unit: 'in',  mean: 69.0, sd: 2.5  },
  { id: 'sittingHeight', label: 'Sitting Height',    unit: 'in',  mean: 36.0, sd: 1.5  },
  { id: 'hipCirc',       label: 'Hip Circumference', unit: 'in',  mean: 38.0, sd: 2.0  },
  { id: 'femurLength',   label: 'Femur Length',      unit: 'in',  mean: 17.0, sd: 1.2  },
  { id: 'shinLength',    label: 'Shin Length',       unit: 'in',  mean: 16.0, sd: 1.0  },
  { id: 'armSpan',       label: 'Arm Span',          unit: 'in',  mean: 70.0, sd: 3.0  },
  { id: 'shoulderWidth', label: 'Shoulder Width',    unit: 'in',  mean: 18.0, sd: 1.0  },
  { id: 'neckCirc',      label: 'Neck Circumference',unit: 'in',  mean: 15.0, sd: 0.8  },
  { id: 'footLength',    label: 'Foot Length',       unit: 'in',  mean: 10.0, sd: 0.6  },
  { id: 'chestDepth',    label: 'Chest Depth',       unit: 'in',  mean:  9.5, sd: 0.5  },
  { id: 'aptitude',      label: 'Mental Aptitude',   unit: 'pts', mean:100.0, sd:15.0  },
];

// ── NAME GENERATOR — 1940s American ──────────────────────────────────────────

const FIRST_NAMES = [
  'Robert','James','John','William','Charles','George','Joseph',
  'Richard','Donald','Thomas','Harold','Walter','Raymond','Frank',
  'Arthur','Kenneth','Howard','Paul','Edward','Eugene','Carl',
  'Lawrence','Albert','Henry','Ralph','Roy','Clarence','Fred',
  'Harry','Earl','Leonard','Marvin','Dale','Herbert','Gerald',
  'Stanley','Lloyd','Norman','Melvin','Leroy'
];
const LAST_NAMES = [
  'Smith','Johnson','Williams','Brown','Jones','Miller','Davis',
  'Wilson','Anderson','Taylor','Thomas','Jackson','White','Harris',
  'Martin','Thompson','Clark','Lewis','Walker','Hall','Allen',
  'Young','King','Wright','Scott','Green','Baker','Adams','Nelson',
  'Carter','Mitchell','Roberts','Turner','Phillips','Campbell',
  'Parker','Evans','Edwards','Collins','Reed','Murray','Hayes',
  'Shaw','Cole','West','Boyd','Patterson','Duncan','Fleming',
  // Italian (rare — 6 entries vs ~40 Anglo)
  'Conti','Ferraro','Russo','Moretti','Gallo','Ricci',
  // Spanish (rare — 6 entries)
  'Rivera','Delgado','Castillo','Vega','Reyes','Medina',
];

function pickName() {
  return FIRST_NAMES[rand(FIRST_NAMES.length)] + ' ' + LAST_NAMES[rand(LAST_NAMES.length)];
}

// ── STATISTICS ────────────────────────────────────────────────────────────────

function gaussianRandom() {
  let u, v;
  do { u = Math.random(); } while (u === 0);
  do { v = Math.random(); } while (v === 0);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function generateCandidate(id) {
  const zScores = {}, values = {}, fits = {};
  for (const m of MEASUREMENTS) {
    const z = gaussianRandom();
    zScores[m.id] = z;
    values[m.id]  = +(z * m.sd + m.mean).toFixed(1);
    fits[m.id]    = Math.abs(z) < Z_THRESHOLD;
  }
  const outCount = MEASUREMENTS.filter(m => !fits[m.id]).length;
  const [skinBase, skinDark] = pickSkinTone();
  return {
    id, name: pickName(),
    zScores, values, fits,
    outCount,
    skinBase, skinDark,
    willCrash: outCount >= CRASH_THRESHOLD,
    playerDecision: null,
  };
}

// ── CANVAS FIGURE ─────────────────────────────────────────────────────────────
// Logical 80×120, CSS 160×240 (2×)

const OLIVE   = '#8B9457';
const OLIVE_D = '#4A5240';
const DARK    = '#0B1120';
const WHITE   = '#E8DFC8';

// Skin tone pairs: [base, shadow]. Ranges from pale to dark brown.
const SKIN_TONES = [
  ['#DCCCA0', '#B8A070'],  // pale/fair
  ['#C8B87A', '#A0885A'],  // default tan (original)
  ['#C0A060', '#906A38'],  // medium warm
  ['#A07840', '#785030'],  // medium brown
  ['#7A5030', '#502810'],  // dark brown
  ['#5A3018', '#381808'],  // deep brown
];

function pickSkinTone() {
  return SKIN_TONES[rand(SKIN_TONES.length)];
}

function makeBodyBlocks(s, sd) {
  return [
    [s,    30,  3, 20, 20],   // head
    [sd,   28,  7,  2,  8],   // L ear
    [sd,   50,  7,  2,  8],   // R ear
    [OLIVE,28,  2, 24,  4],   // helmet brim
    [OLIVE,30,  0, 20,  4],   // helmet top
    [sd,   30, 21, 20,  2],   // chin
    [sd,   35, 23, 10,  1],   // neck
    [OLIVE,24, 24, 32, 26],   // torso
    [OLIVE_D,36,24,  8, 10],  // lapels
    [OLIVE_D,24,48, 32,  4],  // belt
    [OLIVE,26, 52, 28,  8],   // hips
    [OLIVE,27, 60, 12, 18],   // L thigh
    [OLIVE,41, 60, 12, 18],   // R thigh
    [OLIVE_D,28,78, 10, 16],  // L shin
    [OLIVE_D,42,78, 10, 16],  // R shin
    [DARK, 25, 94, 14,  6],   // L boot
    [DARK, 41, 94, 14,  6],   // R boot
    [OLIVE,14, 24, 10, 18],   // L upper arm
    [OLIVE,56, 24, 10, 18],   // R upper arm
    [OLIVE_D,13,42,  9, 14],  // L forearm
    [OLIVE_D,58,42,  9, 14],  // R forearm
    [s,    13, 56,  8,  8],   // L fist
    [s,    59, 56,  8,  8],   // R fist
  ];
}

function drawFace(ctx, s, sd) {
  // eye whites
  ctx.fillStyle = WHITE;
  ctx.fillRect(33, 9, 5, 4);
  ctx.fillRect(42, 9, 5, 4);
  // pupils
  ctx.fillStyle = '#1A1A1A';
  ctx.fillRect(35, 10, 2, 2);
  ctx.fillRect(44, 10, 2, 2);
  // brows
  ctx.fillStyle = sd;
  ctx.fillRect(33, 8, 5, 1);
  ctx.fillRect(42, 8, 5, 1);
  // mouth
  ctx.fillStyle = sd;
  ctx.fillRect(36, 17, 8, 1);
  ctx.fillRect(35, 16, 1, 1);
  ctx.fillRect(44, 16, 1, 1);
}

const FIGURE_ANCHORS = {
  height:        { x1: 9,  y1: 3,   x2: 9,  y2:100, orient:'v' },
  sittingHeight: { x1: 6,  y1:24,   x2: 6,  y2: 60, orient:'v' },
  hipCirc:       { x1:24,  y1:56,   x2:56,  y2: 56, orient:'h' },
  femurLength:   { x1: 6,  y1:60,   x2: 6,  y2: 78, orient:'v' },
  shinLength:    { x1: 6,  y1:78,   x2: 6,  y2: 94, orient:'v' },
  armSpan:       { x1:12,  y1:49,   x2:68,  y2: 49, orient:'h' },
  shoulderWidth: { x1:24,  y1:27,   x2:56,  y2: 27, orient:'h' },
  neckCirc:      { x1:34,  y1:23,   x2:46,  y2: 23, orient:'h' },
  footLength:    { x1:25,  y1:101,  x2:39,  y2:101, orient:'h' },
  chestDepth:    { x1:70,  y1:24,   x2:70,  y2: 48, orient:'v' },
  aptitude:      { x1:30,  y1: 1,   x2:50,  y2:  1, orient:'h' },
};

let bobOffset   = 0;
let bobInterval = null;
let bobCandidate = null;
let bobRevealed  = false;

function drawAnnotations(ctx, candidate, revealed) {
  for (const m of MEASUREMENTS) {
    const a = FIGURE_ANCHORS[m.id];
    if (!a) continue;
    ctx.fillStyle = !revealed ? '#D4A017'
                  : candidate.fits[m.id] ? '#3CB043' : '#C0392B';
    const { x1, y1, x2, y2, orient } = a;
    if (orient === 'v') {
      ctx.fillRect(x1, y1, 1, y2 - y1);
      ctx.fillRect(x1 - 2, y1, 5, 1);
      ctx.fillRect(x1 - 2, y2, 5, 1);
    } else {
      ctx.fillRect(x1, y1, x2 - x1, 1);
      ctx.fillRect(x1, y1 - 2, 1, 5);
      ctx.fillRect(x2, y1 - 2, 1, 5);
    }
  }
}

function renderFigure(ctx, candidate, revealed) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); // reset any prior transform
  ctx.clearRect(0, 0, 160, 240);
  ctx.fillStyle = DARK;
  ctx.fillRect(0, 0, 160, 240);
  ctx.scale(2, 2); // all draw calls below use 80×120 logical coords
  ctx.save();
  ctx.translate(0, 10 + bobOffset);
  ctx.fillStyle = '#1E2E42';
  ctx.fillRect(0, 105, 80, 3);
  const blocks = makeBodyBlocks(candidate.skinBase, candidate.skinDark);
  for (const [color, x, y, w, h] of blocks) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }
  drawFace(ctx, candidate.skinBase, candidate.skinDark);
  drawAnnotations(ctx, candidate, revealed);
  ctx.restore();
}

function startBob(candidate, revealed) {
  if (bobInterval) clearInterval(bobInterval);
  bobCandidate = candidate;
  bobRevealed  = revealed;
  bobOffset    = 0;
  bobInterval  = setInterval(() => {
    bobOffset = bobOffset === 0 ? -2 : 0;
    renderFigure(ctx, bobCandidate, bobRevealed);
  }, 1000);
}

function stopBob() {
  if (bobInterval) { clearInterval(bobInterval); bobInterval = null; }
}

// ── CRASH / FLY-PAST ANIMATION ────────────────────────────────────────────────
// Crash canvas: 400×160 logical, CSS 600×240

const crashCanvas  = document.getElementById('crash-canvas');
const crashCtx     = crashCanvas.getContext('2d');
const crashOverlay = document.getElementById('crash-overlay');
const crashCaption = document.getElementById('crash-caption');
const crashSub     = document.getElementById('crash-sub');

// Pixel art P-51 Mustang sprite, 20×8 pixels
// Drawn relative to (x, y) = nose-left tip
function drawPlane(ctx, px, py, angle) {
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(angle);

  const body    = '#C0C0A8'; // silver fuselage
  const dark    = '#3A3A2A';
  const cockpit = '#5AEEFF'; // cyan canopy
  const prop    = '#8B7A5A';

  // fuselage body
  ctx.fillStyle = body;
  ctx.fillRect(0,  2, 20,  4); // main fuselage
  ctx.fillRect(2,  1, 14,  6); // slightly thicker middle

  // tail fins
  ctx.fillStyle = body;
  ctx.fillRect(14, -1,  4,  2); // top fin
  ctx.fillRect(14,  7,  4,  2); // bottom fin

  // wings (horizontal span across middle)
  ctx.fillStyle = body;
  ctx.fillRect(5, -3, 10,  2); // top wing
  ctx.fillRect(5,  9, 10,  2); // bottom wing

  // cockpit canopy
  ctx.fillStyle = cockpit;
  ctx.fillRect(6,  1,  5,  3);

  // nose / propeller hub
  ctx.fillStyle = dark;
  ctx.fillRect(0,  3,  2,  2);

  // propeller blades (vertical)
  ctx.fillStyle = prop;
  ctx.fillRect(-1,  0,  1,  8); // blade span

  ctx.restore();
}

function runFlightAnimation(pilotName, willCrash, onDone) {
  crashOverlay.classList.remove('hidden');
  crashSub.textContent = '';

  const W = 400, H = 160;
  const startX = -24, startY = 70;

  let x = startX, y = startY;
  let angle = 0;
  let phase = 'fly'; // 'fly' | 'dive' | 'explode'
  let explodeFrame = 0;
  let explodeX = 0, explodeY = 0;
  let frameId = null;
  let diveGravity = 0;

  // For safe: just fly across. For crash: start dive at center.
  const diveStartX = W / 2;

  function clearCrash() {
    crashCtx.fillStyle = '#07090E';
    crashCtx.fillRect(0, 0, W, H);
    // ground line
    crashCtx.fillStyle = '#2A3F28';
    crashCtx.fillRect(0, H - 12, W, 12);
    crashCtx.fillStyle = '#1E2E18';
    crashCtx.fillRect(0, H - 14, W, 2);
  }

  function drawExplosion(ex, ey, frame) {
    // frame 0: small burst
    // frame 1: medium burst
    // frame 2: large fading burst
    const sizes  = [4, 8, 12];
    const colors = ['#FF8C00','#FF4500','#C0392B'];
    const sparks = [
      [0, -1], [1, -1], [-1, -1],
      [1, 0],  [-1, 0],
      [0,  1], [1,  1], [-1,  1],
    ];
    const r = sizes[frame];
    crashCtx.fillStyle = colors[frame];
    crashCtx.fillRect(ex - r, ey - r, r * 2, r * 2);
    if (frame < 2) {
      crashCtx.fillStyle = '#FFD700';
      for (const [dx, dy] of sparks) {
        crashCtx.fillRect(ex + dx * (r + 2), ey + dy * (r + 2), 2, 2);
      }
    }
    // smoke
    if (frame === 2) {
      crashCtx.fillStyle = '#3A3A3A';
      crashCtx.fillRect(ex - 8, ey - 16, 16, 12);
    }
  }

  function tick() {
    clearCrash();

    if (phase === 'fly') {
      x += 3;
      if (willCrash && x >= diveStartX) {
        phase = 'dive';
        explodeX = x;
      }
      if (!willCrash && x > W + 30) {
        // safe exit
        crashCaption.style.color = 'var(--green)';
        crashCaption.textContent = '✓ CLEARED FOR TAKEOFF';
        crashSub.textContent     = pilotName + ' — MISSION ASSIGNED';
        setTimeout(() => {
          crashOverlay.classList.add('hidden');
          onDone();
        }, 900);
        return;
      }
      drawPlane(crashCtx, x, y, angle);
      frameId = requestAnimationFrame(tick);

    } else if (phase === 'dive') {
      x += 2.5;
      diveGravity += 0.4;
      y += diveGravity;
      angle = Math.min(Math.PI / 2.5, diveGravity * 0.12);
      explodeX = x;
      explodeY = y;
      if (y > H - 16) {
        phase = 'explode';
        explodeX = x;
        explodeY = H - 14;
        crashCaption.style.color = 'var(--red)';
        crashCaption.textContent = pilotName.toUpperCase() + ' HAS BEEN LOST.';
        crashSub.textContent     = 'AIRCRAFT DOWN — CAUSE OF LOSS: COCKPIT MISFIT';
        runExplodeSequence(explodeX, explodeY, onDone);
        return;
      }
      drawPlane(crashCtx, x, y, angle);
      frameId = requestAnimationFrame(tick);
    }
  }

  frameId = requestAnimationFrame(tick);
}

function runExplodeSequence(ex, ey, onDone) {
  const W = 400, H = 160;

  function frame(i) {
    // re-draw background each time
    crashCtx.fillStyle = '#07090E';
    crashCtx.fillRect(0, 0, W, H);
    crashCtx.fillStyle = '#2A3F28';
    crashCtx.fillRect(0, H - 12, W, 12);
    crashCtx.fillStyle = '#1E2E18';
    crashCtx.fillRect(0, H - 14, W, 2);

    if (i === 0) {
      crashCtx.fillStyle = '#FF8C00';
      crashCtx.fillRect(ex - 4, ey - 4, 8, 8);
      crashCtx.fillStyle = '#FFD700';
      crashCtx.fillRect(ex - 1, ey - 6, 2, 3);
      crashCtx.fillRect(ex + 3, ey - 5, 2, 2);
      crashCtx.fillRect(ex - 5, ey - 4, 2, 2);
    } else if (i === 1) {
      crashCtx.fillStyle = '#FF4500';
      crashCtx.fillRect(ex - 10, ey - 10, 20, 20);
      crashCtx.fillStyle = '#FF8C00';
      crashCtx.fillRect(ex - 6, ey - 14, 12, 6);
      crashCtx.fillRect(ex + 8, ey - 8, 5, 5);
      crashCtx.fillRect(ex - 14, ey - 6, 5, 5);
      crashCtx.fillStyle = '#FFD700';
      crashCtx.fillRect(ex - 2, ey - 16, 4, 3);
      // debris
      crashCtx.fillStyle = '#C0C0A8';
      crashCtx.fillRect(ex - 16, ey - 4, 4, 2);
      crashCtx.fillRect(ex + 12, ey - 8, 3, 2);
    } else {
      crashCtx.fillStyle = '#C0392B';
      crashCtx.fillRect(ex - 14, ey - 12, 28, 24);
      crashCtx.fillStyle = '#3A3A3A';
      crashCtx.fillRect(ex - 10, ey - 24, 20, 14);
      crashCtx.fillRect(ex - 6,  ey - 32, 12, 10);
      crashCtx.fillStyle = '#FF4500';
      crashCtx.fillRect(ex - 4, ey - 14, 8, 4);
      // debris spread
      crashCtx.fillStyle = '#888';
      crashCtx.fillRect(ex - 22, ey - 2, 3, 2);
      crashCtx.fillRect(ex + 18, ey - 4, 4, 2);
      crashCtx.fillRect(ex - 2, ey + 6, 4, 2);
    }
  }

  frame(0);
  setTimeout(() => { frame(1); }, 180);
  setTimeout(() => { frame(2); }, 400);
  setTimeout(() => {
    crashOverlay.classList.add('hidden');
    onDone();
  }, 2000);
}

// ── GAME STATE ────────────────────────────────────────────────────────────────

const state = {
  screen:       'briefing',
  subState:     'idle',
  candidateNum: 0,     // always incrementing counter
  current:      null,  // current Candidate object
  deaths:       0,
  totalAccepted: 0,
  safeFlights:  0,
};

// ── DOM REFERENCES ────────────────────────────────────────────────────────────

const screens = {
  briefing:    document.getElementById('screen-briefing'),
  recruitment: document.getElementById('screen-recruitment'),
  debrief:     document.getElementById('screen-debrief'),
};

const canvas  = document.getElementById('figure-canvas');
const ctx     = canvas.getContext('2d');

const elName      = document.getElementById('candidate-name');
const elNum       = document.getElementById('candidate-num');
const elSeen      = document.getElementById('hud-seen');
const elRecruited = document.getElementById('hud-recruited');
const elSafe      = document.getElementById('hud-safe');
const elDeaths    = document.getElementById('hud-deaths');
const elBtnAccept = document.getElementById('btn-accept');
const elBtnReject = document.getElementById('btn-reject');
const elBtnNext   = document.getElementById('btn-next');
const elVerdict   = document.getElementById('verdict-stamp');
const elBars      = document.getElementById('measurement-bars');
const elDebriefTitle   = document.getElementById('debrief-title');
const elDebriefStats   = document.getElementById('debrief-stats');
const elDebriefMessage = document.getElementById('debrief-message');

// ── SCREEN MANAGEMENT ─────────────────────────────────────────────────────────

function setScreen(name) {
  for (const [key, el] of Object.entries(screens)) {
    el.classList.toggle('active', key === name);
  }
  state.screen = name;
}

// ── HUD ───────────────────────────────────────────────────────────────────────

function updateHUD() {
  elSeen.textContent      = state.candidateNum;
  elRecruited.textContent = state.totalAccepted;
  elSafe.textContent      = state.safeFlights;
  elDeaths.textContent    = state.deaths + ' / ' + MAX_DEATHS;
}

// ── MEASUREMENT TABLE ─────────────────────────────────────────────────────────

function buildTable(candidate, revealed) {
  elBars.innerHTML = '';
  for (const m of MEASUREMENTS) {
    const z    = candidate.zScores[m.id];
    const val  = candidate.values[m.id];
    const fits = candidate.fits[m.id];
    const pct  = zToPercent(z).toFixed(1);
    const pipCls    = revealed ? (fits ? 'in-zone' : 'out-zone') : 'unknown';
    const statusCls = revealed ? (fits ? 'ok' : 'bad')           : 'pending';
    const statusTxt = revealed ? (fits ? '✓ OK' : '✗ OUT')       : '&nbsp;';

    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML =
      `<span class="bar-label">${m.label}</span>` +
      `<div class="bar-track"><div class="bar-pip ${pipCls}" style="left:${pct}%"></div></div>` +
      `<span class="bar-value">${val} ${m.unit}</span>` +
      `<span class="bar-status ${statusCls}">${statusTxt}</span>`;
    elBars.appendChild(row);
  }
}

// ── RENDER CANDIDATE ─────────────────────────────────────────────────────────

function renderCurrent() {
  state.candidateNum++;
  state.current = generateCandidate(state.candidateNum);
  const c = state.current;

  elName.textContent = c.name.toUpperCase();
  elNum.textContent  = 'CANDIDATE #' + c.id;
  elVerdict.className   = '';
  elVerdict.textContent = '';

  buildTable(c, false);
  renderFigure(ctx, c, false);
  startBob(c, false);

  elBtnAccept.classList.remove('hidden');
  elBtnReject.classList.remove('hidden');
  elBtnNext.classList.add('hidden');
  elBtnAccept.disabled = false;
  elBtnReject.disabled = false;
  state.subState = 'idle';
  updateHUD();
}

// ── DEBRIEF / COURT-MARTIAL ───────────────────────────────────────────────────

function showCourtMartial() {
  stopBob();
  setScreen('debrief');

  elDebriefStats.innerHTML =
    `<div class="stat-row"><span class="stat-lbl">Candidates Processed</span><span class="stat-val">${state.candidateNum}</span></div>` +
    `<div class="stat-row"><span class="stat-lbl">Pilots Accepted</span><span class="stat-val">${state.totalAccepted}</span></div>` +
    `<div class="stat-row"><span class="stat-lbl">Safe Flights</span><span class="stat-val">${state.safeFlights}</span></div>` +
    `<div class="stat-row"><span class="stat-lbl">Crashes Caused</span><span class="stat-val danger">${state.deaths}</span></div>`;

  elDebriefMessage.innerHTML =
    `<p>MEMORANDUM — FOR THE RECORD</p>` +
    `<p style="margin-top:10px">The above-named clerk is hereby relieved of all screening duties, effective immediately, and remanded to disciplinary review.</p>` +
    `<p style="margin-top:10px">Despite access to full physical dossiers, this clerk approved <strong>${state.deaths}</strong> candidate${state.deaths !== 1 ? 's' : ''} whose measurements rendered them unfit for the P-51 Mustang cockpit. Each resulted in a fatal aircraft loss.</p>` +
    `<p style="margin-top:10px">It is the finding of this office that the clerk failed to recognise a fundamental truth: <em>no individual is average across many dimensions simultaneously.</em> The cockpit was built for an abstraction. Nearly every man who walks through that door will deviate from specification on at least one measurement — but only those who deviate on two or more cannot fly safely.</p>` +
    `<p style="margin-top:10px;color:#8B9457;font-size:0.74rem">— Col. R.A. Hammond, USAAF Procurement</p>`;
}

// ── STATE MACHINE ─────────────────────────────────────────────────────────────

function transition(action) {

  if (state.screen === 'briefing' && action === 'START') {
    state.deaths       = 0;
    state.totalAccepted = 0;
    state.safeFlights  = 0;
    state.candidateNum = 0;
    setScreen('recruitment');
    renderCurrent();
    return;
  }

  if (state.screen === 'recruitment' && state.subState === 'idle') {
    if (action !== 'ACCEPT' && action !== 'REJECT') return;

    const c = state.current;
    c.playerDecision = action.toLowerCase();
    state.subState = 'revealing';

    // Reveal bars
    buildTable(c, true);
    bobRevealed = true;
    renderFigure(ctx, c, true);

    if (action === 'REJECT') {
      // Just stamp rejected, show next
      elVerdict.className   = 'stamp-rejected';
      elVerdict.textContent = 'REJECTED';
      elBtnAccept.classList.add('hidden');
      elBtnReject.classList.add('hidden');
      elBtnNext.classList.remove('hidden');
      updateHUD();
      return;
    }

    // ACCEPT path
    state.totalAccepted++;
    elBtnAccept.classList.add('hidden');
    elBtnReject.classList.add('hidden');

    if (c.willCrash) {
      elVerdict.className   = 'stamp-crash';
      elVerdict.textContent = 'ACCEPTED ✗';
    } else {
      elVerdict.className   = 'stamp-accepted';
      elVerdict.textContent = 'ACCEPTED ✓';
    }
    updateHUD();

    // Run flight animation
    runFlightAnimation(c.name, c.willCrash, () => {
      if (c.willCrash) {
        state.deaths++;
        updateHUD();
        if (state.deaths >= MAX_DEATHS) {
          showCourtMartial();
          return;
        }
      } else {
        state.safeFlights++;
        updateHUD();
      }
      // Next candidate
      renderCurrent();
    });
    return;
  }

  if (state.screen === 'recruitment' && state.subState === 'revealing') {
    if (action !== 'NEXT') return;
    renderCurrent();
    return;
  }

  if (state.screen === 'debrief' && action === 'RESTART') {
    setScreen('briefing');
    return;
  }
}

// ── BUTTON WIRING ─────────────────────────────────────────────────────────────

document.getElementById('btn-start').addEventListener('click',   () => transition('START'));
elBtnAccept.addEventListener('click',                             () => transition('ACCEPT'));
elBtnReject.addEventListener('click',                             () => transition('REJECT'));
elBtnNext.addEventListener('click',                               () => transition('NEXT'));
document.getElementById('btn-restart').addEventListener('click',  () => transition('RESTART'));

// ── INIT ──────────────────────────────────────────────────────────────────────

setScreen('briefing');
