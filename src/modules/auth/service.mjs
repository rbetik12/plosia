import crypto from 'node:crypto';
import { config } from '../../config.mjs';
import { SEED_USERS } from '../../data/users.mjs';
import { badRequest, conflict, unauthorized } from '../../lib/errors.mjs';
import { signToken, TokenError, verifyToken } from '../../lib/jwt.mjs';

export const ACCESS_TTL = 15 * 60;
export const REFRESH_TTL = 30 * 24 * 60 * 60;

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
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalized)) throw badRequest('Проверьте почту', 'bad_email');
  if (String(password || '').length < 8) throw badRequest('Пароль — минимум 8 символов', 'weak_password');
  if (!String(name || '').trim()) throw badRequest('Как вас зовут?', 'name_required');
  if (byEmail.has(normalized)) throw conflict('Такая почта уже зарегистрирована', 'email_taken');

  return save({
    id: `u-${nextId++}`,
    email: normalized,
    name: String(name).trim(),
    passwordHash: hashPassword(password),
  });
}

export function login({ email, password }) {
  const user = byEmail.get(normalizeEmail(email));
  if (!user || !checkPassword(String(password || ''), user.passwordHash)) {
    throw unauthorized('Неверная почта или пароль', 'bad_credentials');
  }
  return user;
}

export function issueTokens(user) {
  return {
    access: signToken({ sub: user.id, type: 'access' }, config.jwtSecret, ACCESS_TTL),
    refresh: signToken({ sub: user.id, type: 'refresh' }, config.jwtSecret, REFRESH_TTL),
  };
}

export function verifyAccess(token) {
  const payload = verifyToken(token, config.jwtSecret);
  if (payload.type !== 'access') throw new TokenError('wrong_type');
  return payload;
}

export function refresh(token) {
  let payload;
  try {
    payload = verifyToken(token, config.jwtSecret);
  } catch (err) {
    if (err instanceof TokenError) throw unauthorized('Сессия истекла, войдите снова', 'session_expired');
    throw err;
  }
  const user = payload.type === 'refresh' && users.get(payload.sub);
  if (!user) throw unauthorized('Сессия истекла, войдите снова', 'session_expired');
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
