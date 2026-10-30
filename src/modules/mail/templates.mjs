import { formatPrice } from '../../lib/money.mjs';

export function orderConfirmation(order, user) {
  const lines = order.items.map((item) => `  • ${item.title} × ${item.qty} — ${formatPrice(item.price * item.qty)}`);
  const delivery =
    order.delivery.type === 'pickup'
      ? `Pick up your order at the pickup point: ${order.delivery.address}. We will let you know when it arrives.`
      : `The courier will bring your order to: ${order.delivery.city}, ${order.delivery.address}.`;
  return {
    to: order.contacts.email || user.email,
    subject: `Purr! Order ${order.id} is paid`,
    text: [
      `Hi, ${user.name}!`,
      '',
      `Payment for order ${order.id} went through — ${formatPrice(order.total)}. Thank you!`,
      '',
      "What's inside:",
      ...lines,
      '',
      delivery,
      '',
      'Purring with joy,',
      'your Plosia',
    ].join('\n'),
  };
}
