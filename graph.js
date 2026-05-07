const WIKI_API = 'https://en.wikipedia.org/w/api.php';
const WIKI_HEADERS = { 'Api-User-Agent': 'WikiGraph/1.0 (educational; github.com/student-project)' };
const MAX_NODES = 1250;
const MAX_LINKS_PER_NODE = 40;
const MAX_DEPTH = 5;
const BFS_INTERVAL_MS = 200;

const state = {
  nodes: new Map(),
  links: [],
  pathFound: false,
  sourceTitle: '',
  targetTitle: '',
  visitedA: new Map(),
  visitedB: new Map(),
  queueA: [],
  queueB: [],
  running: false,
};

// ── Graph instance ────────────────────────────────────────────────────────────

const graphData = { nodes: [], links: [] };

const Graph = ForceGraph3D()(document.getElementById('graph-container'))
  .backgroundColor('#050810')
  .nodeLabel(() => '')
  .nodeVal(n => Math.max(1, Math.log2(n.degree + 1) * 3))
  .nodeColor(n => nodeColor(n))
  .linkColor(() => 'rgba(80,110,200,0.25)')
  .linkWidth(0.4)
  .linkDirectionalParticles(0)
  .onNodeHover(handleNodeHover)
  .graphData(graphData);

// ── Color logic ───────────────────────────────────────────────────────────────

function nodeColor(n) {
  if (n.onPath) return '#50c878';
  if (n.id === state.sourceTitle) return '#ff6b6b';
  if (n.id === state.targetTitle) return '#ffd166';
  const deg = n.degree || 1;
  if (deg > 20) return '#7eb8ff';
  if (deg > 8) return '#4a7acc';
  return '#2a3a6a';
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

const tooltip = document.getElementById('tooltip');
const descriptionCache = new Map();

async function fetchDescription(title) {
  if (descriptionCache.has(title)) return descriptionCache.get(title);
  const params = new URLSearchParams({
    action: 'query',
    titles: title,
    prop: 'description',
    format: 'json',
    origin: '*',
  });
  try {
    const res = await fetch(`${WIKI_API}?${params}`, { headers: WIKI_HEADERS });
    const data = await res.json();
    const page = Object.values(data.query.pages)[0];
    const desc = page.description || '';
    descriptionCache.set(title, desc);
    return desc;
  } catch {
    return '';
  }
}

function handleNodeHover(node) {
  if (!node) { tooltip.style.display = 'none'; return; }
  const degreeText = node.degree ? ` (${node.degree} links)` : '';
  tooltip.innerHTML = `<span class="tt-title">${node.id}${degreeText}</span>`;
  tooltip.style.display = 'flex';

  fetchDescription(node.id).then(desc => {
    if (!desc) return;
    const existing = tooltip.querySelector('.tt-desc');
    if (existing) existing.remove();
    const el = document.createElement('span');
    el.className = 'tt-desc';
    el.textContent = desc;
    tooltip.appendChild(el);
  });
}

document.addEventListener('mousemove', e => {
  tooltip.style.left = (e.clientX + 14) + 'px';
  tooltip.style.top = (e.clientY - 10) + 'px';
});

// ── Wikipedia API ─────────────────────────────────────────────────────────────

async function fetchLinks(title) {
  const params = new URLSearchParams({
    action: 'query',
    titles: title,
    prop: 'links',
    pllimit: '500',
    plnamespace: '0',
    format: 'json',
    origin: '*',
  });
  const res = await fetch(`${WIKI_API}?${params}`, { headers: WIKI_HEADERS });
  const data = await res.json();
  const pages = Object.values(data.query.pages);
  if (!pages[0] || pages[0].missing !== undefined) return [];
  const links = pages[0].links || [];
  return shuffle(links.map(l => l.title)).slice(0, MAX_LINKS_PER_NODE);
}

async function fetchBacklinks(title) {
  const params = new URLSearchParams({
    action: 'query',
    list: 'backlinks',
    bltitle: title,
    bllimit: '500',
    blnamespace: '0',
    format: 'json',
    origin: '*',
  });
  const res = await fetch(`${WIKI_API}?${params}`, { headers: WIKI_HEADERS });
  const data = await res.json();
  const links = data.query.backlinks || [];
  return shuffle(links.map(l => l.title)).slice(0, MAX_LINKS_PER_NODE);
}

async function resolveRedirect(title) {
  const params = new URLSearchParams({
    action: 'query',
    titles: title,
    redirects: '1',
    format: 'json',
    origin: '*',
  });
  const res = await fetch(`${WIKI_API}?${params}`, { headers: WIKI_HEADERS });
  const data = await res.json();
  const redirects = data.query.redirects;
  if (redirects && redirects.length > 0) return redirects[0].to;
  const pages = Object.values(data.query.pages);
  if (pages[0].missing !== undefined) return null;
  return pages[0].title;
}

// ── Graph mutation ────────────────────────────────────────────────────────────

function addNode(title, role) {
  if (state.nodes.has(title)) return state.nodes.get(title);
  const node = { id: title, degree: 0, role, onPath: false };
  state.nodes.set(title, node);
  graphData.nodes.push(node);
  return node;
}

function addEdge(sourceTitle, targetTitle) {
  // Avoid duplicate edges
  const key = sourceTitle < targetTitle
    ? `${sourceTitle}||${targetTitle}`
    : `${targetTitle}||${sourceTitle}`;
  if (addEdge._seen.has(key)) return;
  addEdge._seen.add(key);

  const src = state.nodes.get(sourceTitle);
  const tgt = state.nodes.get(targetTitle);
  if (!src || !tgt) return;
  src.degree = (src.degree || 0) + 1;
  tgt.degree = (tgt.degree || 0) + 1;
  graphData.links.push({ source: sourceTitle, target: targetTitle });
  state.links.push({ source: sourceTitle, target: targetTitle });
}
addEdge._seen = new Set();

function refreshGraph() {
  Graph.graphData({ nodes: [...graphData.nodes], links: [...graphData.links] });
  updateStats();
}

// ── Stats UI ──────────────────────────────────────────────────────────────────

function updateStats() {
  document.getElementById('stat-nodes').textContent = graphData.nodes.length;
  document.getElementById('stat-edges').textContent = graphData.links.length;
}

function setStatus(msg) {
  document.getElementById('status').textContent = msg;
}

// ── Path reconstruction ───────────────────────────────────────────────────────

function reconstructPath(meetingNode) {
  const pathA = [];
  let cur = meetingNode;
  while (cur !== null && cur !== undefined) {
    pathA.unshift(cur);
    cur = state.visitedA.get(cur);
  }

  const pathB = [];
  cur = state.visitedB.get(meetingNode);
  while (cur !== null && cur !== undefined) {
    pathB.push(cur);
    cur = state.visitedB.get(cur);
  }

  return [...pathA, ...pathB];
}

function highlightPath(path) {
  for (const title of path) {
    const node = state.nodes.get(title);
    if (node) node.onPath = true;
  }
  refreshGraph();

  const container = document.getElementById('path-nodes');
  container.innerHTML = '';
  path.forEach((title, i) => {
    const span = document.createElement('span');
    span.className = 'path-node';
    span.textContent = title;
    container.appendChild(span);
    if (i < path.length - 1) {
      const arrow = document.createElement('span');
      arrow.className = 'path-arrow';
      arrow.textContent = '→';
      container.appendChild(arrow);
    }
  });

  document.getElementById('stat-path').textContent = path.length - 1;
  document.getElementById('path-display').classList.remove('hidden');
}

// ── Bidirectional BFS ─────────────────────────────────────────────────────────

async function bfsStep(queue, visited, otherVisited, label, fetchFn) {
  if (queue.length === 0 || state.pathFound) return;

  const { title, depth } = queue.shift();
  setStatus(`Expanding ${label}: ${title}`);

  if (depth >= MAX_DEPTH) return;

  let neighbors;
  try {
    neighbors = await fetchFn(title);
  } catch {
    return;
  }

  for (const nb of neighbors) {
    if (state.nodes.size >= MAX_NODES) break;
    if (!state.nodes.has(nb)) addNode(nb, 'normal');

    const [edgeSrc, edgeTgt] = label === 'source' ? [title, nb] : [nb, title];
    addEdge(edgeSrc, edgeTgt);

    if (!visited.has(nb)) {
      visited.set(nb, title);
      queue.push({ title: nb, depth: depth + 1 });
    }

    if (otherVisited.has(nb) && !state.pathFound) {
      state.pathFound = true;
      const path = reconstructPath(nb);
      highlightPath(path);
      setStatus(`Path found in ${path.length - 1} hops!`);
      document.getElementById('stat-depth').textContent = path.length - 1;
      return;
    }
  }

  refreshGraph();
}

// ── Main loop ─────────────────────────────────────────────────────────────────

async function runBFS() {
  let tick = 0;
  while (
    !state.pathFound &&
    state.nodes.size < MAX_NODES &&
    (state.queueA.length > 0 || state.queueB.length > 0)
  ) {
    if (state.queueA.length > 0) {
      await bfsStep(state.queueA, state.visitedA, state.visitedB, 'source', fetchLinks);
    }
    if (!state.pathFound && state.queueB.length > 0) {
      await bfsStep(state.queueB, state.visitedB, state.visitedA, 'target', fetchBacklinks);
    }

    tick++;
    document.getElementById('stat-depth').textContent = Math.ceil(tick / 2);

    await sleep(BFS_INTERVAL_MS);
  }

  if (!state.pathFound) {
    setStatus('Search complete — no path found within node limit.');
  }

  document.getElementById('start-btn').disabled = false;
  state.running = false;
}

// ── Entry point ───────────────────────────────────────────────────────────────

document.getElementById('start-btn').addEventListener('click', async () => {
  if (state.running) return;

  const rawSource = document.getElementById('source').value.trim();
  const rawTarget = document.getElementById('target').value.trim();
  if (!rawSource || !rawTarget) return;

  // Reset
  Object.assign(state, {
    nodes: new Map(),
    links: [],
    pathFound: false,
    visitedA: new Map(),
    visitedB: new Map(),
    queueA: [],
    queueB: [],
    running: true,
  });
  addEdge._seen = new Set();
  graphData.nodes.length = 0;
  graphData.links.length = 0;
  Graph.graphData({ nodes: [], links: [] });
  document.getElementById('path-display').classList.add('hidden');
  document.getElementById('stats').classList.remove('hidden');
  document.getElementById('stat-path').textContent = '—';
  document.getElementById('start-btn').disabled = true;

  setStatus('Resolving article titles…');

  const [sourceTitle, targetTitle] = await Promise.all([
    resolveRedirect(rawSource),
    resolveRedirect(rawTarget),
  ]);

  if (!sourceTitle) { setStatus(`Could not find article: "${rawSource}"`); state.running = false; document.getElementById('start-btn').disabled = false; return; }
  if (!targetTitle) { setStatus(`Could not find article: "${rawTarget}"`); state.running = false; document.getElementById('start-btn').disabled = false; return; }

  state.sourceTitle = sourceTitle;
  state.targetTitle = targetTitle;

  addNode(sourceTitle, 'source');
  addNode(targetTitle, 'target');

  state.visitedA.set(sourceTitle, null);
  state.visitedB.set(targetTitle, null);
  state.queueA.push({ title: sourceTitle, depth: 0 });
  state.queueB.push({ title: targetTitle, depth: 0 });

  refreshGraph();
  setStatus('Exploring…');
  runBFS();
});

// ── Autocomplete ──────────────────────────────────────────────────────────────

async function fetchSuggestions(query) {
  if (query.length < 2) return [];
  const params = new URLSearchParams({
    action: 'opensearch',
    search: query,
    limit: '7',
    namespace: '0',
    format: 'json',
    origin: '*',
  });
  const res = await fetch(`${WIKI_API}?${params}`, { headers: WIKI_HEADERS });
  const data = await res.json();
  const titles = data[1] || [];
  if (titles.length === 0) return [];

  const descParams = new URLSearchParams({
    action: 'query',
    titles: titles.join('|'),
    prop: 'description',
    format: 'json',
    origin: '*',
  });
  const descRes = await fetch(`${WIKI_API}?${descParams}`, { headers: WIKI_HEADERS });
  const descData = await descRes.json();
  const descMap = new Map();
  for (const page of Object.values(descData.query.pages)) {
    descMap.set(page.title, page.description || '');
  }

  return titles.map(title => ({ title, desc: descMap.get(title) || '' }));
}

function initAutocomplete(inputId, suggestionsId) {
  const input = document.getElementById(inputId);
  const box = document.getElementById(suggestionsId);
  let activeIndex = -1;
  let debounceTimer = null;
  let currentQuery = '';

  function close() {
    box.classList.remove('open');
    box.innerHTML = '';
    activeIndex = -1;
  }

  function select(title) {
    input.value = title;
    close();
  }

  function setActive(index) {
    const items = box.querySelectorAll('.suggestion-item');
    items.forEach(el => el.classList.remove('active'));
    if (index >= 0 && index < items.length) {
      items[index].classList.add('active');
      activeIndex = index;
    }
  }

  input.addEventListener('input', () => {
    const q = input.value.trim();
    clearTimeout(debounceTimer);
    if (!q) { close(); return; }
    currentQuery = q;
    debounceTimer = setTimeout(async () => {
      if (input.value.trim() !== currentQuery) return;
      const suggestions = await fetchSuggestions(currentQuery);
      if (input.value.trim() !== currentQuery) return;
      box.innerHTML = '';
      activeIndex = -1;
      if (suggestions.length === 0) { close(); return; }
      suggestions.forEach(({ title, desc }) => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.dataset.title = title;
        const titleEl = document.createElement('span');
        titleEl.className = 'sg-title';
        titleEl.textContent = title;
        item.appendChild(titleEl);
        if (desc) {
          const descEl = document.createElement('span');
          descEl.className = 'sg-desc';
          descEl.textContent = desc;
          item.appendChild(descEl);
        }
        item.addEventListener('mousedown', e => {
          e.preventDefault();
          select(title);
        });
        box.appendChild(item);
      });
      box.classList.add('open');
    }, 200);
  });

  input.addEventListener('keydown', e => {
    const items = box.querySelectorAll('.suggestion-item');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(Math.min(activeIndex + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(Math.max(activeIndex - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      select(items[activeIndex].dataset.title);
    } else if (e.key === 'Escape') {
      close();
    }
  });

  input.addEventListener('blur', () => setTimeout(close, 150));
}

initAutocomplete('source', 'source-suggestions');
initAutocomplete('target', 'target-suggestions');

// ── Utils ─────────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
