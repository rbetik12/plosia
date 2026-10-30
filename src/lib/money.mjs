// All amounts in the shop are in whole rubles.
const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export function formatPrice(amount) {
  return `${formatter.format(amount)} ₽`;
}

export function percentOf(amount, percent) {
  return Math.round((amount * percent) / 100);
}

// VAT that is already included in the price.
export function vatIncluded(amount, rate) {
  return Math.round((amount * rate) / (100 + rate));
}
