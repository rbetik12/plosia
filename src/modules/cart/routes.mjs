import * as Sentry from '@sentry/node';
import { Router } from 'express';
import { cartPage } from './pages.mjs';
import { PromoError } from './promo.mjs';
import { addItem, applyPromo, getCart, removeItem, removePromo, summarize, updateQty } from './service.mjs';

export const api = Router();

api.get('/', (req, res) => {
  res.json(summarize(getCart(req.cartId)));
});

api.post('/items', (req, res) => {
  const cart = getCart(req.cartId);
  addItem(cart, req.body.productId, Number(req.body.qty ?? 1));
  res.status(201).json(summarize(cart));
});

api.patch('/items/:itemId', (req, res) => {
  const cart = getCart(req.cartId);
  updateQty(cart, req.params.itemId, Number(req.body.qty));
  res.json(summarize(cart));
});

api.delete('/items/:itemId', (req, res) => {
  const cart = getCart(req.cartId);
  removeItem(cart, req.params.itemId);
  res.json(summarize(cart));
});

api.post('/promo', (req, res) => {
  const cart = getCart(req.cartId);
  try {
    applyPromo(cart, req.body.code);
  } catch (err) {
    // Marketing wants to see which codes people enter and why they don't work.
    if (err instanceof PromoError) {
      Sentry.captureException(err, {
        level: 'warning',
        tags: { 'http.status_code': String(err.status), promo_code: String(req.body.code ?? '').slice(0, 32) },
      });
    }
    throw err;
  }
  res.json(summarize(cart));
});

api.delete('/promo', (req, res) => {
  const cart = getCart(req.cartId);
  removePromo(cart);
  res.json(summarize(cart));
});

export const pages = Router();

pages.get('/cart', (req, res) => res.send(cartPage(req)));
