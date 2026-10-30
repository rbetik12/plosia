// Seed mode for scripts/seed-sentry.mjs (PLOSIA_SEED_MODE=1).
// Events take their timestamp and release from the request headers, so the error history
// is spread across the last few days. This code is not loaded in normal mode.
import * as Sentry from '@sentry/node';
import { Router } from 'express';

export const seedMode = process.env.PLOSIA_SEED_MODE === '1';

export function seedRouter() {
  const router = Router();

  router.use((req, res, next) => {
    const ts = Number(req.get('x-seed-ts'));
    const release = req.get('x-seed-release');
    if (ts) {
      Sentry.getIsolationScope().addEventProcessor((event) => {
        event.timestamp = ts;
        if (release) event.release = release;
        // Seeding goes through a local server, but in Sentry the events must look like they came from production.
        if (event.request?.url) event.request.url = event.request.url.replace(/^https?:\/\/[^/]+/, 'https://plosia.shop');
        if (event.request?.headers) event.request.headers.host = 'plosia.shop';
        return event;
      });
    }
    next();
  });

  router.post('/__seed/flush', async (req, res) => {
    res.json({ flushed: await Sentry.flush(30000) });
  });

  return router;
}
