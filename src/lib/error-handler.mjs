import * as Sentry from '@sentry/node';
import { HttpError } from './errors.mjs';
import { errorPage } from '../views/pages/error.mjs';

export function notFoundHandler(req, res, next) {
  next(new HttpError(404, 'There is no such page. Maybe a cat dragged it away.', 'not_found'));
}

export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) {
    console.error(`[${req.method} ${req.originalUrl}]`, err);
    Sentry.withScope((scope) => {
      scope.setTag('http.status_code', String(status));
      scope.setContext('response', { status_code: status });
      Sentry.captureException(err);
    });
  }
  if (res.headersSent) return next(err);

  const message = status >= 500 ? 'Something went wrong. We are already looking into it.' : err.message;

  if (req.originalUrl.startsWith('/api/')) {
    return res.status(status).json({
      error: { code: status >= 500 ? 'internal' : err.code || 'error', message },
    });
  }
  res.status(status).send(errorPage(req, { status, message }));
}
