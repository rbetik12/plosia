import { Router } from 'express';
import { notFound } from '../../lib/errors.mjs';
import { catalogPage, catPage } from './pages.mjs';
import { toCatCard, toFoodCard } from './dto.mjs';
import { findCatBySlug, listCats, listFood } from './service.mjs';

export const api = Router();

api.get('/cats', (req, res) => {
  const items = listCats({ sort: req.query.sort });
  res.json({ items: items.map(toCatCard), total: items.length });
});

api.get('/food', (req, res) => {
  const items = listFood({ sort: req.query.sort });
  res.json({ items: items.map(toFoodCard), total: items.length });
});

export const pages = Router();

pages.get('/cats', (req, res) => res.send(catalogPage(req, 'cats')));
pages.get('/food', (req, res) => res.send(catalogPage(req, 'food')));

pages.get('/cats/:slug', (req, res) => {
  const cat = findCatBySlug(req.params.slug);
  if (!cat) throw notFound('Такого котика у нас нет. Может, он уже нашёл дом?');
  res.send(catPage(req, cat));
});
