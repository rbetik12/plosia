// Loaded before everything else: node --import ./src/instrument.mjs
// Do not import express or application modules here: Sentry must load before them.
import * as Sentry from '@sentry/node';
import { config } from './config.mjs';

if (config.sentry.dsn) {
  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.sentry.environment,
    release: `plosia@${config.version}`,
    sendDefaultPii: false,
    serverName: process.env.SENTRY_SERVER_NAME || 'plosia-web-1',
    // We do not collect traces, but tracing must be enabled —
    // otherwise the transaction name would be the raw URL, not the Express route.
    tracesSampleRate: 0,
    integrations: (defaults) => [
      // Dedupe drops an identical error if it repeats in a row — even for different customers.
      // We need to see every affected customer, so we turn it off.
      ...defaults.filter((i) => i.name !== 'Express' && i.name !== 'Dedupe'),
      // We send errors ourselves from errorHandler: that is where the HTTP status of the response is known.
      Sentry.expressIntegration({ shouldHandleError: () => false }),
    ],
    beforeSend(event) {
      if (event.transaction) event.tags = { ...event.tags, endpoint: event.transaction };
      return event;
    },
  });
}
