// Sending email. In the demo environment emails do not leave the system,
// they go to a test mailbox, which you can see on the /mail page.
import crypto from 'node:crypto';
import * as Sentry from '@sentry/node';
import { orderConfirmation } from './templates.mjs';

const OUTBOX_LIMIT = 50;
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 300;
// The SMTP sandbox sometimes responds with an error — like a real email provider.
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
      // An email must not break checkout: record the failure and move on.
      Sentry.captureException(err, { extra: { to: message.to, subject: message.subject } });
      return;
    }
    // A provider failure is only a warning: the email will go out on the next attempt.
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
