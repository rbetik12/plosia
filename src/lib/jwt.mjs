import crypto from 'node:crypto';

export class TokenError extends Error {
  constructor(reason) {
    super(`Invalid token: ${reason}`);
    this.name = 'TokenError';
    this.reason = reason;
  }
}

const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
const hmac = (data, secret) => crypto.createHmac('sha256', secret).update(data).digest('base64url');

export function signToken(payload, secret, ttlSeconds) {
  const now = Math.floor(Date.now() / 1000);
  const data = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ ...payload, iat: now, exp: now + ttlSeconds })}`;
  return `${data}.${hmac(data, secret)}`;
}

export function decodeToken(token) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) throw new TokenError('malformed');
  try {
    return {
      header: JSON.parse(Buffer.from(parts[0], 'base64url')),
      payload: JSON.parse(Buffer.from(parts[1], 'base64url')),
      data: `${parts[0]}.${parts[1]}`,
      signature: parts[2],
    };
  } catch {
    throw new TokenError('malformed');
  }
}

export function verifyToken(token, secret) {
  const { payload, data, signature } = decodeToken(token);
  const expected = Buffer.from(hmac(data, secret));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
    throw new TokenError('bad_signature');
  }
  if (payload.exp <= Math.floor(Date.now() / 1000)) throw new TokenError('expired');
  return payload;
}
