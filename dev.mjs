// Local dev server — mirrors production path structure:
//   /          → frontend/
//   /admin/    → admin/   (assets at /admin/assets/*)
//   /admin/api → Express API (admin-api/src/server.js logic)
import { createServer } from 'http';
import { createReadStream, existsSync, statSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRONTEND = join(__dirname, 'frontend');
const ADMIN = join(__dirname, 'admin');
const PORT = 5173;

const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
  '.json': 'application/json',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
  '.ttf':  'font/ttf',
};

function serveStatic(res, filePath, fallbackIndex) {
  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = fallbackIndex;
  }
  if (!existsSync(filePath)) {
    res.writeHead(404); res.end('Not found'); return;
  }
  const mime = MIME[extname(filePath)] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': mime });
  createReadStream(filePath).pipe(res);
}

// ── API proxy to admin-api on :3030 ─────────────────────────────────────────
import { request as httpRequest } from 'http';

function proxyToApi(req, res) {
  const opts = {
    hostname: '127.0.0.1',
    port: 3030,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: '127.0.0.1:3030' },
  };
  const proxy = httpRequest(opts, (apiRes) => {
    res.writeHead(apiRes.statusCode, apiRes.headers);
    apiRes.pipe(res);
  });
  proxy.on('error', () => { res.writeHead(502); res.end('API unavailable'); });
  req.pipe(proxy);
}

// ── Main router ──────────────────────────────────────────────────────────────
const server = createServer((req, res) => {
  const url = req.url.split('?')[0];

  if (url.startsWith('/admin/api')) {
    return proxyToApi(req, res);
  }

  if (url.startsWith('/admin')) {
    // Strip /admin prefix to get file path within admin/
    const sub = url.slice('/admin'.length) || '/';
    const filePath = join(ADMIN, sub === '/' ? 'index.html' : sub);
    return serveStatic(res, filePath, join(ADMIN, 'index.html'));
  }

  // Frontend (SPA — fall back to index.html for client-side routes)
  const filePath = join(FRONTEND, url === '/' ? 'index.html' : url);
  serveStatic(res, filePath, join(FRONTEND, 'index.html'));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`FinLingvo dev server → http://127.0.0.1:${PORT}`);
  console.log(`  Frontend  → http://127.0.0.1:${PORT}/`);
  console.log(`  Admin     → http://127.0.0.1:${PORT}/admin/`);
  console.log(`  API       → http://127.0.0.1:${PORT}/admin/api/`);
});
