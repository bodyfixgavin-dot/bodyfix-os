const DEFAULT_ALLOWED_ORIGINS = [
  'https://bodyfix-tw.netlify.app',
  'https://bodyfix-clinic.vercel.app',
  'http://localhost:3000'
];

function getAllowedOrigins() {
  const raw = process.env.ALLOWED_ORIGINS;
  if (!raw) return DEFAULT_ALLOWED_ORIGINS;
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function applyCors(req, res) {
  const allowedOrigins = getAllowedOrigins();
  const origin = req.headers.origin;
  const allowOrigin = origin && allowedOrigins.includes(origin)
    ? origin
    : 'https://bodyfix-tw.netlify.app';

  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-BodyFix-Admin-Token');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }

  return false;
}

export function methodNotAllowed(res, allowed = ['GET']) {
  res.setHeader('Allow', allowed.join(', '));
  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
