/**
 * Vercel serverless entry. Rewrites send /health etc. to /api/health;
 * we strip the /api prefix so Nest receives /health.
 */
const nestHandler = require('../dist/src/server').default;

module.exports = async function handler(req, res) {
  const full = req.url || req.originalUrl || '/';
  const [pathPart, queryPart] = full.split('?');
  let raw = pathPart || '/';
  // Strip /api or api so Nest receives /profile/me not /api/profile/me
  if (raw.startsWith('/api/')) raw = raw.slice(4);
  else if (raw.startsWith('/api')) raw = raw.slice(4);
  else if (raw.startsWith('api/')) raw = raw.slice(3);
  else if (raw === 'api') raw = '';
  const path = raw ? (raw.startsWith('/') ? raw : '/' + raw) : '/';
  const url = queryPart ? path + '?' + queryPart : path;
  req.url = url;
  req.originalUrl = url;
  return nestHandler(req, res);
};
