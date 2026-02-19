/**
 * Vercel serverless entry. Rewrites send /health etc. to /api/health;
 * we strip the /api prefix so Nest receives /health.
 */
const nestHandler = require('../dist/src/server').default;

module.exports = async function handler(req, res) {
  const originalUrl = req.url || req.originalUrl || '/';
  const path = originalUrl.replace(/^\/api/, '') || '/';
  req.url = path;
  req.originalUrl = path;
  return nestHandler(req, res);
};
