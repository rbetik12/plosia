// Отправка писем. В демо-окружении письма не уходят наружу,
// а складываются в тестовый ящик — его видно на странице /mail.
import crypto from 'node:crypto';
import * as Sentry from '@sentry/node';
import { orderConfirmation } from './templates.mjs';

const OUTBOX_LIMIT = 50;
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 300;
// Песочница SMTP иногда отвечает ошибкой — как настоящий почтовый провайдер.
const SANDBOX_FAILURE_RATE = 0.08;

const outbox = [];

export async function sendOrderConfirmation(order, user) {
  await deliver(orderConfirmation(order, user));
}

export function listOutbox() {
  return outbox;
}

async function deliver(message, attempt = 1) {
  try {
    await smtpSend(message);
  } catch (err) {
    if (attempt >= MAX_ATTEMPTS) {
      // Письмо не должно ломать оформление заказа: фиксируем и идём дальше.
      Sentry.captureException(err, { extra: { to: message.to, subject: message.subject } });
      return;
    }
    // Сбой провайдера — только предупреждение: письмо уйдёт со следующей попытки.
    Sentry.captureException(err, {
      level: 'warning',
      extra: { to: message.to, subject: message.subject, attempt },
    });
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * attempt));
    await deliver(message, attempt + 1);
  }
}

async function smtpSend(message) {
  if (Math.random() < SANDBOX_FAILURE_RATE) throw new Error('SMTP 421: service not available, try again later');
  outbox.unshift({ id: crypto.randomUUID(), sentAt: new Date().toISOString(), ...message });
  outbox.length = Math.min(outbox.length, OUTBOX_LIMIT);
  console.log(`[mail] → ${message.to}: ${message.subject}`);
}
