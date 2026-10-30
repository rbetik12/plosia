import { PROMOS } from '../../data/promos.mjs';
import { HttpError } from '../../lib/errors.mjs';
import { formatPrice, percentOf } from '../../lib/money.mjs';

// One discount per order, and it cannot exceed half of the items total.
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
  if (!promo) throw new PromoError('No such promo code', 'promo_not_found');
  if (new Date(`${promo.expiresAt}T23:59:59+03:00`) < now) {
    throw new PromoError('This promo code has expired', 'promo_expired');
  }
  if (promo.minSubtotal && subtotal < promo.minSubtotal) {
    throw new PromoError(`This promo code is valid for orders from ${formatPrice(promo.minSubtotal)}`, 'promo_min_subtotal');
  }
}

export function calcDiscount(promo, subtotal) {
  const limit = percentOf(subtotal, MAX_DISCOUNT_PERCENT);
  const discount = promo.kind === 'percent' ? percentOf(subtotal, promo.value) : promo.value;
  return Math.min(discount, limit);
}
