// Клиент платёжного шлюза MurPay.
// В песочнице шлюз эмулируется: случайная задержка ответа и тестовые карты.
import crypto from 'node:crypto';

// Покупатель не должен ждать оплату дольше пары секунд.
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

// Задержка как у реального шлюза: обычно ~0,7 с, иногда заметно дольше.
function sandboxLatency() {
  const z = Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
  return Math.round(Math.exp(6.55 + 0.8 * z));
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
