import { Router } from 'express';
import { notFound } from '../../lib/errors.mjs';
import { catalogPage, catPage } from './pages.mjs';
import { toCatCard, toFoodCard } from './dto.mjs';
import { filterOptions, findCatBySlug, listCats, listFood } from './service.mjs';

const CAT_FILTERS = ['breed', 'color', 'sex', 'age', 'price_max', 'sort'];
const FOOD_FILTERS = ['kind', 'brand', 'age', 'price_max', 'sort'];

function pickFilters(query, allowed) {
  const filters = {};
  for (const key of allowed) {
    if (typeof query[key] === 'string' && query[key]) filters[key] = query[key];
  }
  return filters;
}

export const api = Router();

api.get('/filters', (req, res) => {
  res.json(filterOptions());
});

api.get('/cats', (req, res) => {
  const items = listCats(pickFilters(req.query, CAT_FILTERS));
  res.json({ items: items.map(toCatCard), total: items.length });
});

api.get('/food', (req, res) => {
  const items = listFood(pickFilters(req.query, FOOD_FILTERS));
  res.json({ items: items.map(toFoodCard), total: items.length });
});

export const pages = Router();

pages.get('/cats', (req, res) => res.send(catalogPage(req, 'cats', filterOptions().cats)));
pages.get('/food', (req, res) => res.send(catalogPage(req, 'food', filterOptions().food)));

pages.get('/cats/:slug', (req, res) => {
  const cat = findCatBySlug(req.params.slug);
  if (!cat) throw notFound('We have no such cat. Maybe he has already found a home?');
  res.send(catPage(req, cat));
});
