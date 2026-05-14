/**
 * Downloads GloVe 2024 Wikipedia+Gigaword 50d vectors, extracts them,
 * builds data/vocab.json, then cleans up the zip.
 *
 * Usage:  node scripts/download-vectors.js
 *
 * Total download: ~290 MB zip  →  ~1.1 GB unzipped  →  ~300 KB vocab.json
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ZIP_URL = 'https://nlp.stanford.edu/data/wordvecs/glove.2024.wikigiga.50d.zip';
const DATA_DIR = path.join(__dirname, '..', 'data');
const ZIP_PATH = path.join(DATA_DIR, 'glove.zip');
const VECTORS_PATH = path.join(DATA_DIR, 'vectors.txt');
const VOCAB_PATH = path.join(DATA_DIR, 'vocab.json');

if (fs.existsSync(VOCAB_PATH)) {
  console.log(`vocab.json already exists at ${VOCAB_PATH}`);
  console.log('Delete it first if you want to re-download.');
  process.exit(0);
}

fs.mkdirSync(DATA_DIR, { recursive: true });

// --- Download ---
function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    let received = 0;
    let total = 0;

    const doGet = (url) => {
      const client = url.startsWith('https') ? https : http;
      client.get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return doGet(res.headers.location);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        total = parseInt(res.headers['content-length'] || '0', 10);
        res.on('data', (chunk) => {
          received += chunk.length;
          if (total) {
            const pct = ((received / total) * 100).toFixed(1);
            process.stdout.write(`\r  Downloading... ${pct}% (${mb(received)} / ${mb(total)} MB)`);
          } else {
            process.stdout.write(`\r  Downloading... ${mb(received)} MB`);
          }
        });
        res.pipe(file);
        file.on('finish', () => { file.close(); console.log(); resolve(); });
      }).on('error', (err) => { fs.unlink(dest, () => {}); reject(err); });
    };

    doGet(url);
  });
}

function mb(bytes) {
  return (bytes / 1024 / 1024).toFixed(1);
}

// --- Main ---
(async () => {
  console.log('Step 1/3 — Downloading GloVe 2024 wikigiga 50d (~290 MB)');
  console.log(`  From: ${ZIP_URL}\n`);

  await download(ZIP_URL, ZIP_PATH);

  // --- Extract ---
  console.log('Step 2/3 — Extracting vectors.txt from zip...');
  // The zip contains a single .txt file; grab whatever .txt is in there
  let zipContents;
  try {
    zipContents = execSync(`unzip -l "${ZIP_PATH}"`).toString();
  } catch {
    console.error('unzip not found. Install it or extract the zip manually to data/vectors.txt then run: node scripts/build-vocab.js');
    process.exit(1);
  }

  const txtMatch = zipContents.match(/(\S+\.txt)/);
  if (!txtMatch) {
    console.error('Could not find a .txt file inside the zip. Contents:\n', zipContents);
    process.exit(1);
  }
  const innerFile = txtMatch[1].trim();
  console.log(`  Extracting ${innerFile} ...`);
  execSync(`unzip -p "${ZIP_PATH}" "${innerFile}" > "${VECTORS_PATH}"`, { stdio: ['inherit', 'inherit', 'inherit'] });
  const sizeMB = mb(fs.statSync(VECTORS_PATH).size);
  console.log(`  Extracted (${sizeMB} MB)\n`);

  // --- Build vocab ---
  console.log('Step 3/3 — Building vocab.json from the 2000-word list...');
  execSync(`VECTORS_PATH="${VECTORS_PATH}" node "${path.join(__dirname, 'build-vocab.js')}"`, { stdio: 'inherit' });

  // --- Cleanup ---
  console.log('\nCleaning up zip and raw vectors...');
  fs.unlinkSync(ZIP_PATH);
  fs.unlinkSync(VECTORS_PATH);

  console.log('\nDone! Start the server with:  npm start');
})();
