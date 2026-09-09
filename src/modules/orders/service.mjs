import { SEED_ORDERS } from '../../data/orders.mjs';
import { notFound } from '../../lib/errors.mjs';

const orders = new Map(SEED_ORDERS.map((order) => [order.id, order]));
let seq = 10500;

export const STATUS_TITLES = {
  awaiting_payment: 'Ждёт оплаты',
  paid: 'Оплачен',
  shipped: 'В пути',
  delivered: 'Доставлен',
};

export function createOrder(data) {
  const order = {
    id: `PL-${seq++}`,
    status: 'awaiting_payment',
    createdAt: new Date().toISOString(),
    ...data,
  };
  orders.set(order.id, order);
  return order;
}

export function findOrder(id) {
  return orders.get(id);
}

export function getUserOrder(user, id) {
  const order = orders.get(id);
  if (!order || order.userId !== user.id) throw notFound('Заказ не найден', 'order_not_found');
  return order;
}

export function listUserOrders(userId) {
  return [...orders.values()]
    .filter((order) => order.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function markPaid(order, paymentId) {
  order.status = 'paid';
  order.paymentId = paymentId;
  order.paidAt = new Date().toISOString();
}

export function toOrderDto(order) {
  return {
    id: order.id,
    status: order.status,
    statusTitle: STATUS_TITLES[order.status],
    createdAt: order.createdAt,
    items: order.items,
    subtotal: order.subtotal,
    discount: order.discount,
    delivery: order.delivery,
    total: order.total,
  };
}
