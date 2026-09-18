import { PROMOS } from '../../data/promos.mjs';
import { HttpError } from '../../lib/errors.mjs';
import { formatPrice } from '../../lib/money.mjs';

// Одна скидка на заказ, и она не может быть больше половины суммы товаров.
export const MAX_DISCOUNT_PERCENT = 50;

export class PromoError extends HttpError {
  constructor(message, code) {
    super(400, message, code);
    this.name = 'PromoError';
  }
}

export function findPromo(code) {
  return PROMOS.find((promo) => promo.code === code);
}

export function validatePromo(promo, subtotal, now = new Date()) {
  if (!promo) throw new PromoError('Такого промокода нет', 'promo_not_found');
  if (new Date(`${promo.expiresAt}T23:59:59+03:00`) < now) {
    throw new PromoError('Срок действия промокода истёк', 'promo_expired');
  }
  if (promo.minSubtotal && subtotal < promo.minSubtotal) {
    throw new PromoError(`Промокод действует для заказов от ${formatPrice(promo.minSubtotal)}`, 'promo_min_subtotal');
  }
}

export function calcDiscount(promo, subtotal) {
  const limit = Math.floor((subtotal * MAX_DISCOUNT_PERCENT) / 100);
  const discount = promo.kind === 'percent' ? Math.floor((subtotal * promo.value) / 100) : promo.value;
  return Math.min(discount, limit);
}
