export class HttpError extends Error {
  constructor(status, message, code = 'error') {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
  }
}

export const badRequest = (message, code = 'bad_request') => new HttpError(400, message, code);
export const unauthorized = (message = 'Нужно войти', code = 'unauthorized') => new HttpError(401, message, code);
export const forbidden = (message = 'Нет доступа', code = 'forbidden') => new HttpError(403, message, code);
export const notFound = (message = 'Не найдено', code = 'not_found') => new HttpError(404, message, code);
export const conflict = (message, code = 'conflict') => new HttpError(409, message, code);
