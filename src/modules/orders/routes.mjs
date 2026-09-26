import { Router } from 'express';
import { requirePageUser, requireUser } from '../auth/middleware.mjs';
import { accountPage, orderPage } from './pages.mjs';
import { buildReceipt } from './receipt.mjs';
import { getUserOrder, listUserOrders, toOrderDto } from './service.mjs';

export const api = Router();

api.get('/', requireUser, (req, res) => {
  res.json({ items: listUserOrders(req.user.id).map(toOrderDto) });
});

api.get('/:id', requireUser, (req, res) => {
  res.json({ order: toOrderDto(getUserOrder(req.user, req.params.id)) });
});

api.get('/:id/receipt', requireUser, (req, res) => {
  res.json({ receipt: buildReceipt(getUserOrder(req.user, req.params.id)) });
});

export const pages = Router();

pages.get('/account', requirePageUser, (req, res) => {
  res.send(accountPage(req, listUserOrders(req.user.id)));
});

pages.get('/account/orders/:id', requirePageUser, (req, res) => {
  res.send(orderPage(req, getUserOrder(req.user, req.params.id)));
});
