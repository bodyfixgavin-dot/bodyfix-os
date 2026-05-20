export function requireAdmin(req, res) {
  const expected = process.env.BODYFIX_ADMIN_TOKEN;

  if (!expected) {
    res.status(500).json({
      ok: false,
      error: 'Missing BODYFIX_ADMIN_TOKEN env var'
    });
    return false;
  }

  const provided = req.headers['x-bodyfix-admin-token'];

  if (!provided || provided !== expected) {
    res.status(401).json({
      ok: false,
      error: 'Unauthorized'
    });
    return false;
  }

  return true;
}
