import jwt from 'jsonwebtoken';
import { timingSafeEqual } from 'crypto';

const SECRET = process.env.JWT_SECRET || 'dev-secret';
const PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

export function adminLogin(password) {
  const a = Buffer.from(password || '');
  const b = Buffer.from(PASSWORD);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return jwt.sign({ role: 'admin' }, SECRET, { expiresIn: '7d' });
}

// Back-compat for older import paths.
export const login = adminLogin;

export function signUserToken(user) {
  return jwt.sign({ role: 'user', sub: user.id, name: user.name }, SECRET, { expiresIn: '30d' });
}

function readToken(req) {
  const h = req.headers.authorization || '';
  return h.startsWith('Bearer ') ? h.slice(7) : null;
}

export function requireAdmin(req, res, next) {
  const token = readToken(req);
  if (!token) return res.status(401).json({ error: 'unauthorized' });
  try {
    const claims = jwt.verify(token, SECRET);
    if (claims.role !== 'admin') return res.status(403).json({ error: 'forbidden' });
    req.user = claims;
    next();
  } catch {
    res.status(401).json({ error: 'invalid token' });
  }
}

export function requireUser(req, res, next) {
  const token = readToken(req);
  if (!token) return res.status(401).json({ error: 'unauthorized' });
  try {
    const claims = jwt.verify(token, SECRET);
    if (claims.role !== 'user') return res.status(403).json({ error: 'forbidden' });
    req.user = claims;
    next();
  } catch {
    res.status(401).json({ error: 'invalid token' });
  }
}

// Back-compat: existing routes use requireAuth meaning admin auth.
export const requireAuth = requireAdmin;
