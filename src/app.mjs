import * as Sentry from '@sentry/node';
import express from 'express';
import { config } from './config.mjs';
import { cookies } from './lib/cookies.mjs';
import { errorHandler, notFoundHandler } from './lib/error-handler.mjs';
import { authenticate } from './modules/auth/middleware.mjs';
import * as auth from './modules/auth/routes.mjs';
import * as cart from './modules/cart/routes.mjs';
import { cartSession } from './modules/cart/session.mjs';
import * as catalog from './modules/catalog/routes.mjs';
import * as checkout from './modules/checkout/routes.mjs';
import * as mail from './modules/mail/routes.mjs';
import * as orders from './modules/orders/routes.mjs';
import { homePage } from './views/pages/home.mjs';
import * as workshop from './workshop/page.mjs';
import { seedMode, seedRouter } from './workshop/seed-mode.mjs';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');

  app.use(express.static(`${config.root}public`, { maxAge: '1h' }));
  app.use(express.json());
  app.use(cookies());
  app.use(authenticate);
  app.use(cartSession);
  app.use((req, res, next) => {
    Sentry.setUser(req.user ? { id: req.user.id, email: req.user.email } : { id: `guest:${req.cartId.slice(0, 8)}` });
    next();
  });
  if (seedMode) app.use(seedRouter());

  app.get('/healthz', (req, res) => res.json({ ok: true, version: config.version }));
  app.get('/', (req, res) => res.send(homePage(req)));

  app.use('/api/auth', auth.api);
  app.use(auth.pages);
  app.use('/api/catalog', catalog.api);
  app.use(catalog.pages);
  app.use('/api/cart', cart.api);
  app.use(cart.pages);
  app.use('/api/checkout', checkout.api);
  app.use(checkout.pages);
  app.use('/api/orders', orders.api);
  app.use(orders.pages);
  app.use(mail.pages);
  app.use(workshop.pages);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
