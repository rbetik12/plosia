// Режим посева для scripts/seed-sentry.mjs (PLOSIA_SEED_MODE=1).
// События получают время и релиз из заголовков запроса — так история ошибок
// раскладывается по последним дням. В обычном режиме этот код не подключается.
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
        // Посев идёт через локальный сервер, а в Sentry события должны выглядеть как с продакшена.
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
