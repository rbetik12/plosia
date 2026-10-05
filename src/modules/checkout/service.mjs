import { badRequest, conflict, HttpError, notFound } from '../../lib/errors.mjs';
import { clearCart, getCart, summarize } from '../cart/service.mjs';
import { sendOrderConfirmation } from '../mail/service.mjs';
import { createOrder, findOrder, markPaid } from '../orders/service.mjs';
import { charge } from './murpay.mjs';
import { findPickupPoint } from './pickup.mjs';

export const CITIES = ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург'];

const COURIER_PRICE = 299;
const FREE_COURIER_FROM = 3000;

export function deliveryCost(delivery, amount) {
  if (delivery.type === 'courier') return amount >= FREE_COURIER_FROM ? 0 : COURIER_PRICE;
  return 0;
}

export function placeOrder(user, cart, input = {}) {
  const summary = summarize(cart);
  if (!summary.items.length) throw badRequest('Корзина пуста', 'empty_cart');

  const contacts = validateContacts(input.contacts);
  const delivery = validateDelivery(input.delivery);
  const cost = deliveryCost(delivery, summary.total);

  return createOrder({
    userId: user.id,
    cartId: cart.id,
    items: summary.items.map(({ productId, title, price, qty }) => ({ productId, title, price, qty })),
    subtotal: summary.subtotal,
    discount: summary.discount,
    delivery: { ...delivery, cost },
    total: summary.total + cost,
    contacts,
  });
}

export async function payOrder(user, orderId, card) {
  const order = findOrder(orderId);
  if (!order || order.userId !== user.id) throw notFound('Заказ не найден', 'order_not_found');
  if (order.status !== 'awaiting_payment') throw conflict('Этот заказ уже оплачен', 'already_paid');
  validateCard(card);

  const result = await charge({ orderId: order.id, amount: order.total, card });
  if (result.status !== 'approved') {
    throw new HttpError(402, 'Банк отклонил платёж. Попробуйте другую карту.', 'payment_declined');
  }

  markPaid(order, result.paymentId);
  clearCart(getCart(order.cartId));
  await sendOrderConfirmation(order, user);
  return order;
}

function validateContacts(contacts = {}) {
  const name = String(contacts.name || '').trim();
  const phone = String(contacts.phone || '').trim();
  const email = String(contacts.email || '').trim();
  if (!name) throw badRequest('Укажите имя получателя', 'name_required');
  if (!/^\+?[\d\s()-]{10,18}$/.test(phone)) throw badRequest('Проверьте номер телефона', 'bad_phone');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw badRequest('Проверьте почту', 'bad_email');
  return { name, phone, email };
}

function validateDelivery(delivery = {}) {
  if (delivery.type === 'pickup') {
    const point = findPickupPoint(delivery.pointId);
    if (!point) throw badRequest('Выберите пункт выдачи', 'pickup_point_required');
    return { type: 'pickup', city: point.city, pointId: point.id, address: `${point.title}, ${point.address}` };
  }
  if (delivery.type !== 'courier') throw badRequest('Выберите способ доставки', 'bad_delivery');
  if (!CITIES.includes(delivery.city)) throw badRequest('В этот город мы пока не доставляем', 'bad_city');
  const address = String(delivery.address || '').trim();
  if (address.length < 5) throw badRequest('Укажите адрес доставки', 'address_required');
  return { type: 'courier', city: delivery.city, address };
}

function validateCard(card = {}) {
  const number = String(card.number || '').replace(/\s+/g, '');
  if (!/^\d{16}$/.test(number)) throw badRequest('Номер карты — 16 цифр', 'bad_card');
  const [month, year] = String(card.expiry || '').split('/').map(Number);
  const expires = new Date(2000 + year, month);
  if (!month || month > 12 || !year || expires < new Date()) throw badRequest('Проверьте срок действия карты', 'bad_expiry');
  if (!/^\d{3}$/.test(String(card.cvc || ''))) throw badRequest('CVC — 3 цифры', 'bad_cvc');
  card.number = number;
}
