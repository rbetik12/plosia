import { CATS } from '../../data/cats.mjs';
import { FOOD } from '../../data/food.mjs';

const products = new Map([...CATS, ...FOOD].map((p) => [p.id, p]));

export function findProduct(id) {
  return products.get(id);
}

export function findCatBySlug(slug) {
  return CATS.find((cat) => cat.slug === slug);
}

export function listCats({ sort } = {}) {
  return sortItems(CATS, sort);
}

export function listFood({ sort } = {}) {
  return sortItems(FOOD, sort);
}

export function featuredCats(limit = 6) {
  return CATS.filter((cat) => cat.featured).slice(0, limit);
}

function sortItems(items, sort) {
  const sorted = [...items];
  if (sort === 'price_asc') sorted.sort((a, b) => a.price - b.price);
  if (sort === 'price_desc') sorted.sort((a, b) => b.price - a.price);
  return sorted;
}
