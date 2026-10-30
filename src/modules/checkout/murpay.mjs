// Client for the MurPay payment gateway.
// In the sandbox the gateway is emulated: random response latency and test cards.
import crypto from 'node:crypto';

// The customer should not wait for a payment longer than a couple of seconds.
const TIMEOUT_MS = 2000;

export class PaymentGatewayError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PaymentGatewayError';
    this.status = 504;
  }
}

export async function charge({ orderId, amount, card }) {
  const latency = sandboxLatency();
  if (latency > TIMEOUT_MS) {
    await sleep(TIMEOUT_MS);
    throw new PaymentGatewayError(`MurPay did not respond in ${TIMEOUT_MS}ms (order ${orderId})`);
  }
  await sleep(latency);

  const number = card.number.replace(/\s+/g, '');
  if (number.endsWith('0002')) return { status: 'declined', reason: 'insufficient_funds' };
  return { status: 'approved', paymentId: `mp_${crypto.randomUUID().slice(0, 12)}`, amount };
}

// Latency like a real gateway: usually ~0.7 s, sometimes noticeably longer.
function sandboxLatency() {
  const z = Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
  return Math.round(Math.exp(6.55 + 0.8 * z));
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
