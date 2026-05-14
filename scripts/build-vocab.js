/**
 * One-time build script. Reads a GloVe text file (sorted most-frequent-first)
 * and outputs data/vocab.json with the top 20,000 common English words.
 *
 * Filtering rules:
 *   - Letters only (a-z), no digits, hyphens, apostrophes, etc.
 *   - Length >= 3
 *   - Stop at MAX_WORDS collected
 *
 * Usage:
 *   VECTORS_PATH=/path/to/glove.txt node scripts/build-vocab.js
 *
 * Output: data/vocab.json  (~3–5 MB, committed to git)
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const MAX_WORDS = 20000;
const MIN_LEN = 3;

const VECTORS_PATH = process.env.VECTORS_PATH || path.join(__dirname, '..', 'data', 'vectors.txt');
const OUT_PATH = path.join(__dirname, '..', 'data', 'vocab.json');

if (!fs.existsSync(VECTORS_PATH)) {
  console.error(`Vector file not found: ${VECTORS_PATH}`);
  console.error('Set VECTORS_PATH env var to point to your GloVe .txt file.');
  process.exit(1);
}

(async () => {
  console.log(`Reading vectors from ${VECTORS_PATH}`);
  console.log(`Collecting top ${MAX_WORDS} alpha-only words (length >= ${MIN_LEN})...\n`);

  const rl = readline.createInterface({ input: fs.createReadStream(VECTORS_PATH), crlfDelay: Infinity });

  const result = {};
  let collected = 0;
  let scanned = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;
    scanned++;

    const spaceIdx = line.indexOf(' ');
    const word = line.slice(0, spaceIdx).toLowerCase();

    // Skip anything that isn't purely a-z and meets the min length
    if (word.length < MIN_LEN || !/^[a-z]+$/.test(word)) continue;

    const nums = line.slice(spaceIdx + 1).split(' ').map(Number);
    result[word] = nums;
    collected++;

    if (collected % 1000 === 0) {
      process.stdout.write(`\r  ${collected} / ${MAX_WORDS} words collected (scanned ${scanned} lines)...`);
    }

    if (collected >= MAX_WORDS) break;
  }

  console.log(`\n\nCollected ${collected} words from ${scanned} lines scanned.`);

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(result));
  const kb = Math.round(fs.statSync(OUT_PATH).size / 1024);
  console.log(`Written to ${OUT_PATH} (${kb} KB)`);
})();
