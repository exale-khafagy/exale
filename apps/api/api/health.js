/**
 * Minimal test endpoint: GET /api/health (or https://api.exale.net/health via rewrite).
 * If this returns 200, the api/ folder is deployed and rewrites work; the 404 issue is then the catch-all.
 */
module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', 'https://exale.net');
  res.status(200).end(JSON.stringify({ ok: true, from: 'api/health.js' }));
};
