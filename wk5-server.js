#!/usr/bin/env node
'use strict';

// Local proxy for the wk5 AI dialogue app — routes through Amazon Bedrock.
//
// Usage:
//   AWS_ACCESS_KEY_ID=...  AWS_SECRET_ACCESS_KEY=...  AWS_REGION=us-east-1  node wk5-server.js
//
// Install deps first (one-time):
//   npm install @aws-sdk/client-bedrock-runtime

const http  = require('http');
const fs    = require('fs');
const path  = require('path');

// Load .env file if present (simple key=value parser, no extra dependency)
try {
  const envPath = path.join(__dirname, '.env');
  fs.readFileSync(envPath, 'utf-8')
    .split('\n')
    .forEach(line => {
      const m = line.match(/^\s*([\w_]+)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    });
} catch(_) {}

const { BedrockRuntimeClient, InvokeModelWithResponseStreamCommand } = require('@aws-sdk/client-bedrock-runtime');

const PORT   = 3000;
const STATIC = __dirname;

// Model ID — Claude Haiku on Bedrock.
// If your region uses cross-region inference, prefix with e.g. "us."
const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0';

const client = new BedrockRuntimeClient({
  region:      process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    ...(process.env.AWS_SESSION_TOKEN ? { sessionToken: process.env.AWS_SESSION_TOKEN } : {}),
  } : undefined, // falls back to default credential chain (env, ~/.aws, IAM role, etc.)
});

// ── static file server ──────────────────────────────────────────────────────

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
};

function serveStatic(req, res) {
  const filePath = path.join(STATIC, req.url === '/' ? '/wk5.html' : req.url);
  const ext      = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

// ── /api/chat ────────────────────────────────────────────────────────────────
// POST body: { system: string, messages: [{role, content}, ...] }
// Streams back SSE: data: {"text": "..."} ... data: [DONE]

async function apiChat(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    let payload;
    try { payload = JSON.parse(body); } catch(e) {
      res.writeHead(400); res.end('Bad JSON'); return;
    }

    res.writeHead(200, {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    const bedrockBody = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens:        200,
      system:            payload.system,
      messages:          payload.messages,
    };

    const command = new InvokeModelWithResponseStreamCommand({
      modelId:     MODEL_ID,
      contentType: 'application/json',
      accept:      'application/json',
      body:        JSON.stringify(bedrockBody),
    });

    try {
      const response = await client.send(command);
      for await (const event of response.body) {
        if (!event.chunk?.bytes) continue;
        const evt = JSON.parse(Buffer.from(event.chunk.bytes).toString('utf-8'));
        if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
          res.write(`data: ${JSON.stringify({ text: evt.delta.text })}\n\n`);
        } else if (evt.type === 'message_stop') {
          break;
        }
      }
      res.write('data: [DONE]\n\n');
      res.end();
    } catch(e) {
      console.error('Bedrock error:', e);
      res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`);
      res.end();
    }
  });
}

// ── router ───────────────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' });
    res.end(); return;
  }
  if (req.method === 'POST' && req.url === '/api/chat') { apiChat(req, res); return; }
  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`\n  ✦ AI DIALOGUE running at http://localhost:${PORT}/wk5.html\n`);
  console.log(`  Model: ${MODEL_ID}`);
  console.log(`  Region: ${process.env.AWS_REGION || 'us-east-1'}\n`);
  if (!process.env.AWS_ACCESS_KEY_ID) {
    console.warn('  ⚠  AWS_ACCESS_KEY_ID not set — will try default credential chain.\n');
  }
});
