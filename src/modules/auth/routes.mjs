import { Router } from 'express';
import { ACCESS_COOKIE, REFRESH_COOKIE, requireUser } from './middleware.mjs';
import { loginPage } from './pages.mjs';
import { ACCESS_TTL, issueTokens, login, publicUser, REFRESH_TTL, refresh, register } from './service.mjs';

const cookieOptions = { httpOnly: true, sameSite: 'lax' };

function setSession(res, tokens) {
  res.cookie(ACCESS_COOKIE, tokens.access, { ...cookieOptions, maxAge: ACCESS_TTL * 1000 });
  res.cookie(REFRESH_COOKIE, tokens.refresh, { ...cookieOptions, maxAge: REFRESH_TTL * 1000 });
}

export const api = Router();

api.post('/register', (req, res) => {
  const user = register(req.body);
  setSession(res, issueTokens(user));
  res.status(201).json({ user: publicUser(user) });
});

api.post('/login', (req, res) => {
  const user = login(req.body);
  setSession(res, issueTokens(user));
  res.json({ user: publicUser(user) });
});

api.post('/refresh', (req, res) => {
  const { user, tokens } = refresh(req.cookies[REFRESH_COOKIE]);
  setSession(res, tokens);
  res.json({ user: publicUser(user) });
});

api.post('/logout', (req, res) => {
  res.clearCookie(ACCESS_COOKIE);
  res.clearCookie(REFRESH_COOKIE);
  res.json({ ok: true });
});

api.get('/me', requireUser, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export const pages = Router();

pages.get('/login', (req, res) => {
  if (req.user) return res.redirect(safeNext(req.query.next));
  res.send(loginPage(req, { next: safeNext(req.query.next) }));
});

function safeNext(next) {
  return typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : '/';
}
