/**
 * Edge Middleware: handle CORS preflight (OPTIONS) at the edge with 200 + CORS headers.
 * This runs before Deployment Protection, so OPTIONS get a proper response even when
 * the project has password/Vercel Auth enabled (no OPTIONS Allowlist needed).
 */
import { next } from '@vercel/functions';

const DEFAULT_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://dashboard.localhost:3000',
  'https://exale.net',
  'https://www.exale.net',
  'https://hub.exale.net',
  'https://dashboard.exale.net',
  'https://api.exale.net',
];

function getAllowedOrigins() {
  const fromEnv =
    typeof process !== 'undefined' && process.env && process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
          .map((o) => o.trim())
          .filter(Boolean)
      : [];
  return [...new Set([...fromEnv, ...DEFAULT_ORIGINS])];
}

const CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type,Accept,Authorization,X-Requested-With,X-CSRF-Token,Accept-Version,Content-Length,Content-MD5,Date,X-Api-Version,rsc,next-router-state-tree,next-router-prefetch',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true',
};

export default function middleware(request) {
  if ((request.method || '').toUpperCase() === 'OPTIONS') {
    const origin = request.headers.get('origin') || request.headers.get('Origin');
    const origins = getAllowedOrigins();
    const allowOrigin =
      (origin && origins.includes(origin)) ? origin : 'https://exale.net';
    return new Response(null, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Access-Control-Allow-Origin': allowOrigin,
        'Content-Length': '0',
      },
    });
  }
  return next();
}
