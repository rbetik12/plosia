import express from 'express';
import { config } from './config.mjs';
import { cookies } from './lib/cookies.mjs';
import { errorHandler, notFoundHandler } from './lib/error-handler.mjs';
import { homePage } from './views/pages/home.mjs';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');

  app.use(express.static(`${config.root}public`, { maxAge: '1h' }));
  app.use(express.json());
  app.use(cookies());

  app.get('/healthz', (req, res) => res.json({ ok: true, version: config.version }));
  app.get('/', (req, res) => res.send(homePage(req)));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
