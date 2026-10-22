// Подключается раньше всего остального: node --import ./src/instrument.mjs
// Не импортируйте здесь express и модули приложения: Sentry должен загрузиться раньше них.
import * as Sentry from '@sentry/node';
import { config } from './config.mjs';

if (config.sentry.dsn) {
  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.sentry.environment,
    release: `plosia@${config.version}`,
    sendDefaultPii: false,
    serverName: process.env.SENTRY_SERVER_NAME || 'plosia-web-1',
    // Трейсы не собираем, но трассировка должна быть включена —
    // иначе в названии транзакции будет сырой URL, а не маршрут Express.
    tracesSampleRate: 0,
    integrations: (defaults) => [
      // Dedupe отбрасывает одинаковую ошибку, если она повторилась подряд, — даже у разных покупателей.
      // Нам важно видеть каждого пострадавшего, поэтому выключаем.
      ...defaults.filter((i) => i.name !== 'Express' && i.name !== 'Dedupe'),
      // Ошибки отправляем сами из errorHandler: там известен HTTP-статус ответа.
      Sentry.expressIntegration({ shouldHandleError: () => false }),
    ],
    beforeSend(event) {
      if (event.transaction) event.tags = { ...event.tags, endpoint: event.transaction };
      return event;
    },
  });
}
