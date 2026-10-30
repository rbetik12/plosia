// Cache for catalog filtering results.
// Filtering on every request is expensive, and the same filter combinations are requested all the time.
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
  // Nothing to cache without filters: the full list is already at hand.
  if (!key) return compute();

  const hit = entries.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.value;

  const value = compute();
  entries.set(key, { value, expiresAt: Date.now() + TTL_MS });
  return value;
}
