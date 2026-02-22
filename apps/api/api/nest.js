/**
 * Single entry for all API routes when rewrite sends to /api/nest?path=...
 * Use this if the catch-all api/[[...path]].js is not matched by Vercel (e.g. 404).
 * vercel.json must use: "destination": "/api/nest?path=$1"
 */
const nestHandler = require('../dist/src/server').default;

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://dashboard.localhost:3000',
  'https://exale.net',
  'https://www.exale.net',
  'https://hub.exale.net',
  'https://dashboard.exale.net',
  'https://api.exale.net',
];

const CORS_ALLOW_METHODS = 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS';
const CORS_ALLOW_HEADERS = [
  'Content-Type', 'Accept', 'Authorization', 'X-Requested-With', 'X-CSRF-Token',
  'Accept-Version', 'Content-Length', 'Content-MD5', 'Date', 'X-Api-Version',
  'rsc', 'next-router-state-tree', 'next-router-prefetch',
].join(', ');

function getAllowedOrigins() {
  const env = process.env.CORS_ORIGIN;
  const fromEnv = env ? env.split(',').map((o) => o.trim()).filter(Boolean) : [];
  return [...new Set([...ALLOWED_ORIGINS, ...fromEnv])];
}

function normalizeOrigin(origin) {
  if (!origin || typeof origin !== 'string') return '';
  return origin.trim().replace(/\/$/, '') || origin.trim();
}

function getPathFromRequest(req) {
  let raw = req.url || req.originalUrl || '';
  // Handle full URL (e.g. https://api.exale.net/api/nest?path=profile/me)
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    try {
      const u = new URL(raw);
      raw = u.pathname + (u.search || '');
    } catch (_) {}
  }
  try {
    const q = raw.indexOf('?');
    const query = q >= 0 ? raw.slice(q + 1) : '';
    const params = new URLSearchParams(query);
    let path = params.get('path') || '';
    if (!path && raw.startsWith('/api/nest')) {
      // Fallback: path might be in pathname on some runtimes
      const pathname = raw.slice(0, q >= 0 ? q : raw.length).replace(/^\/api\/nest\/?/, '') || '';
      path = pathname ? decodeURIComponent(pathname) : '';
    }
    path = path ? decodeURIComponent(path) : path;
    const pathNormalized = path.startsWith('/') ? path : '/' + (path || '');
    const rest = Array.from(params.entries()).filter(([k]) => k !== 'path');
    const restQuery = rest.length ? new URLSearchParams(rest).toString() : '';
    return restQuery ? pathNormalized + '?' + restQuery : pathNormalized;
  } catch (_) {
    return '/';
  }
}

module.exports = async function handler(req, res) {
  const method = (req.method || '').toUpperCase();
  let allowedOrigin = 'https://exale.net';
  try {
    const origins = getAllowedOrigins();
    const rawOrigin = req.headers && (req.headers.origin || req.headers.Origin);
    const requestOrigin = normalizeOrigin(rawOrigin);
    const match = requestOrigin && origins.some((o) => normalizeOrigin(o) === requestOrigin);
    allowedOrigin = match ? (origins.find((o) => normalizeOrigin(o) === requestOrigin) || requestOrigin) : 'https://exale.net';
  } catch (_) {}

  if (method === 'OPTIONS') {
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Methods', CORS_ALLOW_METHODS);
    res.setHeader('Access-Control-Allow-Headers', CORS_ALLOW_HEADERS);
    res.setHeader('Access-Control-Max-Age', '86400');
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Length', '0');
    res.end();
    return;
  }

  res.setHeader('Access-Control-Allow-Methods', CORS_ALLOW_METHODS);
  res.setHeader('Access-Control-Allow-Headers', CORS_ALLOW_HEADERS);
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin || 'https://exale.net');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  const url = getPathFromRequest(req);
  req.url = url;
  req.originalUrl = url;
  return nestHandler(req, res);
};
