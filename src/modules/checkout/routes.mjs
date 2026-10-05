import { Router } from 'express';
import { requirePageUser, requireUser } from '../auth/middleware.mjs';
import { getCart } from '../cart/service.mjs';
import { getUserOrder, toOrderDto } from '../orders/service.mjs';
import { checkoutPage, successPage } from './pages.mjs';
import { listPickupPoints } from './pickup.mjs';
import { CITIES, payOrder, placeOrder } from './service.mjs';

export const api = Router();

api.get('/pickup-points', (req, res) => {
  res.json({ items: listPickupPoints(String(req.query.city || '')) });
});

api.post('/', requireUser, (req, res) => {
  const order = placeOrder(req.user, getCart(req.cartId), req.body);
  res.status(201).json({ order: toOrderDto(order) });
});

api.post('/pay', requireUser, async (req, res) => {
  const order = await payOrder(req.user, req.body.orderId, req.body.card);
  res.json({ order: toOrderDto(order) });
});

export const pages = Router();

pages.get('/checkout', requirePageUser, (req, res) => {
  res.send(checkoutPage(req, { cities: CITIES }));
});

pages.get('/checkout/success', requirePageUser, (req, res) => {
  res.send(successPage(req, getUserOrder(req.user, String(req.query.order))));
});
