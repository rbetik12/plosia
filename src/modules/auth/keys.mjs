// Ключи подписи JWT. Идентификатор ключа (kid) пишется в заголовок токена,
// поэтому ключи можно менять: новые токены подписываем последним ключом,
// а токены, выпущенные раньше, проверяем тем ключом, которым их подписали.
//
// Формат JWT_KEYS: "kid1:secret1,kid2:secret2" — последний ключ используется для подписи.
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
