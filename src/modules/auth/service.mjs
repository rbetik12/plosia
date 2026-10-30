import crypto from 'node:crypto';
import { SEED_USERS } from '../../data/users.mjs';
import { badRequest, conflict, HttpError, unauthorized } from '../../lib/errors.mjs';
import { signToken, TokenError, verifyToken } from '../../lib/jwt.mjs';
import { currentKey, SIGNING_KEYS } from './keys.mjs';

export const ACCESS_TTL = 15 * 60;
export const REFRESH_TTL = 30 * 24 * 60 * 60;

const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;

const users = new Map();
const byEmail = new Map();
let nextId = 2000;

for (const seed of SEED_USERS) {
  const { password, ...user } = seed;
  save({ ...user, passwordHash: hashPassword(password) });
}

export function findUserById(id) {
  return users.get(id);
}

export function publicUser(user) {
  return { id: user.id, email: user.email, name: user.name };
}

export function register({ email, password, name }) {
  const normalized = normalizeEmail(email);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalized)) throw badRequest('Check the email address', 'bad_email');
  if (String(password || '').length < 8) throw badRequest('Password must be at least 8 characters', 'weak_password');
  if (!String(name || '').trim()) throw badRequest('What is your name?', 'name_required');
  if (byEmail.has(normalized)) throw conflict('This email is already registered', 'email_taken');

  return save({
    id: `u-${nextId++}`,
    email: normalized,
    name: String(name).trim(),
    passwordHash: hashPassword(password),
  });
}

export function login({ email, password }) {
  const user = byEmail.get(normalizeEmail(email));
  if (user && isLocked(user)) {
    throw new HttpError(423, 'The account is temporarily locked. Try again later or contact support.', 'account_locked');
  }
  if (!user || !checkPassword(String(password || ''), user.passwordHash)) {
    if (user) registerFailedLogin(user);
    throw unauthorized('Wrong email or password', 'bad_credentials');
  }
  user.failedLogins = 0;
  return user;
}

function isLocked(user) {
  return Boolean(user.lockedUntil) && new Date(user.lockedUntil) > new Date();
}

// After five failed attempts in a row we lock the login for 15 minutes.
function registerFailedLogin(user) {
  user.failedLogins = (user.failedLogins || 0) + 1;
  if (user.failedLogins >= MAX_FAILED_LOGINS) {
    user.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000).toISOString();
    user.failedLogins = 0;
  }
}

export function issueTokens(user) {
  return {
    access: signToken({ sub: user.id, type: 'access' }, currentKey(), ACCESS_TTL),
    refresh: signToken({ sub: user.id, type: 'refresh' }, currentKey(), REFRESH_TTL),
  };
}

export function verifyAccess(token) {
  const payload = verifyToken(token, SIGNING_KEYS);
  if (payload.type !== 'access') throw new TokenError('wrong_type');
  return payload;
}

export function refresh(token) {
  let payload;
  try {
    payload = verifyToken(token, SIGNING_KEYS);
  } catch (err) {
    if (err instanceof TokenError) throw unauthorized('Your session has expired, please log in again', 'session_expired');
    throw err;
  }
  const user = payload.type === 'refresh' && users.get(payload.sub);
  if (!user) throw unauthorized('Your session has expired, please log in again', 'session_expired');
  return { user, tokens: issueTokens(user) };
}

function save(user) {
  users.set(user.id, user);
  byEmail.set(user.email, user);
  return user;
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return `${salt}:${crypto.scryptSync(password, salt, 32).toString('hex')}`;
}

function checkPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  return crypto.timingSafeEqual(crypto.scryptSync(password, salt, 32), Buffer.from(hash, 'hex'));
}
