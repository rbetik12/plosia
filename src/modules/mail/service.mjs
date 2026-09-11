// Отправка писем. В демо-окружении письма не уходят наружу,
// а складываются в тестовый ящик — его видно на странице /mail.
import crypto from 'node:crypto';
import { orderConfirmation } from './templates.mjs';

const OUTBOX_LIMIT = 50;
const outbox = [];

export async function sendOrderConfirmation(order, user) {
  await deliver(orderConfirmation(order, user));
}

export function listOutbox() {
  return outbox;
}

async function deliver(message) {
  outbox.unshift({ id: crypto.randomUUID(), sentAt: new Date().toISOString(), ...message });
  outbox.length = Math.min(outbox.length, OUTBOX_LIMIT);
  console.log(`[mail] → ${message.to}: ${message.subject}`);
}
