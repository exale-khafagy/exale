/**
 * Vercel serverless entry. Rewrites send /health etc. to /api/health;
 * we strip the /api prefix so Nest receives /profile/me etc.
 * req.url can be path-only ("/api/profile/me") or full URL ("https://api.exale.net/api/profile/me").
 * OPTIONS preflight is handled here so the response always includes CORS headers (fixes Vercel CORS issues).
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
  return [...new Set([...fromEnv, ...ALLOWED_ORIGINS])];
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
  const origins = getAllowedOrigins();
  const requestOrigin = req.headers && (req.headers.origin || req.headers.Origin);
  const allowedOrigin = requestOrigin && origins.includes(requestOrigin) ? requestOrigin : null;

  // Handle OPTIONS preflight so the response always has CORS headers (avoids "No Access-Control-Allow-Origin" on Vercel)
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Methods', CORS_ALLOW_METHODS);
    res.setHeader('Access-Control-Allow-Headers', CORS_ALLOW_HEADERS);
    res.setHeader('Access-Control-Max-Age', '86400');
    if (allowedOrigin) {
      res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    res.end();
    return;
  }

  // Set CORS on actual requests too so response has correct Allow-Origin (Vercel may not use Nest's headers)
  res.setHeader('Access-Control-Allow-Methods', CORS_ALLOW_METHODS);
  res.setHeader('Access-Control-Allow-Headers', CORS_ALLOW_HEADERS);
  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

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
