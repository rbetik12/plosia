import { formatPrice } from '../../lib/money.mjs';

export function orderConfirmation(order, user) {
  const lines = order.items.map((item) => `  • ${item.title} × ${item.qty} — ${formatPrice(item.price * item.qty)}`);
  const delivery =
    order.delivery.type === 'pickup'
      ? `Заберите заказ в пункте выдачи: ${order.delivery.address}. Мы напишем, когда он приедет.`
      : `Курьер привезёт заказ по адресу: ${order.delivery.city}, ${order.delivery.address}.`;
  return {
    to: order.contacts.email || user.email,
    subject: `Мурр! Заказ ${order.id} оплачен`,
    text: [
      `${user.name}, привет!`,
      '',
      `Оплата заказа ${order.id} прошла — ${formatPrice(order.total)}. Спасибо!`,
      '',
      'Что внутри:',
      ...lines,
      '',
      delivery,
      '',
      'Мурлыкаем от радости,',
      'ваша Plosia',
    ].join('\n'),
  };
}
