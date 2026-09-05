import crypto from 'node:crypto';

const COOKIE = 'plosia_cart';
const MAX_AGE = 30 * 24 * 60 * 60 * 1000;

export function cartSession(req, res, next) {
  let id = req.cookies[COOKIE];
  if (!id) {
    id = crypto.randomUUID();
    res.cookie(COOKIE, id, { httpOnly: true, sameSite: 'lax', maxAge: MAX_AGE });
  }
  req.cartId = id;
  next();
}
