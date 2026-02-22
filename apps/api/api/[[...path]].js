/**
 * Vercel serverless entry. Rewrites send /health etc. to /api/health;
 * we strip the /api prefix so Nest receives /profile/me etc.
 * req.url can be path-only ("/api/profile/me") or full URL ("https://api.exale.net/api/profile/me").
 * OPTIONS preflight is handled here so the response always includes CORS headers (fixes Vercel CORS issues).
 *
 * If you see "preflight doesn't pass access control check: It does not have HTTP ok status",
 * enable OPTIONS Allowlist in Vercel: Project → Settings → Deployment Protection →
 * OPTIONS Allowlist → Enable → Add path "/" → Save. Otherwise OPTIONS are blocked (403) before this handler runs.
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
  'Content-Type',
  'Accept',
  'Authorization',
  'X-Requested-With',
  'X-CSRF-Token',
  'Accept-Version',
  'Content-Length',
  'Content-MD5',
  'Date',
  'X-Api-Version',
  'rsc',
  'next-router-state-tree',
  'next-router-prefetch',
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

function getPathAndQuery(full) {
  if (!full || typeof full !== 'string') return { path: '/', query: '' };
  let pathPart = full;
  let queryPart = '';
  const q = full.indexOf('?');
  if (q !== -1) {
    pathPart = full.slice(0, q);
    queryPart = full.slice(q + 1);
  }
  // If it looks like a full URL, take only the pathname
  try {
    if (pathPart.startsWith('http://') || pathPart.startsWith('https://')) {
      const u = new URL(pathPart);
      pathPart = u.pathname || '/';
    }
  } catch (_) {}
  return { path: pathPart || '/', query: queryPart };
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

  // Handle OPTIONS preflight first (case-insensitive); use 200 so edge never returns non-OK
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

  // Set CORS on actual requests too so response has correct Allow-Origin (Vercel may not use Nest's headers)
  res.setHeader('Access-Control-Allow-Methods', CORS_ALLOW_METHODS);
  res.setHeader('Access-Control-Allow-Headers', CORS_ALLOW_HEADERS);
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin || 'https://exale.net');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  const raw = req.url || req.originalUrl || '';
  const { path: pathPart, query: queryPart } = getPathAndQuery(raw);
  let path = pathPart;
  // Strip /api or api so Nest receives /profile/me not /api/profile/me
  if (path.startsWith('/api/')) path = path.slice(4);
  else if (path === '/api') path = '/';
  else if (path.startsWith('/api')) path = path.slice(4);
  else if (path.startsWith('api/')) path = '/' + path.slice(3);
  else if (path === 'api') path = '/';
  if (!path.startsWith('/')) path = '/' + path;
  const url = queryPart ? path + '?' + queryPart : path;
  req.url = url;
  req.originalUrl = url;
  return nestHandler(req, res);
};
