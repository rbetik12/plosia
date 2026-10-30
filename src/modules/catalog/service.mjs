import { BREEDS, CAT_COLORS, CATS } from '../../data/cats.mjs';
import { BRANDS, FOOD, FOOD_KINDS } from '../../data/food.mjs';
import { cached, filtersKey } from './cache.mjs';

// Discontinued items stay in the data (old orders refer to them), but they are not in the shop.
const onSale = FOOD.filter((item) => !item.discontinued);
const products = new Map([...CATS, ...onSale].map((p) => [p.id, p]));

export const AGE_GROUPS = [
  { id: 'kitten', title: 'Kittens', food: 'For kittens' },
  { id: 'adult', title: 'Adults', food: 'For adults' },
  { id: 'senior', title: 'Wise (8+)', food: 'For seniors' },
];

export function ageGroup(months) {
  if (months < 12) return 'kitten';
  if (months < 96) return 'adult';
  return 'senior';
}

export function findProduct(id) {
  return products.get(id);
}

export function findCatBySlug(slug) {
  return CATS.find((cat) => cat.slug === slug);
}

export function listCats(filters = {}) {
  return cached(filtersKey(filters), () => {
    const items = CATS.filter(
      (cat) =>
        (!filters.breed || cat.breed.id === filters.breed) &&
        (!filters.color || cat.color === filters.color) &&
        (!filters.sex || cat.sex === filters.sex) &&
        (!filters.age || ageGroup(cat.ageMonths) === filters.age) &&
        (!filters.price_max || cat.price <= Number(filters.price_max)),
    );
    return sortItems(items, filters.sort);
  });
}

export function listFood(filters = {}) {
  return cached(filtersKey(filters), () => {
    const items = onSale.filter(
      (item) =>
        (!filters.kind || item.kind === filters.kind) &&
        (!filters.brand || item.brand.id === filters.brand) &&
        (!filters.age || item.age === filters.age) &&
        (!filters.price_max || item.price <= Number(filters.price_max)),
    );
    return sortItems(items, filters.sort);
  });
}

export function filterOptions() {
  return {
    cats: {
      breeds: Object.values(BREEDS),
      colors: Object.entries(CAT_COLORS).map(([id, title]) => ({ id, title })),
      ages: AGE_GROUPS.map(({ id, title }) => ({ id, title })),
    },
    food: {
      kinds: Object.entries(FOOD_KINDS).map(([id, title]) => ({ id, title })),
      brands: Object.values(BRANDS),
      ages: AGE_GROUPS.map(({ id, food }) => ({ id, title: food })),
    },
  };
}

export function featuredCats(limit = 6) {
  return CATS.filter((cat) => cat.featured).slice(0, limit);
}

function sortItems(items, sort) {
  const sorted = [...items];
  if (sort === 'price_asc') sorted.sort((a, b) => a.price - b.price);
  if (sort === 'price_desc') sorted.sort((a, b) => b.price - a.price);
  if (sort === 'new') sorted.sort((a, b) => Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)));
  return sorted;
}
