// Lightweight local dev proxy for Sarvam TTS
// Usage: node scripts/dev-tts-proxy.mjs
// Requires env: SARVAM_API_KEY

import http from 'node:http';

const PORT = process.env.TTS_PROXY_PORT ? Number(process.env.TTS_PROXY_PORT) : 8787;
const API_KEY = process.env.SARVAM_API_KEY;

if (!API_KEY) {
  console.error('[TTS Proxy] Missing SARVAM_API_KEY in environment.');
}

const server = http.createServer(async (req, res) => {
  // Only handle POST /api/sarvam-tts
  if (req.method === 'OPTIONS') {
    // CORS preflight
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  if (req.url !== '/api/sarvam-tts' || req.method !== 'POST') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
    return;
  }

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const bodyStr = Buffer.concat(chunks).toString('utf8');
    let payload;
    try {
      payload = JSON.parse(bodyStr || '{}');
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
      return;
    }

    const resp = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': API_KEY || '',
      },
      body: JSON.stringify({
        enable_preprocessing: true,
        target_language_code: 'kn-IN',
        ...payload,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      res.writeHead(502, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ error: 'Sarvam API error', status: resp.status, details: text }));
      return;
    }

    const data = await resp.json();
    const audio = Array.isArray(data?.audios) ? data.audios[0] : null;
    if (!audio) {
      res.writeHead(502, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ error: 'No audio returned' }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ request_id: data.request_id ?? null, audio }));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ error: 'Proxy failure', message: String(err) }));
  }
});

server.listen(PORT, () => {
  console.log(`[TTS Proxy] Listening on http://localhost:${PORT}/api/sarvam-tts`);
});
