// Кэш результатов фильтрации каталога.
// Фильтровать на каждый запрос дорого, а одни и те же комбинации фильтров запрашивают постоянно.
const TTL_MS = 60 * 1000;
const entries = new Map();

export function filtersKey(filters) {
  return Object.keys(filters)
    .filter((key) => filters[key])
    .sort()
    .map((key) => `${key}=${filters[key]}`)
    .join('&');
}

export function cached(key, compute) {
  // Без фильтров кэшировать нечего: полный список и так под рукой.
  if (!key) return compute();

  const hit = entries.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.value;

  const value = compute();
  entries.set(key, { value, expiresAt: Date.now() + TTL_MS });
  return value;
}
