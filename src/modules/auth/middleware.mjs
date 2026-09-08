import { unauthorized } from '../../lib/errors.mjs';
import { findUserById, verifyAccess } from './service.mjs';

export const ACCESS_COOKIE = 'plosia_at';
export const REFRESH_COOKIE = 'plosia_rt';

export function authenticate(req, res, next) {
  req.user = null;
  const token = req.cookies[ACCESS_COOKIE];
  if (token) {
    try {
      req.user = findUserById(verifyAccess(token).sub) ?? null;
    } catch {
      req.user = null;
    }
  }
  // Access-токен живёт 15 минут; если остался refresh, фронт обновит сессию сам.
  req.authExpired = !req.user && Boolean(req.cookies[REFRESH_COOKIE]);
  next();
}

export function requireUser(req, res, next) {
  if (!req.user) throw unauthorized();
  next();
}

export function requirePageUser(req, res, next) {
  if (!req.user) return res.redirect(`/login?next=${encodeURIComponent(req.originalUrl)}`);
  next();
}
