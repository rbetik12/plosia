// Подключается раньше всего остального: node --import ./src/instrument.mjs
import * as Sentry from '@sentry/node';
import { config } from './config.mjs';

if (config.sentry.dsn) {
  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.sentry.environment,
    release: `plosia@${config.version}`,
    sendDefaultPii: false,
    // Ошибки отправляем сами из errorHandler: там известен HTTP-статус ответа.
    integrations: [Sentry.expressIntegration({ shouldHandleError: () => false })],
    beforeSend(event) {
      if (event.transaction) event.tags = { ...event.tags, endpoint: event.transaction };
      return event;
    },
  });
}
