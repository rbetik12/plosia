import { HttpError } from './errors.mjs';
import { errorPage } from '../views/pages/error.mjs';

export function notFoundHandler(req, res, next) {
  next(new HttpError(404, 'Такой страницы нет. Возможно, её утащил кот.', 'not_found'));
}

export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) {
    console.error(`[${req.method} ${req.originalUrl}]`, err);
  }
  if (res.headersSent) return next(err);

  const message = status >= 500 ? 'Что-то пошло не так. Мы уже разбираемся.' : err.message;

  if (req.originalUrl.startsWith('/api/')) {
    return res.status(status).json({
      error: { code: status >= 500 ? 'internal' : err.code || 'error', message },
    });
  }
  res.status(status).send(errorPage(req, { status, message }));
}
