/**
 * Vercel serverless entry. Rewrites send /health etc. to /api/health;
 * we strip the /api prefix so Nest receives /profile/me etc.
 * req.url can be path-only ("/api/profile/me") or full URL ("https://api.exale.net/api/profile/me").
 */
const nestHandler = require('../dist/src/server').default;

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
