import { formatPrice } from '../../lib/money.mjs';

export function orderConfirmation(order, user) {
  const lines = order.items.map((item) => `  • ${item.title} × ${item.qty} — ${formatPrice(item.price * item.qty)}`);
  return {
    to: order.contacts.email || user.email,
    subject: `Заказ ${order.id} оплачен`,
    text: [
      `Здравствуйте, ${user.name}!`,
      '',
      `Мы получили оплату заказа ${order.id} на сумму ${formatPrice(order.total)}.`,
      '',
      'В заказе:',
      ...lines,
      '',
      'Спасибо, что выбрали Plosia!',
      'Команда Plosia',
    ].join('\n'),
  };
}
