// JWT signing keys. The key id (kid) is written to the token header,
// so keys can be rotated: new tokens are signed with the last key,
// and tokens issued earlier are verified with the key that signed them.
//
// JWT_KEYS format: "kid1:secret1,kid2:secret2" — the last key is used for signing.
const DEFAULT_KEYS = '2026-10:plosia-dev-signing-key-2026-10';

export const SIGNING_KEYS = Object.fromEntries(
  (process.env.JWT_KEYS || DEFAULT_KEYS).split(',').map((pair) => {
    const [kid, secret] = pair.split(':').map((part) => part.trim());
    return [kid, { kid, secret }];
  }),
);

export function currentKey() {
  return Object.values(SIGNING_KEYS).at(-1);
}
